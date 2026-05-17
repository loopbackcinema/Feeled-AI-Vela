import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
        ),
    ]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { question, userAnswer, correctAnswer, subject } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question required' });

    const apiKey = process.env.API_KEY || '';

    try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a helpful tutor for Grade 10 TN Samacheer students.

Question: ${question}
Subject: ${subject || 'General'}
Student answered: "${userAnswer || '(no answer)'}"
Correct answer: "${correctAnswer || 'See explanation'}"

Explain in 2-3 simple encouraging sentences:
1. Why the correct answer is right
2. The key concept to remember

Keep it simple, positive, and easy for a 10th grade student to understand.`;

        const response = await withTimeout(
            ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }),
            8000
        );

        const explanation = (response as any).text || (response as any).candidates?.[0]?.content?.parts?.[0]?.text || 'Keep practicing this concept!';

        return res.status(200).json({ explanation });

    } catch (err: any) {
        console.error('exam-explain error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
