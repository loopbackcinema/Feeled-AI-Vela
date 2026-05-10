import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import * as fs   from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import { Pinecone }    from '@pinecone-database/pinecone';
import type { PineconeRecord } from '@pinecone-database/pinecone';

// pdf-parse is CommonJS-only — use createRequire for ESM compat
const require  = createRequire(import.meta.url);
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const pdfParse = async (buffer: Buffer): Promise<{text: string, numpages: number}> => {
  const doc = await pdfjsLib.getDocument({data: new Uint8Array(buffer)}).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return { text, numpages: doc.numPages };
};
// ── Tuning constants ─────────────────────────────────────────────────────────
const MAX_WORDS   = 300;   // tighter, more focused chunks
const OVERLAP     = 40;    // word overlap between adjacent chunks (context bridge)
const TEXT_LIMIT  = 1500;  // chars stored in Pinecone metadata

// ── Chapter heading detector ─────────────────────────────────────────────────
function detectChapterHeading(
    line: string,
): { chapterNum: number; chapterTitle: string } | null {
    const l = line.trim();
    if (!l || l.length < 4 || l.length > 100) return null;

    // "CHAPTER 3", "Chapter 3 - Cell Biology", "Chapter 3: Cell Biology"
    let m = l.match(/^(?:CHAPTER|Chapter)\s+(\d+)[:\s\-–]*(.*)/i);
    if (m) return { chapterNum: parseInt(m[1], 10), chapterTitle: l.slice(0, 70) };

    // "UNIT 2 - Electricity", "Unit 2"
    m = l.match(/^(?:UNIT|Unit)\s+(\d+)[:\s\-–]*(.*)/i);
    if (m) return { chapterNum: parseInt(m[1], 10), chapterTitle: l.slice(0, 70) };

    // Pure ALL-CAPS line (e.g. "HEREDITY AND EVOLUTION") — treat as chapter
    if (l === l.toUpperCase() && /[A-Z]{4,}/.test(l) && l.length >= 6 && l.length <= 80) {
        return { chapterNum: 0, chapterTitle: l.slice(0, 70) };
    }

    return null;
}

// ── Chunk-type classifier ────────────────────────────────────────────────────
type ChunkType = 'formula' | 'example' | 'definition' | 'exercise' | 'summary' | 'text';

function detectChunkType(text: string): ChunkType {
    if (/formula\s*[:\-]|[A-Z]\s*=\s*[A-Z0-9]|[²³√∑∴∵×÷]|\d+\s*[+\-×÷]\s*\d+\s*=/.test(text))
        return 'formula';
    if (/\bExample\s*\d*\s*[:\-]|\bFor example\b|\be\.g\.\b|\bFor instance\b/i.test(text))
        return 'example';
    if (/\bDefinition\s*[:\-]|\bis defined as\b|\bis called\b|\bis known as\b|\brefers to\b/i.test(text))
        return 'definition';
    if (/\bExercise\b|\bIn-text [Qq]uestions?\b|\bActivity\s*\d|\bFill in|\bMatch the following/i.test(text))
        return 'exercise';
    if (/\bSummary\b|\bKey [Pp]oints?\b|\bPoints to Remember\b|\bWhat We Have Learnt\b/i.test(text))
        return 'summary';
    return 'text';
}

// ── Overlapping word-level chunker ───────────────────────────────────────────
function chunkText(text: string): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= MAX_WORDS) return [text.trim()];

    const chunks: string[] = [];
    let i = 0;
    while (i < words.length) {
        const end = Math.min(i + MAX_WORDS, words.length);
        chunks.push(words.slice(i, end).join(' '));
        if (end === words.length) break;
        i += MAX_WORDS - OVERLAP;
    }
    return chunks;
}

// ── Env loader ───────────────────────────────────────────────────────────────
export function loadEnvLocal(): Record<string, string> {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const env: Record<string, string> = {};
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
    return env;
}

