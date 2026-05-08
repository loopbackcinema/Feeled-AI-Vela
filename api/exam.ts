import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const schema = {
    type: Type.OBJECT,
    properties: {
        importantQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        revisionNotes:      { type: Type.ARRAY, items: { type: Type.STRING } },
        predictedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["importantQuestions", "revisionNotes", "predictedQuestions"]
};

async function fetchRagContext(
    query: string, subject: string, grade: string, medium: string, board: string
): Promise<string | null> {
    const { API_KEY, PINECONE_API_KEY, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_HOST) return null;
    try {
        const embRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: { parts: [{ text: query }] }, outputDimensionality: 768 }),
            }
        );
        if (!embRes.ok) return null;
        const embData = await embRes.json() as any;
        const vector: number[] = embData.embedding?.values ?? [];
        if (vector.length === 0) return null;

        const filter: Record<string, { $eq: string }> = {};
        if (subject) filter.subject = { $eq: subject };
        if (grade)   filter.grade   = { $eq: grade };
        if (medium)  filter.medium  = { $eq: medium };
        if (board)   filter.board   = { $eq: board };

        const pinRes = await fetch(`${PINECONE_HOST}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_API_KEY },
            body: JSON.stringify({ vector, topK: 5, includeMetadata: true, filter }),
        });
        if (!pinRes.ok) return null;
        const pinData = await pinRes.json() as any;

        const chunks: string[] = (pinData.matches ?? [])
            .filter((m: any) => (m.score ?? 0) > 0.4)
            .map((m: any) => m.metadata?.text as string)
            .filter(Boolean);
        return chunks.length > 0 ? chunks.join('\n\n') : null;
    } catch {
        return null;
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

        const ragContext = await fetchRagContext(
            topic, context.subject, grade, medium, context.board ?? 'TN Samacheer'
        );

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, ${medium} Medium):\n${ragContext}\n\nBase your importantQuestions, revisionNotes, and predictedQuestions DIRECTLY on the above textbook content.`
            : `No textbook excerpt available — generate from general academic knowledge.`;

        const prompt = `You are an expert academic tutor preparing a student for an exam tomorrow.
        Topic: ${topic}
        Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}
        Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.

        ${ragSection}

        CRITICAL RULES:
        1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
        2. Keep output concise and scannable.
        3. importantQuestions: 5-10 highly probable exam questions from the textbook.
        4. revisionNotes: Quick bullet points for last-minute revision — key facts from the textbook.
        5. predictedQuestions: 3 tricky or high-value predicted questions aligned to the syllabus.
        6. Write every question and note in ${context.language} only.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });

        if (!response.text) throw new Error("Empty response");
        const data = JSON.parse(response.text.trim());
        res.status(200).json(data);
    } catch (error) {
        console.error('Exam API Error:', error);
        res.status(500).json({ error: 'Failed to generate exam prep' });
    }
}
