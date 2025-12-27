
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// Updated schema to include quiz for knowledge checking
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
        const prompt = `You are an expert educational storyteller. Convert the academic topic "${topic}" into an emotional, student-friendly story.
        The story must be appropriate for a ${std} student and be in ${language}.
        The emotional tone should be ${emotionTone}.
        Generate the story in a 5-part structure: Introduction, Emotional Trigger, Concept Explanation, Resolution, and Moral Message, plus a title and conclusion.
        Also generate a 3-question multiple choice quiz to test understanding of the concept.
        Return output strictly in JSON format.`;
        
        // Use gemini-3-pro-preview for high-quality storytelling and complex reasoning
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
            },
        });
        
        const story = JSON.parse(response.text.trim());
        res.status(200).json({ story });
    } catch (error) {
        console.error('Gemini Story Generation Error:', error);
        res.status(500).json({ error: 'Generation failed' });
    }
}
