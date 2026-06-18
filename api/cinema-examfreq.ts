import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchExamFrequency } from './_rag';

// Separate lightweight endpoint for RAG exam year frequency.
// Called by frontend after cinema loads — doesn't block cinema generation.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const { topic, subject, grade } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic required' });
    try {
        const freq = await fetchExamFrequency({ query: topic, subject: subject || '', grade: grade || '10' });
        return res.status(200).json(freq);
    } catch (error) {
        return res.status(200).json({ years: [], count: 0 }); // non-fatal
    }
}
