import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

interface ImageRequest {
    prompt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const request: ImageRequest = req.body;

        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: request.prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let base64Image: string | undefined;
        let mimeType: string | undefined;
        const parts = imageResponse.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
            if (part.inlineData) {
                base64Image = part.inlineData.data;
                mimeType = part.inlineData.mimeType;
                break;
            }
        }

        res.status(200).json({ base64Image, mimeType });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate image' });
    }
}
