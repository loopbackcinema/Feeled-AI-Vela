import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// These types must be defined here for the serverless function
interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

interface Story {
    title: string;
    emotion_tone: string;
    introduction: string;
    emotional_trigger: string;
    concept_explanation: string;
    resolution: string;
    moral_message: string;
    conclusion: string;
    quiz: QuizQuestion[];
}

interface StoryRequest {
    topic: string;
    std: string;
    language: string;
    narratorVoice: string;
    emotionTone: string;
}

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
                    answer: { type: Type.STRING, description: "The correct answer from the options array" }
                },
                required: ["question", "options", "answer"]
            }
        }
    },
    required: ["title", "emotion_tone", "introduction", "emotional_trigger", "concept_explanation", "resolution", "moral_message", "conclusion", "quiz"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        console.error("API_KEY environment variable not found.");
        return res.status(500).json({ error: "Server configuration error: The API_KEY is not set in the Vercel project settings. Please add the environment variable and redeploy." });
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const request: StoryRequest = req.body;
        
        const storyPrompt = `You are an expert educational storyteller. Convert the academic topic "${request.topic}" into an emotional, student-friendly story.
        The story must be appropriate for a ${request.std} student and be in ${request.language}.
        The emotional tone should be ${request.emotionTone}.
        
        Generate the story in a 5-part structure: Introduction, Emotional Trigger, Concept Explanation, Resolution, and Moral Message, plus a title and conclusion.
        
        IMPORTANT: You MUST also generate a "Quiz" with exactly 3 multiple-choice questions based on the story's concept. 
        - Each question must have exactly 4 options.
        - One option must be the correct answer.
        - The questions should test comprehension of the concept explained in the story.
        
        Return the output strictly in the specified JSON format.`;
        
        const storyResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: storyPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
                temperature: 0.7,
            },
        });
        
        const storyJsonText = storyResponse.text;
        if (!storyJsonText) {
            throw new Error("Failed to get a valid text response from the AI model. The response was empty.");
        }
        const story: Story = JSON.parse(storyJsonText.trim());

        res.status(200).json({ story });

    } catch (error) {
        console.error('Error in /api/story:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        res.status(500).json({ error: `Failed to generate story text. Details: ${errorMessage}` });
    }
}