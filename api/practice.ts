import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, description: "Must be 'mcq', 'short', or 'long'" },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for mcq" },
            correctAnswer: { type: Type.STRING }
        },
        required: ["type", "question", "correctAnswer"]
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { topic, context } = req.body;
        const prompt = `You are an expert academic tutor creating a practice test.
        Topic: ${topic}
        Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}

        CRITICAL RULES:
        1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
        2. Generate exactly 4 questions: 2 MCQs, 1 short answer, 1 long answer.
        3. For MCQs, provide exactly 4 options.
        4. Provide the correct answer clearly.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });

        if (!response.text) throw new Error("Empty response");
        const data = JSON.parse(response.text.trim());
        res.status(200).json(data);
    } catch (error) {
        console.error('Practice API Error:', error);
        res.status(500).json({ error: 'Failed to generate practice questions' });
    }
}
