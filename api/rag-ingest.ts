import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
import pdfParse from 'pdf-parse';

// Requires Pinecone index configured with 768 dimensions (text-embedding-004 output)
export const config = { api: { bodyParser: { sizeLimit: '25mb' } } };

// 500 tokens ≈ 375 words (1 token ≈ 0.75 words)
const MAX_WORDS_PER_CHUNK = 375;

function chunkPageText(text: string): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= MAX_WORDS_PER_CHUNK) return [text.trim()];
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += MAX_WORDS_PER_CHUNK) {
        chunks.push(words.slice(i, i + MAX_WORDS_PER_CHUNK).join(' '));
    }
    return chunks;
}

async function embedText(ai: GoogleGenAI, text: string): Promise<number[]> {
    const res = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
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
        // Parse PDF — form feed character (\f) separates pages in pdf-parse output
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        const pdfData = await pdfParse(pdfBuffer);
        const pages = pdfData.text.split('\f');

        // Build chunks with page provenance
        const chunks: { text: string; page: number; chunkIndex: number }[] = [];
        let globalIndex = 0;
        for (let p = 0; p < pages.length; p++) {
            const pageText = pages[p].trim();
            if (!pageText) continue;
            for (const sub of chunkPageText(pageText)) {
                if (sub.trim()) chunks.push({ text: sub, page: p + 1, chunkIndex: globalIndex++ });
            }
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
        const index = PINECONE_HOST
            ? pc.index(PINECONE_INDEX, PINECONE_HOST)
            : pc.index(PINECONE_INDEX);

        const docId = `${board}-${grade}-${subject}-${medium}`
            .toLowerCase().replace(/\s+/g, '-');

        // Embed and upsert in batches of 10 to stay within rate limits
        const BATCH = 10;
        let upserted = 0;
        for (let i = 0; i < chunks.length; i += BATCH) {
            const batch = chunks.slice(i, i + BATCH);
            const vectors = await Promise.all(
                batch.map(async (chunk) => ({
                    id: `${docId}-${chunk.chunkIndex}`,
                    values: await embedText(ai, chunk.text),
                    metadata: {
                        board,
                        grade,
                        subject,
                        medium,
                        page: chunk.page,
                        chunkIndex: chunk.chunkIndex,
                        text: chunk.text.slice(0, 1000), // Pinecone metadata string limit
                    },
                }))
            );
            await index.upsert(vectors);
            upserted += vectors.length;
        }

        return res.status(200).json({
            success: true,
            chunksIngested: upserted,
            totalPages: pages.filter(p => p.trim()).length,
        });
    } catch (error: any) {
        console.error('RAG ingest error:', error);
        return res.status(500).json({ error: error.message ?? 'Ingestion failed' });
    }
}
