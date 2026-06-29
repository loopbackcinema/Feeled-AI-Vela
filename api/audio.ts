import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { fullStoryText, language, narratorVoice, emotionTone, voiceName: directVoiceName } = req.body;

        // If voiceName passed directly (from CinemaEngine), use it.
        // Otherwise fall back to old Male/Female mapping (legacy StoryMode).
        const voiceName = directVoiceName ?? (
            language === 'Tamil'
                ? (narratorVoice === 'Male' ? 'Fenrir' : 'Zephyr')
                : (narratorVoice === 'Male' ? 'Puck' : 'Kore')
        );

        const tone = emotionTone ?? 'neutral';

        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say in a ${tone} tone: ${fullStoryText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName } },
                },
            },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            return res.status(500).json({ error: 'No audio data generated' });
        }

        res.status(200).json({ base64Audio });
    } catch (error) {
        console.error("Audio generation error:", error);
        res.status(500).json({ error: 'Audio generation failed' });
    }
}
