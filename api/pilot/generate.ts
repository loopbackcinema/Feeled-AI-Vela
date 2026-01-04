import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        tamil_story: { type: Type.STRING },
        quiz: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question_ta: { type: Type.STRING },
                    options_ta: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correct_answer_index: { type: Type.INTEGER }
                },
                required: ["question_ta", "options_ta", "correct_answer_index"]
            }
        }
    },
    required: ["tamil_story", "quiz"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const API_KEY = process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { classLevel, topic, question, mode } = req.body; 
        // mode: 'new', 'explain_again'

        let prompt = "";
        
        if (mode === 'explain_again') {
            prompt = `
            ROLE: You are a gentle Tamil science tutor for a village student in Class ${classLevel}.
            TASK: The student did not understand the previous explanation about "${topic}".
            ACTION: Explain it again, but MUCh simpler. Use a daily life analogy (farming, cooking, play).
            FORMAT: Spoken Tamil (colloquial but respectful).
            LENGTH: Very short. Max 4 sentences.
            OUTPUT: JSON with 'tamil_story' (the explanation) and 'quiz' (empty array).
            `;
        } else {
            prompt = `
            ROLE: You are a friendly, storytelling science teacher speaking Tamil.
            STUDENT: Class ${classLevel}.
            TOPIC: ${topic}.
            STUDENT QUESTION: "${question}"
            
            TASK: 
            1. Answer the question using a short Story or Analogy.
            2. Do NOT give textbook definitions.
            3. Use simple Spoken Tamil (Tanglish is okay if common words like 'Current', 'Switch' are used).
            4. Tone: Encouraging, emotional, warm.
            5. Length: Max 90 words.

            QUIZ TASK:
            1. Create 3 simple multiple choice questions based *only* on the story you just told.
            2. Options should be A, B, C.

            OUTPUT FORMAT: JSON matching the schema.
            `;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        if (!response.text) throw new Error("Empty response");
        res.status(200).json(JSON.parse(response.text.trim()));

    } catch (error) {
        console.error('Generation Error:', error);
        res.status(500).json({ error: 'Generation failed' });
    }
}