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
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { message, history, story } = req.body as ChatRequest;

        const systemInstruction = `You are the interactive educational narrator of the story "${story.title}".
        CONCEPTS TO REINFORCE: "${story.concept_explanation}".
        EMOTIONAL TONE: "${story.emotion_tone}".
        
        RULES:
        1. Act as a Socratic Tutor: Instead of giving direct answers, ask a small follow-up question that helps the student find the answer themselves.
        2. Keep it Friendly: Use the persona of a world-class educational mentor.
        3. Be Concise: Under 50 words per response.
        4. Multilingual: Reply in the same language the student uses.
        5. Deepen Learning: If they ask about the story, link it back to the academic concept.`;

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
                temperature: 0.7,
                topP: 0.8,
            }
        });

        res.status(200).json({ text: response.text });
    } catch (error) {
        res.status(500).json({ error: 'Chat sync failed' });
    }
}