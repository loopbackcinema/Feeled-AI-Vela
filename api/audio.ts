import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { fullStoryText, language, narratorVoice, emotionTone } = req.body;
        
        const voiceName = language === 'Tamil' 
            ? (narratorVoice === 'Male' ? 'Fenrir' : 'Zephyr') 
            : (narratorVoice === 'Male' ? 'Puck' : 'Kore');

        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say cheerfully in a ${emotionTone} tone: ${fullStoryText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName } },
                },
            },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        res.status(200).json({ base64Audio });
    } catch (error) {
        res.status(500).json({ error: 'Audio failed' });
    }
}