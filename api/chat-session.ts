import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { fetchRagContext, normaliseGrade, effectiveMedium, formatCitations } from './_rag.js';

function parseSuggestions(text: string): { reply: string; suggestions: string[] } {
    const match = text.match(/\nFOLLOWUP:([^\n]+)/);
    if (!match) return { reply: text.trim(), suggestions: [] };
    const suggestions = match[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, 3);
    const reply = text.replace(/\nFOLLOWUP:[^\n]+/, '').trim();
    return { reply, suggestions };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { message, history = [], context, imageBase64, imageMimeType } = req.body;
        const lang    = context?.language || 'English';
        const medium  = effectiveMedium(lang === 'Tamil' ? 'Tamil' : 'English');
        const grade   = normaliseGrade((context?.grade ?? context?.standard ?? '10').toString());
        const subject = context?.subject || 'General';
        const board   = context?.board   || 'TN Samacheer';

        const { context: ragContext, chunksFound, citations, scores } = await fetchRagContext({
            query: message, subject, grade, medium, board,
        });

        console.log(`[chat-session] grade="${grade}" subject="${subject}" medium="${medium}" RAG=${chunksFound} scores=[${scores.join(',')}]`);

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${subject}):\n${ragContext}\n\nUse the above textbook content as your PRIMARY source when answering.`
            : 'No textbook excerpt — answer from general academic knowledge.';

        const systemInstruction = `You are FeelEd AI, a warm and expert academic tutor for Tamil Nadu Samacheer students.
You are helping a Grade ${grade} student with ${subject}.

${ragSection}

Response Language: ${lang} — ALL text in your response MUST be written in ${lang}.
Keep answers clear, concise, and exam-relevant. Avoid markdown headers (##, ###). Use short paragraphs and bullet points only when listing items.

After your educational response, on a new line, add exactly this format (no extra text around it):
FOLLOWUP:question1|question2|question3
where question1, question2, question3 are 3 short follow-up questions the student might ask next, written in ${lang}.`;

        const userParts: any[] = [];
        if (imageBase64 && imageMimeType) {
            userParts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
        }
        userParts.push({ text: message });

        const contents = [
            ...(history as any[]).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            })),
            { role: 'user', parts: userParts },
        ];
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
let fullText = '';
const stream = await ai.models.generateContentStream({ model: 'gemini-2.5-flash', contents, config: { systemInstruction } });
for await (const chunk of stream) {
    const t = chunk.text || '';
    if (t) { fullText += t; res.write('data: ' + JSON.stringify({ chunk: t }) + '\n\n'); }
}
const { reply, suggestions } = parseSuggestions(fullText);
res.write('data: ' + JSON.stringify({ done: true, ragUsed: chunksFound > 0, suggestions, ragCitations: citations }) + '\n\n');
res.end();

    } catch (error) {
        console.error('Chat Session Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
