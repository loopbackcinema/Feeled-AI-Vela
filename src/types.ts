
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
    difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type Page = 'home' | 'chat' | 'generator' | 'story' | 'about' | 'founder' | 'research' | 'contact' | 'privacy' | 'pilot' | 'inclusive' | 'teachers' | 'parents' | 'my-stories' | 'student-dashboard' | 'admin-dashboard' | 'answer' | 'practice' | 'exam';

export interface RagCitation {
    subject:    string;
    chapter:    string;
    chapterNum: number;
    page:       number;
    chunkType:  string;
    score:      number;
}

export interface StudyChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    ragUsed?: boolean;
    timestamp: number;
    suggestions?: string[];
    ragCitations?: RagCitation[];
}

export interface StudentContext {
    board: string;
    standard: string;
    subject: string;
    language: string;
    learningMode: 'Junior' | 'Senior';
    goal: 'Exam' | 'Deep Learning';
}

export interface ConceptResponse {
    textbookAnswer: string;
    examFormat: string[];
    simpleExplanation: string;
    keyKeywords: string[];
    markBasedAnswers?: {
        twoMark: string;
        fiveMark: string;
    };
}

export interface PracticeQuestion {
    type: 'mcq' | 'short' | 'long';
    question: string;
    options?: string[];
    correctAnswer: string;
}

export interface ExamPrep {
    importantQuestions: string[];
    revisionNotes: string[];
    predictedQuestions: string[];
}

export interface UserSettings {
    isHighContrast: boolean;
    isDyslexicFont: boolean;
    uiLanguage: 'English' | 'Tamil';
}
