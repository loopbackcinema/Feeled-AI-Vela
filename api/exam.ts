import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { fetchRagContext, normaliseGrade, effectiveMedium } from './_rag.js';

const schema = {
    type: Type.OBJECT,
    properties: {
        importantQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        revisionNotes:      { type: Type.ARRAY, items: { type: Type.STRING } },
        predictedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['importantQuestions', 'revisionNotes', 'predictedQuestions'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { topic, context } = req.body;
        const medium = effectiveMedium(context.language === 'Tamil' ? 'Tamil' : 'English');
        const grade  = normaliseGrade(context.standard ?? '');

        const { context: ragContext, chunksFound, citations, scores } = await fetchRagContext({
            query:   topic,
            subject: context.subject,
            grade,
            medium,
            board:   context.board ?? 'TN Samacheer',
        });

        console.log(`[exam] grade="${grade}" subject="${context.subject}" medium="${medium}" RAG=${chunksFound} scores=[${scores.join(',')}]`);

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, English Medium):\n${ragContext}\n\nBase your importantQuestions, revisionNotes, and predictedQuestions DIRECTLY on the above textbook content.`
            : 'No textbook excerpt available — generate from general academic knowledge.';

        const prompt = `You are an expert academic tutor preparing a student for an exam tomorrow.
Topic: ${topic}
Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}
Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.

${ragSection}

CRITICAL RULES:
1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
2. Keep output concise and scannable.
3. importantQuestions: 5-10 highly probable exam questions from the textbook.
4. revisionNotes: Quick bullet points for last-minute revision — key facts from the textbook.
5. predictedQuestions: 3 tricky or high-value predicted questions aligned to the syllabus.
6. Write every question and note in ${context.language} only.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: schema },
        });

        if (!response.text) throw new Error('Empty response');
        const data = JSON.parse(response.text.trim());
        res.status(200).json({ ...data, ragCitations: citations });
    } catch (error) {
        console.error('Exam API Error:', error);
        res.status(500).json({ error: 'Failed to generate exam prep' });
    }
}
