import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

interface ChatRequest {
    message: string;
    history: any[];
    story: {
        title: string;
        introduction: string;
        concept_explanation: string;
        emotion_tone: string;
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "API_KEY not set" });
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { message, history, story } = req.body as ChatRequest;

        const systemInstruction = `You are the interactive narrator of the story titled "${story.title}". 
        The story is based on the concept: "${story.concept_explanation}".
        The emotional tone is: "${story.emotion_tone}".
        
        Your Goal:
        1. Answer the student's questions about the story or concept clearly.
        2. **Act as a Socratic Tutor:** Do not just give the answer; occasionally ask a simple, thought-provoking follow-up question to check their understanding or make them think deeper.
        3. Maintain Persona.
        4. Keep responses concise (under 60 words).`;

        const contents = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        res.status(200).json({ text: response.text });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate chat response' });
    }
}