import { create } from 'zustand';
import { Story, ConceptResponse, PracticeQuestion, ExamPrep } from '../types';

interface SessionState {
    currentQuestion: string;
    conceptData: ConceptResponse | null;
    practiceData: PracticeQuestion[] | null;
    examData: ExamPrep | null;
    generatedStory: Story | null;
    base64Audio: string | null;
    base64Image: string | null;
    imageMimeType: string | null;
    lastLanguage: string;
}

type SessionStore = SessionState & {
    set: (patch: Partial<SessionState>) => void;
    reset: () => void;
};

const initial: SessionState = {
    currentQuestion: '',
    conceptData: null,
    practiceData: null,
    examData: null,
    generatedStory: null,
    base64Audio: null,
    base64Image: null,
    imageMimeType: null,
    lastLanguage: 'English',
};

export const useSessionStore = create<SessionStore>((set) => ({
    ...initial,
    set: (patch) => set(patch),
    reset: () => set(initial),
}));
