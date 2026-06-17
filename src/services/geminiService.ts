import { Story, StoryRequest, SceneStory, ChatMessage, ConceptResponse, PracticeQuestion, ExamPrep, StudentContext } from '../types';

async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request to ${path} failed`);
    }
    return res.json();
}

export const generateConcept = async (question: string, context: StudentContext): Promise<ConceptResponse> => {
    return post<ConceptResponse>('/api/concept', { question, context });
};

export const generatePractice = async (topic: string, context: StudentContext): Promise<PracticeQuestion[]> => {
    // API now returns { questions, ragCitations } — extract just the questions array
    const data = await post<{ questions: PracticeQuestion[] } | PracticeQuestion[]>('/api/practice', { topic, context });
    return Array.isArray(data) ? data : (data as any).questions ?? [];
};

export const generateExamPrep = async (topic: string, context: StudentContext): Promise<ExamPrep> => {
    return post<ExamPrep>('/api/exam-unified', { action: 'prep', topic, context });
};

export const generateStory = async (request: StoryRequest): Promise<{ story: Story }> => {
    return post<{ story: Story }>('/api/story', {
        topic: request.topic,
        std: request.std,
        language: request.language,
        emotionTone: request.emotionTone,
    });
};

export const generateSceneStory = async (request: {
    topic: string; grade: string; subject: string; language: string; emotionTone: string;
}): Promise<{ scenes_story: SceneStory }> => {
    return post<{ scenes_story: SceneStory }>('/api/story-scenes', {
        topic: request.topic,
        grade: request.grade,
        subject: request.subject,
        language: request.language,
        emotionTone: request.emotionTone,
    });
};

export const generateVoice = async (story: Story, request: StoryRequest): Promise<{ base64Audio: string }> => {
    const fullStoryText = [
        story.title,
        story.introduction,
        story.emotional_trigger,
        story.concept_explanation,
        story.resolution,
        story.moral_message,
        story.conclusion,
    ].join('. ');

    return post<{ base64Audio: string }>('/api/audio', {
        fullStoryText,
        language: request.language,
        narratorVoice: request.narratorVoice,
        emotionTone: request.emotionTone,
    });
};

export const generateImage = async (story: Story): Promise<{ base64Image: string; mimeType: string }> => {
    const prompt = `Create a realistic, photorealistic digital art image that captures the essence of the following story scene.
The image should be visually stunning and evoke the story's emotional tone of "${story.emotion_tone}".
Scene description: "${story.introduction}".

CRITICAL RESTRICTIONS:
1. ABSOLUTELY NO TEXT, WORDS, LETTERS, SUBTITLES, OR LABELS in the image.
2. The image must be purely visual/artistic.
3. No gibberish text or symbols that look like letters.
4. Focus on the characters and environment.`;

    return post<{ base64Image: string; mimeType: string }>('/api/image', { prompt });
};

export const sendChatMessage = async (message: string, history: ChatMessage[], story: Story): Promise<{ text: string }> => {
    return post<{ text: string }>('/api/chat', { message, history, story });
};
