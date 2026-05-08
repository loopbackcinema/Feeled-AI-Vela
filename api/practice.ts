import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            type:          { type: Type.STRING, description: "Must be 'mcq', 'short', or 'long'" },
            question:      { type: Type.STRING },
            options:       { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for mcq" },
            correctAnswer: { type: Type.STRING }
        },
        required: ["type", "question", "correctAnswer"]
    }
};

function normalizeBoard(board: string): string {
    return board.includes('Samacheer') ? 'TN Samacheer' : board;
}

async function fetchRagContext(
    query: string, subject: string, grade: string, medium: string, board: string
): Promise<{ context: string | null; chunksFound: number; scores: number[] }> {
    const { API_KEY, PINECONE_API_KEY, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_HOST) {
        return { context: null, chunksFound: 0, scores: [] };
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
        if (!embRes.ok) return { context: null, chunksFound: 0, scores: [] };
        const embData = await embRes.json() as any;
        const vector: number[] = embData.embedding?.values ?? [];
        if (vector.length === 0) return { context: null, chunksFound: 0, scores: [] };

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
        if (!pinRes.ok) return { context: null, chunksFound: 0, scores: [] };
        const pinData = await pinRes.json() as any;

        const goodMatches = (pinData.matches ?? []).filter((m: any) => (m.score ?? 0) > 0.4);
        const chunks: string[] = goodMatches.map((m: any) => m.metadata?.text as string).filter(Boolean);
        const scores: number[] = goodMatches.map((m: any) => +(m.score ?? 0).toFixed(3));

        return { context: chunks.length > 0 ? chunks.join('\n\n') : null, chunksFound: chunks.length, scores };
    } catch (err) {
        console.error('[RAG] fetch error:', err);
        return { context: null, chunksFound: 0, scores: [] };
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { topic, context } = req.body;
        const medium = context.language === 'Tamil' ? 'Tamil' : 'English';
        const grade  = (context.standard ?? '').replace(/\D/g, '') || context.standard;

        const { context: ragContext, chunksFound, scores } = await fetchRagContext(
            topic, context.subject, grade, medium, context.board ?? 'TN Samacheer'
        );

        console.log(`[practice] board="${context.board}" → "${normalizeBoard(context.board ?? '')}" | grade="${grade}" | medium="${medium}" | RAG chunks=${chunksFound} scores=[${scores.join(',')}]`);

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, English Medium):\n${ragContext}\n\nGenerate all questions and answers DIRECTLY from the above textbook content. Correct answers must match the textbook exactly.`
            : `No textbook excerpt available — generate from general academic knowledge.`;

        const prompt = `You are an expert academic tutor creating a practice test for TN Samacheer students.
        Topic: ${topic}
        Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}
        Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.

        ${ragSection}

        CRITICAL RULES:
        1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
        2. Generate exactly 4 questions: 2 MCQs, 1 short answer, 1 long answer.
        3. For MCQs, provide exactly 4 options.
        4. Provide the correct answer clearly.
        5. Write all questions and answers in ${context.language} only.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });

        if (!response.text) throw new Error("Empty response");
        const data = JSON.parse(response.text.trim());
        res.status(200).json(data);
    } catch (error) {
        console.error('Practice API Error:', error);
        res.status(500).json({ error: 'Failed to generate practice questions' });
    }
}
