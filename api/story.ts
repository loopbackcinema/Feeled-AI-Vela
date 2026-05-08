import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        emotion_tone: { type: Type.STRING },
        introduction: { type: Type.STRING },
        emotional_trigger: { type: Type.STRING },
        concept_explanation: { type: Type.STRING },
        resolution: { type: Type.STRING },
        moral_message: { type: Type.STRING },
        conclusion: { type: Type.STRING },
        quiz: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer: { type: Type.STRING }
                },
                required: ["question", "options", "answer"]
            }
        }
    },
    required: ["title", "emotion_tone", "introduction", "emotional_trigger", "concept_explanation", "resolution", "moral_message", "conclusion", "quiz"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { topic, std, language, emotionTone } = req.body;
        const prompt = `You are a world-class educational storyteller and pedagogical expert.

        TASK: Convert the academic topic "${topic}" into a deeply emotional, immersive, and student-friendly story.
        TARGET AUDIENCE: A ${std} student.
        LANGUAGE: ${language}.
        EMOTIONAL ARC: ${emotionTone}.

        STORY REQUIREMENTS:
        1. Introduction: Hook the reader and introduce the protagonist and the setting.
        2. Emotional Trigger: Create a high-arousal emotional moment or problem that requires the educational concept to solve.
        3. Concept Explanation: Integrate the core educational explanation naturally into the narrative events.
        4. Resolution: Show how the character triumphs using their newfound understanding.
        5. Moral Message: Deliver a powerful, inspiring life lesson.
        6. Conclusion: Provide a heartwarming and educational closure.

        QUIZ GENERATION:
        Generate exactly 3 high-quality multiple-choice questions.
        Questions must specifically test the understanding of how the educational concept worked within the story.
        Include 4 options for each question (A, B, C, D).

        Return output strictly in JSON format matching the schema.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
            },
        });

        if (!response.text) throw new Error("Empty response from Gemini");
        const story = JSON.parse(response.text.trim());
        res.status(200).json({ story });
    } catch (error) {
        console.error('Gemini Story Generation Error:', error);
        res.status(500).json({ error: 'Pedagogical generation failed' });
    }
}
