
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
        const prompt = `You are an expert educational storyteller. 
        TASK: Convert the academic topic "${topic}" into an emotional, student-friendly story.
        TARGET AUDIENCE: A ${std} student.
        LANGUAGE: ${language}.
        EMOTIONAL TONE: ${emotionTone}.
        
        STORY STRUCTURE:
        1. Introduction: Set the scene and introduce characters.
        2. Emotional Trigger: A problem or curiosity that makes the character feel deeply.
        3. Concept Explanation: The core educational concept explained through the story's events.
        4. Resolution: How the character solves the problem using the concept.
        5. Moral Message: A life lesson derived from the story.
        6. Conclusion: A warm wrap-up.

        QUIZ: Generate exactly 3 multiple-choice questions (A, B, C, D) that test understanding of the concept explained in the story.
        
        Return output strictly in JSON format.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
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
        res.status(500).json({ error: 'Generation failed' });
    }
}
