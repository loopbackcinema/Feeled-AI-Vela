import * as fs from 'fs';
import * as path from 'path';

const [,, pdfPath, subject, medium] = process.argv;

if (!pdfPath || !subject || !medium) {
    console.error('Usage: npm run ingest <pdfPath> <subject> <medium>');
    console.error('Example: npm run ingest ./pdfs/science.pdf Science English');
    process.exit(1);
}

const absolutePath = path.resolve(pdfPath);
if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
}

const grade  = '10';
const board  = 'TN Samacheer';
const url    = 'http://localhost:3000/api/rag-ingest';

async function main() {
    const stat = fs.statSync(absolutePath);
    const sizeMb = (stat.size / 1024 / 1024).toFixed(2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FeelEd AI — Syllabus Ingestion');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  File    : ${path.basename(absolutePath)} (${sizeMb} MB)`);
    console.log(`  Subject : ${subject}`);
    console.log(`  Grade   : ${grade}`);
    console.log(`  Medium  : ${medium}`);
    console.log(`  Board   : ${board}`);
    console.log(`  Target  : ${url}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n[1/3] Reading PDF...');
    const pdfBuffer = fs.readFileSync(absolutePath);
    const pdfBase64 = pdfBuffer.toString('base64');
    console.log(`      Done — ${(pdfBase64.length / 1024).toFixed(0)} KB base64`);

    console.log('\n[2/3] Uploading to RAG ingest API...');
    console.log('      (This may take 1–3 minutes for large PDFs)');

    const startTime = Date.now();
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64, subject, grade, medium, board }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!res.ok) {
        let errBody = '';
        try { errBody = JSON.stringify(await res.json(), null, 2); } catch { errBody = await res.text(); }
        console.error(`\n✗ API error ${res.status} after ${elapsed}s:`);
        console.error(errBody);
        process.exit(1);
    }

    const data = await res.json() as { success: boolean; chunksIngested: number; totalPages: number };

    console.log(`\n[3/3] Done in ${elapsed}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Pages parsed  : ${data.totalPages}`);
    console.log(`  Chunks stored : ${data.chunksIngested}`);
    console.log(`  Index         : feeled-ai-syllabus`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✓ Ingestion complete. Pinecone vectors are ready.\n');
}

main().catch(err => {
    console.error('\n✗ Unexpected error:', err.message ?? err);
    process.exit(1);
});
