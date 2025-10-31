
import { Story, StoryRequest } from '../types';

export const generateStoryAndVoice = async (request: StoryRequest): Promise<{ story: Story; base64Audio: string }> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    return result;
};
