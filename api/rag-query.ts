import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchRagContext, normaliseGrade, effectiveMedium } from './_rag.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { question, board, grade, subject, language, medium: mediumParam } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    const lang       = language || 'English';
    const medium     = effectiveMedium(mediumParam || (lang === 'Tamil' ? 'Tamil' : 'English'));
    const normGrade  = normaliseGrade(grade ?? '10');

    try {
        const result = await fetchRagContext({
            query:   question,
            subject: subject || 'General',
            grade:   normGrade,
            medium,
            board:   board || 'TN Samacheer',
        });

        return res.status(200).json({
            context:     result.context,
            chunksFound: result.chunksFound,
            citations:   result.citations,
            scores:      result.scores,
        });
    } catch (error: any) {
        console.error('RAG query error:', error);
        return res.status(500).json({ error: error.message ?? 'Query failed' });
    }
}
