
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
    if (!API_KEY) {
        console.error("API_KEY environment variable not found.");
        return res.status(500).json({ error: "Server configuration error: API_KEY is not set." });
    }
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

        if (!base64Image || !mimeType) {
            console.error("Image data or MIME type not found in Gemini response:", JSON.stringify(imageResponse, null, 2));
            throw new Error("Image data or MIME type not found in the AI response.");
        }
        
        res.status(200).json({ base64Image, mimeType });

    } catch (error) {
        console.error('Error in /api/image:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: `Failed to generate image. Details: ${errorMessage}` });
    }
}
