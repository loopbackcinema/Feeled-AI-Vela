import { Story, StoryRequest } from '../types';

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

export const generateImage = async (story: Story): Promise<{ base64Image: string }> => {
    const prompt = `Create a realistic, photorealistic image that captures the essence of the following story introduction. The image should be visually stunning and evoke the story's emotional tone of "${story.emotion_tone}". Story Title: "${story.title}". Introduction: "${story.introduction}"`;

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
