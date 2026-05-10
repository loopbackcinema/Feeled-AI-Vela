import type { VercelRequest, VercelResponse } from '@vercel/node';

const LANG_CODES: Record<string, string> = {
    Tamil: 'ta-IN',
    English: 'en-IN',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'SARVAM_API_KEY not set' });

    const { text, language } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const targetLanguageCode = LANG_CODES[language] ?? 'en-IN';
    // Sarvam TTS has a ~500 char limit per input
    const safeText = String(text).slice(0, 500);

    try {
        const response = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
                'api-subscription-key': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: [safeText],
                target_language_code: targetLanguageCode,
                speaker: 'anushka',
                model: 'bulbul:v2',
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Sarvam TTS error:', errText);
            return res.status(response.status).json({ error: 'TTS request failed' });
        }

        const data = await response.json();
        const base64Audio = data.audios?.[0] ?? null;
        return res.status(200).json({ base64Audio });
    } catch (error) {
        console.error('Sarvam TTS error:', error);
        return res.status(500).json({ error: 'TTS failed' });
    }
}
