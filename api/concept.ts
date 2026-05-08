import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const schema = {
    type: Type.OBJECT,
    properties: {
        textbookAnswer:   { type: Type.STRING },
        examFormat:       { type: Type.ARRAY, items: { type: Type.STRING } },
        simpleExplanation:{ type: Type.STRING },
        keyKeywords:      { type: Type.ARRAY, items: { type: Type.STRING } },
        markBasedAnswers: {
            type: Type.OBJECT,
            properties: {
                twoMark:  { type: Type.STRING },
                fiveMark: { type: Type.STRING },
            },
            required: ["twoMark", "fiveMark"],
        },
    },
    required: ["textbookAnswer", "examFormat", "simpleExplanation", "keyKeywords", "markBasedAnswers"]
};

// Normalize board name to match what was stored during ingestion
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

        // Tamil medium PDFs have no extractable text (font encoding issue) —
        // fall back to English medium vectors for the same curriculum content.
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
        const chunks: string[] = goodMatches
            .map((m: any) => m.metadata?.text as string)
            .filter(Boolean);
        const scores: number[] = goodMatches.map((m: any) => +(m.score ?? 0).toFixed(3));

        return {
            context:     chunks.length > 0 ? chunks.join('\n\n') : null,
            chunksFound: chunks.length,
            scores,
        };
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
        const { question, context } = req.body;
        const medium = context.language === 'Tamil' ? 'Tamil' : 'English';
        const grade  = (context.standard ?? '').replace(/\D/g, '') || context.standard;

        const { context: ragContext, chunksFound, scores } = await fetchRagContext(
            question, context.subject, grade, medium, context.board ?? 'TN Samacheer'
        );

        console.log(`[concept] board="${context.board}" → "${context.board?.includes('Samacheer') ? 'TN Samacheer' : context.board}" | grade="${grade}" | medium="${medium}" | RAG chunks=${chunksFound} scores=[${scores.join(',')}]`);

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, English Medium):\n${ragContext}\n\nUse the above textbook content as your PRIMARY source. Your textbookAnswer and markBasedAnswers must closely follow the textbook wording. For simpleExplanation, rephrase in simpler terms.`
            : `No textbook excerpt available — answer from general academic knowledge.`;

        const prompt = `You are an expert academic tutor for TN Samacheer Board students.
        Question: ${question}
        Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}
        Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.

        ${ragSection}

        CRITICAL RULES:
        1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
        2. Keep text clean and plain.
        3. textbookAnswer: A detailed, exam-ready answer (5 mark style).
        4. examFormat: 3-5 bullet points for presenting in an exam.
        5. simpleExplanation: Easy 1-2 sentence explanation a younger student could understand.
        6. keyKeywords: 4-6 important technical terms from this topic.
        7. markBasedAnswers.twoMark: A concise 2-mark answer (2-3 sentences).
        8. markBasedAnswers.fiveMark: A structured 5-mark answer with clear points.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });

        if (!response.text) throw new Error("Empty response");
        const data = JSON.parse(response.text.trim());
        res.status(200).json(data);
    } catch (error) {
        console.error('Concept API Error:', error);
        res.status(500).json({ error: 'Failed to generate concept explanation' });
    }
}
