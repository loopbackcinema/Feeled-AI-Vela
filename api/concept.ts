import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const schema = {
    type: Type.OBJECT,
    properties: {
        textbookAnswer: { type: Type.STRING },
        examFormat: { type: Type.ARRAY, items: { type: Type.STRING } },
        simpleExplanation: { type: Type.STRING }
    },
    required: ["textbookAnswer", "examFormat", "simpleExplanation"]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { question, context } = req.body;
        const prompt = `You are an expert academic tutor. Answer the student's question.
        Question: ${question}
        Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}

        CRITICAL RULES:
        1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
        2. Keep text clean and plain.
        3. textbookAnswer: A short, exam-ready answer (2-5 mark style).
        4. examFormat: 3-5 bullet points for writing in an exam.
        5. simpleExplanation: Easy to understand explanation.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });

        if (!response.text) throw new Error("Empty response");
        const data = JSON.parse(response.text.trim());
        res.status(200).json(data);
    } catch (error) {
        console.error('Concept API Error:', error);
        res.status(500).json({ error: 'Failed to generate concept explanation' });
    }
}
