import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

function normalizeBoard(board: string): string {
    return board.includes('Samacheer') ? 'TN Samacheer' : board;
}

async function fetchRagContext(
    query: string, subject: string, grade: string, medium: string, board: string
): Promise<{ context: string | null; chunksFound: number }> {
    const { API_KEY, PINECONE_API_KEY, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_HOST) {
        return { context: null, chunksFound: 0 };
    }
    try {
        const embRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: { parts: [{ text: query }] }, outputDimensionality: 768 }),
            }
        );
        if (!embRes.ok) return { context: null, chunksFound: 0 };
        const embData = await embRes.json() as any;
        const vector: number[] = embData.embedding?.values ?? [];
        if (vector.length === 0) return { context: null, chunksFound: 0 };

        const normalizedBoard = normalizeBoard(board);
        const effectiveMedium = medium === 'Tamil' ? 'English' : medium;

        const filter: Record<string, { $eq: string }> = {
            subject: { $eq: subject },
            grade:   { $eq: grade },
            medium:  { $eq: effectiveMedium },
            board:   { $eq: normalizedBoard },
        };

        const pinRes = await fetch(`${PINECONE_HOST}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_API_KEY },
            body: JSON.stringify({ vector, topK: 5, includeMetadata: true, filter }),
        });
        if (!pinRes.ok) return { context: null, chunksFound: 0 };
        const pinData = await pinRes.json() as any;

        const goodMatches = (pinData.matches ?? []).filter((m: any) => (m.score ?? 0) > 0.4);
        const chunks: string[] = goodMatches.map((m: any) => m.metadata?.text as string).filter(Boolean);

        return { context: chunks.length > 0 ? chunks.join('\n\n') : null, chunksFound: chunks.length };
    } catch (err) {
        console.error('[RAG] chat-session fetch error:', err);
        return { context: null, chunksFound: 0 };
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { message, history = [], context } = req.body;
        const medium = context.language === 'Tamil' ? 'Tamil' : 'English';
        const grade = (context.grade ?? context.standard ?? '').replace(/\D/g, '') || context.grade;

        const { context: ragContext, chunksFound } = await fetchRagContext(
            message, context.subject, grade, medium, context.board ?? 'TN Samacheer'
        );

        console.log(`[chat-session] grade="${grade}" subject="${context.subject}" medium="${medium}" RAG chunks=${chunksFound}`);

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}):\n${ragContext}\n\nUse the above textbook content as your PRIMARY source when answering.`
            : 'No textbook excerpt available — answer from general academic knowledge.';

        const systemInstruction = `You are FeelEd AI, a warm and expert academic tutor for Tamil Nadu Samacheer students.
You are helping a Grade ${grade} student with ${context.subject}.

${ragSection}

Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.
Keep answers clear, concise, and exam-relevant. Avoid markdown headers (##, ###). Use short paragraphs and bullet points only when listing items.`;

        const contents = [
            ...(history as any[]).map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            })),
            { role: 'user', parts: [{ text: message }] },
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents,
            config: { systemInstruction },
        });

        if (!response.text) throw new Error('Empty response');

        res.status(200).json({ reply: response.text.trim(), ragUsed: chunksFound > 0 });
    } catch (error) {
        console.error('Chat Session Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
