import { create } from 'zustand';
import { StudentContext } from '../types';

type StudentStore = StudentContext & {
    setContext: (patch: Partial<StudentContext>) => void;
};

export const useStudentStore = create<StudentStore>((set) => ({
    board: 'Tamil Nadu State Board (Samacheer)',
    standard: '10th',
    subject: 'Science',
    language: 'English',
    learningMode: 'Senior',
    goal: 'Exam',
    setContext: (patch) => set(patch),
}));
