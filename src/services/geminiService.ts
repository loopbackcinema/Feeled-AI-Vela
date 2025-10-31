
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, StoryRequest } from '../types';

// FIX: Switched from import.meta.env.VITE_API_KEY to process.env.API_KEY
// to comply with the Gemini API coding guidelines. The vite.config.ts file
// has been updated to ensure this variable is available in the client-side code.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in your environment configuration.");
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

export const generateStoryAndVoice = async (request: StoryRequest): Promise<{ story: Story; base64Audio: string }> => {
    // Step 1: Generate the story
    const storyPrompt = `You are an expert educational storyteller. Convert the academic topic "${request.topic}" into an emotional, student-friendly story.
    The story must be appropriate for a ${request.std} student and be in ${request.language}.
    The emotional tone should be ${request.emotionTone}.
    Generate the story in a 5-part structure: Introduction, Emotional Trigger, Concept Explanation, Resolution, and Moral Message, plus a title and conclusion.
    Return the output strictly in the specified JSON format.`;
    
    console.log("Generating story with prompt:", storyPrompt);

    const storyResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: storyPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: storySchema,
            temperature: 0.7,
        },
    });
    
    let storyJsonText = storyResponse.text.trim();
    console.log("Received story JSON text:", storyJsonText);
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

    console.log(`Generating audio with voice: ${voiceName}`);

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
