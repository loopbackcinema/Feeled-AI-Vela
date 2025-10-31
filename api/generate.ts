
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Story, StoryRequest } from '../src/types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    },
    required: ["title", "emotion_tone", "introduction", "emotional_trigger", "concept_explanation", "resolution", "moral_message", "conclusion"],
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const request: StoryRequest = req.body;
        
        // Step 1: Generate the story
        const storyPrompt = `You are an expert educational storyteller. Convert the academic topic "${request.topic}" into an emotional, student-friendly story.
        The story must be appropriate for a ${request.std} student and be in ${request.language}.
        The emotional tone should be ${request.emotionTone}.
        Generate the story in a 5-part structure: Introduction, Emotional Trigger, Concept Explanation, Resolution, and Moral Message, plus a title and conclusion.
        Return the output strictly in the specified JSON format.`;
        
        const storyResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: storyPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
                temperature: 0.7,
            },
        });
        
        const storyJsonText = storyResponse.text.trim();
        const story: Story = JSON.parse(storyJsonText);

        // Step 2: Generate the voice
        const fullStoryText = [
            story.title,
            story.introduction,
            story.emotional_trigger,
            story.concept_explanation,
            story.resolution,
            story.moral_message,
            story.conclusion
        ].join('. ');

        const voiceName = request.language === 'Tamil' 
            ? (request.narratorVoice === 'Male' ? 'Fenrir' : 'Zephyr') 
            : (request.narratorVoice === 'Male' ? 'Puck' : 'Kore');

        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a ${request.emotionTone} tone: ${fullStoryText}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    },
                },
            },
        });

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (!base64Audio) {
            throw new Error("Audio data not found in TTS response.");
        }
        
        res.status(200).json({ story, base64Audio });

    } catch (error) {
        console.error('Error in /api/generate:', error);
        res.status(500).json({ error: 'Failed to generate story.' });
    }
}
