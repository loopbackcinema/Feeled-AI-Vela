import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { PDFParse } from 'pdf-parse';
import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import type { PineconeRecord } from '@pinecone-database/pinecone';

const MAX_WORDS_PER_CHUNK = 375; // ≈ 500 tokens (1 token ≈ 0.75 words)

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

function chunkText(text: string): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= MAX_WORDS_PER_CHUNK) return [text.trim()];
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += MAX_WORDS_PER_CHUNK) {
        chunks.push(words.slice(i, i + MAX_WORDS_PER_CHUNK).join(' '));
    }
    return chunks;
}

async function embedText(ai: GoogleGenAI, text: string, retries = 3): Promise<number[]> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const res = await ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: text,
                config: { outputDimensionality: 768 }, // match Pinecone index dimension
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

export type ProgressEvent =
    | { phase: 'parsed'; pages: number; chunks: number }
    | { phase: 'upload'; uploaded: number; total: number };

export interface IngestOptions {
    pdfPath: string;
    subject: string;
    medium: string;
    grade?: string;
    board?: string;
    env?: Record<string, string>;
    onProgress?: (event: ProgressEvent) => void;
}

export interface IngestResult {
    chunksIngested: number;
    totalPages: number;
    elapsedSec: number;
}

export async function ingestPdf(opts: IngestOptions): Promise<IngestResult> {
    const {
        pdfPath,
        subject,
        medium,
        grade = '10',
        board = 'TN Samacheer',
        env = {},
        onProgress,
    } = opts;

    const apiKey        = env.API_KEY          ?? process.env.API_KEY          ?? '';
    const pineconeKey   = env.PINECONE_API_KEY  ?? process.env.PINECONE_API_KEY  ?? '';
    const pineconeIndex = env.PINECONE_INDEX    ?? process.env.PINECONE_INDEX    ?? '';
    const pineconeHost  = env.PINECONE_HOST     ?? process.env.PINECONE_HOST     ?? '';

    if (!apiKey || !pineconeKey || !pineconeIndex) {
        throw new Error('Missing API_KEY, PINECONE_API_KEY, or PINECONE_INDEX in .env.local');
    }

    // pdf-parse v2: class-based API — new PDFParse({ data }) → getText() → { pages, total }
    const pdfBuffer = fs.readFileSync(pdfPath);
    const parser    = new PDFParse({ data: pdfBuffer });
    const pdfData   = await parser.getText();
    await parser.destroy();

    const chunks: { text: string; page: number; chunkIndex: number }[] = [];
    let globalIndex = 0;
    for (const { text, num } of pdfData.pages) {
        const pageText = text.trim();
        if (!pageText) continue;
        for (const sub of chunkText(pageText)) {
            if (sub.trim()) chunks.push({ text: sub, page: num, chunkIndex: globalIndex++ });
        }
    }

    const totalPages = pdfData.total;
    onProgress?.({ phase: 'parsed', pages: totalPages, chunks: chunks.length });

    const ai    = new GoogleGenAI({ apiKey });
    const pc    = new Pinecone({ apiKey: pineconeKey });
    const index = pineconeHost ? pc.index(pineconeIndex, pineconeHost) : pc.index(pineconeIndex);

    const docId = `${board}-${grade}-${subject}-${medium}`
        .toLowerCase().replace(/\s+/g, '-');

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
                    page:       chunk.page,
                    chunkIndex: chunk.chunkIndex,
                    text:       chunk.text.slice(0, 1000), // Pinecone metadata string limit
                },
            }))
        );
        await index.upsert({ records });
        upserted += records.length;
        onProgress?.({ phase: 'upload', uploaded: upserted, total: chunks.length });
        if (i + BATCH < chunks.length) await new Promise(r => setTimeout(r, 200));
    }

    return { chunksIngested: upserted, totalPages, elapsedSec: (Date.now() - startTime) / 1000 };
}

// ─── CLI entry point ───────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
if (path.resolve(process.argv[1] ?? '') === path.resolve(__filename)) {
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

    const env    = loadEnvLocal();
    const stat   = fs.statSync(absolutePath);
    const sizeMb = (stat.size / 1024 / 1024).toFixed(2);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FeelEd AI — Syllabus Ingestion');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  File    : ${path.basename(absolutePath)} (${sizeMb} MB)`);
    console.log(`  Subject : ${subject}`);
    console.log(`  Grade   : 10`);
    console.log(`  Medium  : ${medium}`);
    console.log(`  Board   : TN Samacheer`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n  Parsing PDF and building chunks...');

    let lastLogged = 0;
    ingestPdf({
        pdfPath: absolutePath,
        subject,
        medium,
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
    }).then(({ chunksIngested, totalPages, elapsedSec }) => {
        console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`  Pages parsed  : ${totalPages}`);
        console.log(`  Chunks stored : ${chunksIngested}`);
        console.log(`  Time elapsed  : ${elapsedSec.toFixed(1)}s`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log('\n  Ingestion complete. Pinecone vectors are ready.\n');
    }).catch((err: any) => {
        console.error('\n  Error:', err.message ?? err);
        process.exit(1);
    });
}