// ── Embed with retry ─────────────────────────────────────────────────────────
async function embedText(ai: GoogleGenAI, text: string, retries = 3): Promise<number[]> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const res = await ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: text,
                config: { outputDimensionality: 768 },
            });
            return (res as any).embedding?.values ?? (res as any).embeddings?.[0]?.values ?? [];
        } catch (err: any) {
            if (attempt < retries - 1 && (err?.status === 429 || err?.code === 429)) {
                await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
    return [];
}

// ── Types ────────────────────────────────────────────────────────────────────
export type ProgressEvent =
    | { phase: 'parsed';  pages: number; chunks: number }
    | { phase: 'upload';  uploaded: number; total: number };

export interface IngestOptions {
    pdfPath: string;
    subject: string;
    medium:  string;
    grade?:  string;
    board?:  string;
    env?:    Record<string, string>;
    onProgress?: (event: ProgressEvent) => void;
}

export interface IngestResult {
    chunksIngested: number;
    totalPages:     number;
    elapsedSec:     number;
    chaptersFound:  string[];
}

interface ChunkRecord {
    text:       string;
    page:       number;
    chapter:    string;
    chapterNum: number;
    chunkType:  string;
    chunkIndex: number;
}

// ── Main ingest function ─────────────────────────────────────────────────────
export async function ingestPdf(opts: IngestOptions): Promise<IngestResult> {
    const {
        pdfPath, subject, medium,
        grade = '10',
        board = 'TN Samacheer',
        env   = {},
        onProgress,
    } = opts;

    const apiKey        = env.API_KEY          ?? process.env.API_KEY          ?? '';
    const pineconeKey   = env.PINECONE_API_KEY  ?? process.env.PINECONE_API_KEY  ?? '';
    const pineconeIndex = env.PINECONE_INDEX    ?? process.env.PINECONE_INDEX    ?? '';
    const pineconeHost  = env.PINECONE_HOST     ?? process.env.PINECONE_HOST     ?? '';

    if (!apiKey || !pineconeKey || !pineconeIndex) {
        throw new Error('Missing API_KEY, PINECONE_API_KEY, or PINECONE_INDEX in .env.local');
    }

    // Parse PDF — pdfParse returns { text: string, numpages: number }
    // Pages are delimited by form-feed characters (\f) in the text output
    const pdfBuffer  = fs.readFileSync(pdfPath);
    const pdfData    = await pdfParse(pdfBuffer);
    const pages      = pdfData.text.split('\f');
    const totalPages = pdfData.numpages;

    // Build chunks with chapter + chunkType metadata
    const chunks: ChunkRecord[] = [];
    let globalIndex       = 0;
    let currentChapter    = 'Introduction';
    let currentChapterNum = 0;
    const chaptersFound   = new Set<string>();

    for (let p = 0; p < pages.length; p++) {
        const pageText = pages[p].trim();
        if (!pageText) continue;

        // Scan first 8 lines of each page for a chapter heading
        const pageLines = pageText.split('\n');
        for (const line of pageLines.slice(0, 8)) {
            const heading = detectChapterHeading(line);
            if (heading) {
                currentChapter    = heading.chapterTitle;
                if (heading.chapterNum > 0) currentChapterNum = heading.chapterNum;
                chaptersFound.add(currentChapter);
                break;
            }
        }

        for (const sub of chunkText(pageText)) {
            if (!sub.trim()) continue;
            chunks.push({
                text:       sub,
                page:       p + 1,
                chapter:    currentChapter,
                chapterNum: currentChapterNum,
                chunkType:  detectChunkType(sub),
                chunkIndex: globalIndex++,
            });
        }
    }

    onProgress?.({ phase: 'parsed', pages: totalPages, chunks: chunks.length });

    // Connect to Pinecone
    const ai    = new GoogleGenAI({ apiKey });
    const pc    = new Pinecone({ apiKey: pineconeKey });
    const index = pineconeHost
        ? pc.index(pineconeIndex, pineconeHost)
        : pc.index(pineconeIndex);

    const docId = `${board}-${grade}-${subject}-${medium}`
        .toLowerCase().replace(/\s+/g, '-');

    // Embed and upsert in batches of 10
    const BATCH     = 10;
    let upserted    = 0;
    const startTime = Date.now();

    for (let i = 0; i < chunks.length; i += BATCH) {
        const batch = chunks.slice(i, i + BATCH);
        const records: PineconeRecord[] = await Promise.all(
            batch.map(async (chunk) => ({
                id:     `${docId}-${chunk.chunkIndex}`,
                values: await embedText(ai, chunk.text),
                metadata: {
                    board,
                    grade,
                    subject,
                    medium,
                    chapter:    chunk.chapter,
                    chapterNum: chunk.chapterNum,
                    chunkType:  chunk.chunkType,
                    page:       chunk.page,
                    chunkIndex: chunk.chunkIndex,
                    text:       chunk.text.slice(0, TEXT_LIMIT),
                },
            }))
        );
        await index.upsert({ records });
        upserted += records.length;
        onProgress?.({ phase: 'upload', uploaded: upserted, total: chunks.length });
        if (i + BATCH < chunks.length) await new Promise(r => setTimeout(r, 200));
    }

    return {
        chunksIngested: upserted,
        totalPages,
        elapsedSec:    (Date.now() - startTime) / 1000,
        chaptersFound: [...chaptersFound],
    };
}

// ── CLI entry point ───────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
if (path.resolve(process.argv[1] ?? '') === path.resolve(__filename)) {
    const [,, pdfPath, subject, medium, grade = '10'] = process.argv;

    if (!pdfPath || !subject || !medium) {
        console.error('Usage: npm run ingest <pdfPath> <subject> <medium> [grade]');
        console.error('Example: npm run ingest ./pdfs/science.pdf Science English 10');
        process.exit(1);
    }

    const absolutePath = path.resolve(pdfPath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        process.exit(1);
    }

    const env    = loadEnvLocal();
    const stat   = fs.statSync(absolutePath);
    const sizeMb = (stat.size / 1024 / 1024).toFixed(2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FeelEd AI — Syllabus Ingestion v2');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  File    : ${path.basename(absolutePath)} (${sizeMb} MB)`);
    console.log(`  Subject : ${subject}`);
    console.log(`  Grade   : ${grade}`);
    console.log(`  Medium  : ${medium}`);
    console.log(`  Board   : TN Samacheer`);
    console.log(`  Chunking: ${MAX_WORDS} words max, ${OVERLAP} word overlap`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n  Parsing PDF and building chunks...');

    let lastLogged = 0;
    ingestPdf({
        pdfPath: absolutePath,
        subject,
        medium,
        grade,
        env,
        onProgress: (event) => {
            if (event.phase === 'parsed') {
                console.log(`  ${event.chunks} chunks across ${event.pages} pages`);
                process.stdout.write(`  Uploading: 0/${event.chunks}...`);
            } else {
                const { uploaded, total } = event;
                if (uploaded === total || uploaded - lastLogged >= 50) {
                    process.stdout.write(`\r  Uploading: ${uploaded}/${total}...   `);
                    lastLogged = uploaded;
                }
            }
        },
    }).then(({ chunksIngested, totalPages, elapsedSec, chaptersFound }) => {
        console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`  Pages parsed  : ${totalPages}`);
        console.log(`  Chunks stored : ${chunksIngested}`);
        console.log(`  Chapters found: ${chaptersFound.length}`);
        if (chaptersFound.length > 0) {
            chaptersFound.forEach(c => console.log(`    • ${c}`));
        }
        console.log(`  Time elapsed  : ${elapsedSec.toFixed(1)}s`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log('\n  Ingestion complete. Pinecone vectors are ready.\n');
    }).catch((err: any) => {
        console.error('\n  Error:', err.message ?? err);
        process.exit(1);
    });
}
