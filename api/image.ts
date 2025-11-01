import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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

        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: request.prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });
        
        const base64Image = imageResponse.generatedImages[0].image.imageBytes;

        if (!base64Image) {
            throw new Error("Image data not found in response.");
        }
        
        res.status(200).json({ base64Image });

    } catch (error) {
        console.error('Error in /api/image:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: `Failed to generate image. Details: ${errorMessage}` });
    }
}
