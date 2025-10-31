import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

interface AudioRequest {
    fullStoryText: string;
    language: string;
    narratorVoice: string;
    emotionTone: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "API_KEY environment variable not set" });
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const request: AudioRequest = req.body;
        
        const voiceName = request.language === 'Tamil' 
            ? (request.narratorVoice === 'Male' ? 'Fenrir' : 'Zephyr') 
            : (request.narratorVoice === 'Male' ? 'Puck' : 'Kore');

        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a ${request.emotionTone} tone: ${request.fullStoryText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    },
                },
            },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("Audio data not found in TTS response.");
        }
        
        res.status(200).json({ base64Audio });

    } catch (error) {
        console.error('Error in /api/audio:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: `Failed to generate audio. Details: ${errorMessage}` });
    }
}
