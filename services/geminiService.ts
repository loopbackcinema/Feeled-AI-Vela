import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, StoryRequest } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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

export const generateStoryAndVoice = async (request: StoryRequest): Promise<{ story: Story; base64Audio: string }> => {
    // 1. Generate Story Text
    const storyPrompt = `You are an expert educational storyteller. Convert the academic topic "${request.topic}" into an emotional, student-friendly story.
    The story must be appropriate for a ${request.std} student and be in ${request.language}.
    The emotional tone should be ${request.emotionTone}.
    Generate the story in a 5-part structure: Introduction, Emotional Trigger, Concept Explanation, Resolution, and Moral Message, plus a title and conclusion.
    Return the output strictly in the specified JSON format.`;
    
    const storyResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: storyPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: storySchema,
            temperature: 0.7,
        },
    });
    
    if (!storyResponse.text) {
        throw new Error("Empty response from story generator.");
    }

    const story: Story = JSON.parse(storyResponse.text.trim());

    // 2. Generate Voice (TTS)
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
    
    return { story, base64Audio };
};