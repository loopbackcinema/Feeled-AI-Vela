import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'SARVAM_API_KEY not set' });

    const { audioBase64, mimeType, languageCode } = req.body;
    if (!audioBase64) return res.status(400).json({ error: 'audioBase64 is required' });

    try {
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const type = mimeType || 'audio/webm';
        const ext = type.includes('mp4') ? 'mp4' : type.includes('wav') ? 'wav' : 'webm';
        const blob = new Blob([audioBuffer], { type });

        const formData = new FormData();
        formData.append('file', blob, `recording.${ext}`);
        formData.append('language_code', languageCode || 'ta-IN');
        formData.append('model', 'saarika:v2');

        const response = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: { 'api-subscription-key': apiKey },
            body: formData,
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Sarvam STT error:', errText);
            return res.status(response.status).json({ error: 'STT request failed' });
        }

        const data = await response.json();
        return res.status(200).json({ transcript: data.transcript ?? '' });
    } catch (error) {
        console.error('Sarvam STT error:', error);
        return res.status(500).json({ error: 'STT failed' });
    }
}
