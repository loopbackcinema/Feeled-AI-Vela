import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { fetchRagContext, normaliseGrade, effectiveMedium } from './_rag.js';

const questionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            type:          { type: Type.STRING, description: "Must be 'mcq', 'short', or 'long'" },
            question:      { type: Type.STRING },
            options:       { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Only for mcq' },
            correctAnswer: { type: Type.STRING },
        },
        required: ['type', 'question', 'correctAnswer'],
    },
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

        console.log(`[practice] grade="${grade}" subject="${context.subject}" medium="${medium}" RAG=${chunksFound} scores=[${scores.join(',')}]`);

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, English Medium):\n${ragContext}\n\nGenerate all questions and answers DIRECTLY from the above textbook content. Correct answers must match the textbook exactly.`
            : 'No textbook excerpt available — generate from general academic knowledge.';

        const prompt = `You are an expert academic tutor creating a practice test for TN Samacheer students.
Topic: ${topic}
Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}
Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.

${ragSection}

CRITICAL RULES:
1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
2. Generate exactly 4 questions: 2 MCQs, 1 short answer, 1 long answer.
3. For MCQs, provide exactly 4 options.
4. Provide the correct answer clearly.
5. Write all questions and answers in ${context.language} only.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: questionSchema },
        });

        if (!response.text) throw new Error('Empty response');
        const questions = JSON.parse(response.text.trim());
        // Practice returns an array; wrap with citations in a { questions, ragCitations } envelope
        res.status(200).json({ questions, ragCitations: citations });
    } catch (error) {
        console.error('Practice API Error:', error);
        res.status(500).json({ error: 'Failed to generate practice questions' });
    }
}
