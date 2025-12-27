
// services/geminiService.ts
import { Story, StoryRequest, ChatMessage } from '../types';

/**
 * Generates the story text from the backend API.
 */
export const generateStory = async (request: StoryRequest): Promise<{ story: Story }> => {
    const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred while generating story text.' }));
        throw new Error(errorData.error || `Story request failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * Generates audio for the story using Gemini TTS.
 */
export const generateVoice = async (story: Story, request: StoryRequest): Promise<{ base64Audio: string }> => {
    const fullStoryText = [
        story.title,
        story.introduction,
        story.emotional_trigger,
        story.concept_explanation,
        story.resolution,
        story.moral_message,
        story.conclusion
    ].join('. ');

    const audioRequest = {
        fullStoryText,
        language: request.language,
        narratorVoice: request.narratorVoice,
        emotionTone: request.emotionTone,
    };

    const response = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audioRequest),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred while generating audio.' }));
        throw new Error(errorData.error || `Audio request failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * Generates a thematic image for the story using Gemini Image Generation.
 */
export const generateImage = async (story: Story): Promise<{ base64Image: string; mimeType: string }> => {
    const prompt = `Create a realistic, photorealistic digital art image that captures the essence of the following story scene. 
    The image should be visually stunning and evoke the story's emotional tone of "${story.emotion_tone}". 
    Scene description: "${story.introduction}". 
    
    IMPORTANT RESTRICTIONS: 
    1. Do NOT include any text, words, letters, subtitles, or labels in the image. 
    2. The image must be purely visual/artistic.
    3. No gibberish text.`;

    const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred while generating image.' }));
        throw new Error(errorData.error || `Image request failed with status ${response.status}`);
    }

    return response.json();
};

/**
 * Legacy support for combined story and voice generation.
 */
export const generateStoryAndVoice = async (request: StoryRequest): Promise<{ story: Story; base64Audio: string }> => {
    const { story } = await generateStory(request);
    const { base64Audio } = await generateVoice(story, request);
    return { story, base64Audio };
};

/**
 * Sends a message to the narrator chatbot.
 * Fixes the import error: Module '"../services/geminiService"' has no exported member 'sendChatMessage'.
 */
export const sendChatMessage = async (message: string, history: ChatMessage[], story: Story): Promise<{ text: string }> => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, story }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
};
