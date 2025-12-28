
export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

export interface Story {
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

export interface StoryRequest {
    topic: string;
    std: string;
    language: string;
    narratorVoice: string;
    emotionTone: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type Page = 'generator' | 'student-generator' | 'story' | 'about' | 'founder' | 'research' | 'contact' | 'privacy' | 'pilot' | 'inclusive' | 'teachers' | 'parents' | 'dashboard';

export interface UserProfile {
    role: 'teacher' | 'student' | 'parent';
    name: string;
    uiLanguage: 'English' | 'Tamil';
    isHighContrast: boolean;
}
