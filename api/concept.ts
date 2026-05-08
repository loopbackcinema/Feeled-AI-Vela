import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import { fetchRagContext, languageToMedium, normaliseGrade } from '../lib/rag';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { question, context } = req.body;
        const medium = languageToMedium(context.language);
        const grade  = normaliseGrade(context.standard);

        // Fetch relevant textbook passages from Pinecone (best-effort)
        const ragContext = await fetchRagContext({
            query:   question,
            subject: context.subject,
            grade,
            medium,
            board:   context.board ?? 'TN Samacheer',
        });

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, ${medium} Medium):
${ragContext}

Use the above textbook content as your PRIMARY source. Your textbookAnswer and markBasedAnswers must closely follow the textbook wording. For simpleExplanation, rephrase in simpler terms.`
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
