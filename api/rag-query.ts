import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { API_KEY, PINECONE_API_KEY, PINECONE_INDEX, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX) {
        return res.status(500).json({ error: 'Missing required environment variables' });
    }

    const { question, board, grade, subject, medium } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
        const index = PINECONE_HOST
            ? pc.index(PINECONE_INDEX, PINECONE_HOST)
            : pc.index(PINECONE_INDEX);

        // Embed the question
        const embRes = await ai.models.embedContent({
            model: 'text-embedding-004',
            contents: question,
        });
        const queryVector: number[] =
            (embRes as any).embedding?.values ??
            (embRes as any).embeddings?.[0]?.values ?? [];

        if (queryVector.length === 0) {
            return res.status(500).json({ error: 'Embedding returned empty vector' });
        }

        // Optional metadata filter — only include fields that are provided
        const filter: Record<string, { $eq: string }> = {};
        if (subject) filter.subject = { $eq: subject };
        if (grade)   filter.grade   = { $eq: grade };
        if (medium)  filter.medium  = { $eq: medium };
        if (board)   filter.board   = { $eq: board };

        const result = await index.query({
            vector: queryVector,
            topK: 5,
            includeMetadata: true,
            ...(Object.keys(filter).length > 0 ? { filter } : {}),
        });

        const context = (result.matches ?? [])
            .filter(m => (m.score ?? 0) > 0.4)
            .map(m => ({
                text:    m.metadata?.text    as string,
                score:   m.score,
                page:    m.metadata?.page    as number,
                subject: m.metadata?.subject as string,
                grade:   m.metadata?.grade   as string,
            }));

        return res.status(200).json({ context });
    } catch (error: any) {
        console.error('RAG query error:', error);
        return res.status(500).json({ error: error.message ?? 'Query failed' });
    }
}
