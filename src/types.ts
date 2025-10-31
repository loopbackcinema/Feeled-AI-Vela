export interface Story {
    title: string;
    emotion_tone: string;
    introduction: string;
    emotional_trigger: string;
    concept_explanation: string;
    resolution: string;
    moral_message: string;
    conclusion: string;
}

export interface StoryRequest {
    topic: string;
    std: string;
    language: string;
    narratorVoice: string;
    emotionTone: string;
}

export type Page = 'generator' | 'story' | 'about' | 'contact' | 'privacy';
