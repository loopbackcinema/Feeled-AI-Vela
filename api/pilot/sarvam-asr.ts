import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: false, // Required for FormData
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (!SARVAM_API_KEY) return res.status(500).json({ error: "SARVAM_API_KEY not set" });

    try {
        // We need to parse the raw request body to forward it to Sarvam
        // Since Vercel Node helpers are limited for streaming/form-data proxying in simple mode,
        // we assume the client sends the audio blob.
        
        // Note: For a robust implementation in Vercel functions with 'bodyParser: false', 
        // we'd typically use 'busboy' or similar. 
        // However, to keep this pilot simple, we will fetch Sarvam directly if CORS allows, 
        // OR we just pipe the request.
        
        // Simpler approach for this file:
        // We will receive a base64 string in JSON if possible, OR 
        // if using pure binary proxying is too complex without external libs.
        // Let's assume the frontend sends a FormData object. 
        // We will reconstruct a fetch to Sarvam.

        // *Critically*: Sarvam expects multipart/form-data with a file field named 'file'.
        // Since we disabled bodyParser, we can try to pipe.
        
        const sarvamResponse = await fetch('https://api.sarvam.ai/speech-to-text-translate', {
            method: 'POST',
            headers: {
                'api-subscription-key': SARVAM_API_KEY,
                // Do not set Content-Type here, let the underlying network stack handle the boundary from the piped stream
                // 'Content-Type': req.headers['content-type'] || 'multipart/form-data', 
            },
            // @ts-ignore - Vercel Request is stream-like
            body: req, 
            // We are piping the incoming multipart request directly to Sarvam
        });

        if (!sarvamResponse.ok) {
            const err = await sarvamResponse.text();
            throw new Error(`Sarvam ASR Error: ${err}`);
        }

        const data = await sarvamResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('ASR Error:', error);
        res.status(500).json({ error: 'ASR processing failed' });
    }
}