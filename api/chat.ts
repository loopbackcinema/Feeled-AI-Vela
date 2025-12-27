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

        const systemInstruction = `You are the interactive Socratic Mentor for the story "${story.title}".
        CONCEPTS TO REINFORCE: "${story.concept_explanation}".
        EMOTIONAL TONE: "${story.emotion_tone}".
        
        YOUR PEDAGOGICAL MISSION:
        1. DO NOT give direct answers immediately.
        2. Socratic Probe: Ask guiding questions that nudge the student to connect story events to the academic concept.
        3. Empathetic Framing: If the student sounds frustrated or confused, validate their feeling first ("It's okay to find this tricky!"), then guide them.
        4. Hyper-Concise: Responses must be strictly under 45 words.
        5. Multilingual Fluidity: If the student writes in Tamil, reply in Tamil.
        6. Concept Anchor: Every second response must explicitly link a story character's action back to the scientific/historical concept being taught.`;

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
        res.status(500).json({ error: 'Chat synchronization failed' });
    }
}