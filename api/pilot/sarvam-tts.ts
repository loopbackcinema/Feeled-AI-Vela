import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
    if (!SARVAM_API_KEY) return res.status(500).json({ error: "SARVAM_API_KEY not set" });

    try {
        const { text } = req.body;

        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-subscription-key': SARVAM_API_KEY
            },
            body: JSON.stringify({
                inputs: [text],
                target_language_code: 'ta-IN',
                speaker: 'meera', // Good female Tamil voice
                pitch: 0,
                pace: 1.0,
                loudness: 1.5,
                speech_sample_rate: 8000, // Optimize for phone/low-bandwidth
                enable_preprocessing: true,
                model: 'bulbul:v1'
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Sarvam TTS Error: ${err}`);
        }

        const data = await response.json();
        // Sarvam returns { audios: ["base64_string"] }
        res.status(200).json({ audio: data.audios[0] });

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: 'TTS processing failed' });
    }
}