import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pinecone } from '@pinecone-database/pinecone';
import type { PineconeRecord } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
// pdf-parse is CommonJS-only — no default ESM export
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>;

// Pinecone index must be configured with 768 dimensions (gemini-embedding-001 output)
export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

const MAX_WORDS  = 300;   // ↓ from 375
const OVERLAP    = 40;    // word overlap between chunks
const TEXT_LIMIT = 1500;  // chars stored in metadata (↑ from 1000)

// ── Chapter heading detector ─────────────────────────────────────────────────
function detectChapterHeading(line: string): { chapterNum: number; chapterTitle: string } | null {
    const l = line.trim();
    if (!l || l.length < 4 || l.length > 100) return null;

    let m = l.match(/^(?:CHAPTER|Chapter)\s+(\d+)[:\s\-–]*(.*)/i);
    if (m) return { chapterNum: parseInt(m[1], 10), chapterTitle: l.slice(0, 70) };

    m = l.match(/^(?:UNIT|Unit)\s+(\d+)[:\s\-–]*(.*)/i);
    if (m) return { chapterNum: parseInt(m[1], 10), chapterTitle: l.slice(0, 70) };

    if (l === l.toUpperCase() && /[A-Z]{4,}/.test(l) && l.length >= 6 && l.length <= 80) {
        return { chapterNum: 0, chapterTitle: l.slice(0, 70) };
    }
    return null;
}

// ── Chunk-type classifier ────────────────────────────────────────────────────
function detectChunkType(text: string): string {
    if (/formula\s*[:\-]|[A-Z]\s*=\s*[A-Z0-9]|[²³√∑∴∵×÷]/.test(text)) return 'formula';
    if (/\bExample\s*\d*\s*[:\-]|\bFor example\b|\be\.g\.\b/i.test(text))  return 'example';
    if (/\bDefinition\s*[:\-]|\bis defined as\b|\bis called\b/i.test(text)) return 'definition';
    if (/\bExercise\b|\bIn-text [Qq]uestions?\b|\bActivity\s*\d/i.test(text)) return 'exercise';
    if (/\bSummary\b|\bKey [Pp]oints?\b|\bPoints to Remember\b/i.test(text)) return 'summary';
    return 'text';
}

// ── Overlapping chunker ───────────────────────────────────────────────────────
function chunkPageText(text: string): string[] {
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

async function embedText(ai: GoogleGenAI, text: string): Promise<number[]> {
    const res = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text,
        config: { outputDimensionality: 768 },
    });
    return (res as any).embedding?.values ?? (res as any).embeddings?.[0]?.values ?? [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { API_KEY, PINECONE_API_KEY, PINECONE_INDEX, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX) {
        return res.status(500).json({ error: 'Missing required environment variables' });
    }

    const { pdfBase64, subject, grade, medium, board = 'TN Samacheer' } = req.body;
    if (!pdfBase64 || !subject || !grade || !medium) {
        return res.status(400).json({ error: 'pdfBase64, subject, grade, and medium are required' });
    }

    try {
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const pdfData   = await pdfParse(pdfBuffer);
        const pages     = pdfData.text.split('\f');

        interface ChunkRecord {
            text: string; page: number; chapter: string;
            chapterNum: number; chunkType: string; chunkIndex: number;
        }

        const chunks: ChunkRecord[] = [];
        let globalIndex    = 0;
        let currentChapter    = 'Introduction';
        let currentChapterNum = 0;

        for (let p = 0; p < pages.length; p++) {
            const pageText = pages[p].trim();
            if (!pageText) continue;

            // Chapter detection
            const pageLines = pageText.split('\n');
            for (const line of pageLines.slice(0, 8)) {
                const heading = detectChapterHeading(line);
                if (heading) {
                    currentChapter    = heading.chapterTitle;
                    if (heading.chapterNum > 0) currentChapterNum = heading.chapterNum;
                    break;
                }
            }

            for (const sub of chunkPageText(pageText)) {
                if (sub.trim()) chunks.push({
                    text: sub, page: p + 1,
                    chapter: currentChapter, chapterNum: currentChapterNum,
                    chunkType: detectChunkType(sub),
                    chunkIndex: globalIndex++,
                });
            }
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
        const index = PINECONE_HOST
            ? pc.index(PINECONE_INDEX, PINECONE_HOST)
            : pc.index(PINECONE_INDEX);

        const docId = `${board}-${grade}-${subject}-${medium}`
            .toLowerCase().replace(/\s+/g, '-');

        const BATCH = 10;
        let upserted = 0;
        for (let i = 0; i < chunks.length; i += BATCH) {
            const batch = chunks.slice(i, i + BATCH);
            const records: PineconeRecord[] = await Promise.all(
                batch.map(async (chunk) => ({
                    id:     `${docId}-${chunk.chunkIndex}`,
                    values: await embedText(ai, chunk.text),
                    metadata: {
                        board, grade, subject, medium,
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
        }

        return res.status(200).json({
            success: true,
            chunksIngested: upserted,
            totalPages: pages.filter((p: string) => p.trim()).length,
        });
    } catch (error: any) {
        console.error('RAG ingest error:', error);
        return res.status(500).json({ error: error.message ?? 'Ingestion failed' });
    }
}
