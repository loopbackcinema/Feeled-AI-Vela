import * as fs   from 'fs';
import * as path from 'path';
import { ingestPdf, loadEnvLocal } from './ingest-pdf.ts';

const MEDIUM_MAP: Record<string, string> = {
    EN: 'English',
    TM: 'Tamil',
};

// Extract subject from filename patterns like:
//   Class_10_Science_English_Medium.pdf
//   Class_10_Maths-EM.pdf
//   Class_10_Social_Science.pdf
function extractSubject(filename: string): string {
    const base  = path.basename(filename, '.pdf');
    const match = base.match(/^Class_\d+_(.+?)(?:_(English|Tamil)_Medium|-)/);
    if (match) return match[1].replace(/_/g, ' ');
    return base.replace(/^Class_\d+_/, '').split(/[_-]/)[0].replace(/_/g, ' ');
}

// Extract grade from filename, e.g. Class_10_... → "10"
function extractGrade(filename: string): string {
    const m = filename.match(/Class_(\d+)/);
    return m ? m[1] : '10';
}

interface PdfTask {
    filePath: string;
    filename: string;
    subject:  string;
    medium:   string;
    grade:    string;
    sizeMb:   string;
}

async function main() {
    const [,, folderArg] = process.argv;
    if (!folderArg) {
        console.error('Usage: npm run ingest-all <folderPath>');
        console.error('Example: npm run ingest-all "C:\\Users\\Edit pc\\Desktop\\Feeled AI RAG"');
        process.exit(1);
    }

    const rootFolder = path.resolve(folderArg);
    if (!fs.existsSync(rootFolder)) {
        console.error(`Folder not found: ${rootFolder}`);
        process.exit(1);
    }

    const env = loadEnvLocal();

    // Collect tasks from EN/ and TM/ subfolders
    const tasks: PdfTask[] = [];
    for (const [subdir, medium] of Object.entries(MEDIUM_MAP)) {
        const subdirPath = path.join(rootFolder, subdir);
        if (!fs.existsSync(subdirPath)) {
            console.warn(`  Skipping: ${subdir}/ not found in ${rootFolder}`);
            continue;
        }
        const files = fs.readdirSync(subdirPath)
            .filter(f => f.toLowerCase().endsWith('.pdf'))
            .sort();
        for (const filename of files) {
            const filePath = path.join(subdirPath, filename);
            const stat     = fs.statSync(filePath);
            tasks.push({
                filePath,
                filename,
                subject: extractSubject(filename),
                medium,
                grade:   extractGrade(filename),
                sizeMb:  (stat.size / 1024 / 1024).toFixed(1),
            });
        }
    }

    if (tasks.length === 0) {
        console.error('No PDF files found. Expected EN/ and TM/ subfolders inside the given path.');
        process.exit(1);
    }

    const enCount      = tasks.filter(t => t.medium === 'English').length;
    const tmCount      = tasks.filter(t => t.medium === 'Tamil').length;
    const overallStart = Date.now();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FeelEd AI — Batch Syllabus Ingestion v2');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Folder  : ${rootFolder}`);
    console.log(`  Files   : ${tasks.length} total  (${enCount} English, ${tmCount} Tamil)`);
    console.log(`  Board   : TN Samacheer`);
    console.log(`  Chunking: 300 words max, 40 word overlap, chapter-aware`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    type OkResult   = { task: PdfTask; ok: true;  chunks: number; pages: number; chapters: number; elapsed: number };
    type ErrResult  = { task: PdfTask; ok: false; error: string };
    type Result     = OkResult | ErrResult;

    const results: Result[] = [];

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        console.log(`[${i + 1}/${tasks.length}] Grade ${task.grade} ${task.medium} — ${task.subject}`);
        console.log(`  File    : ${task.filename} (${task.sizeMb} MB)`);
        console.log(`  Parsing PDF...`);

        let lastLogged = 0;
        try {
            const result = await ingestPdf({
                pdfPath:  task.filePath,
                subject:  task.subject,
                medium:   task.medium,
                grade:    task.grade,
                env,
                onProgress: (event) => {
                    if (event.phase === 'parsed') {
                        console.log(`  Chunks  : ${event.chunks} across ${event.pages} pages`);
                        process.stdout.write(`  Upload  : 0/${event.chunks}...`);
                    } else {
                        const { uploaded, total } = event;
                        if (uploaded === total || uploaded - lastLogged >= 100) {
                            process.stdout.write(`\r  Upload  : ${uploaded}/${total}...   `);
                            lastLogged = uploaded;
                        }
                    }
                },
            });
            process.stdout.write(`\r  Upload  : ${result.chunksIngested}/${result.chunksIngested} done   \n`);
            console.log(`  Chapters: ${result.chaptersFound.length} detected`);
            console.log(`  Elapsed : ${result.elapsedSec.toFixed(1)}s\n`);
            results.push({
                task, ok: true,
                chunks:   result.chunksIngested,
                pages:    result.totalPages,
                chapters: result.chaptersFound.length,
                elapsed:  result.elapsedSec,
            });
        } catch (err: any) {
            console.error(`  ERROR   : ${err.message ?? err}\n`);
            results.push({ task, ok: false, error: err.message ?? String(err) });
        }
    }

    const succeeded    = results.filter((r): r is OkResult  => r.ok);
    const failed       = results.filter((r): r is ErrResult => !r.ok);
    const totalChunks  = succeeded.reduce((sum, r) => sum + r.chunks, 0);
    const totalElapsed = ((Date.now() - overallStart) / 1000).toFixed(0);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  BATCH INGESTION COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Files     : ${succeeded.length}/${tasks.length} succeeded`);
    console.log(`  Vectors   : ${totalChunks.toLocaleString()} total in Pinecone`);
    console.log(`  Total time: ${totalElapsed}s`);
    if (failed.length > 0) {
        console.log('\n  FAILED:');
        for (const r of failed) {
            console.log(`    [${r.task.medium}] Grade ${r.task.grade} ${r.task.filename}`);
            console.log(`    => ${r.error}`);
        }
    }
    console.log('\n  Re-ingest command for a single file:');
    console.log('  npm run ingest <pdfPath> <subject> <medium> <grade>');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
    console.error('Fatal:', err.message ?? err);
    process.exit(1);
});
