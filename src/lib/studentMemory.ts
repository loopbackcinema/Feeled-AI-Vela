import { db } from '../firebase';
import {
    doc, getDoc, setDoc, updateDoc,
    arrayUnion, serverTimestamp, increment,
} from 'firebase/firestore';

export interface StudentProfile {
    uid: string;
    name: string;
    studied_topics: string[];
    weak_topics: string[];
    recent_scores: Array<{ topic: string; score: number; date: string }>;
    preferred_language: string;
    exam_target: string | null;   // 'board' | 'neet' | 'jee' | null
    streak: number;
    total_questions: number;
    last_active: any;
}

export async function getStudentProfile(uid: string): Promise<StudentProfile | null> {
    try {
        const snap = await getDoc(doc(db, 'student_profile', uid));
        return snap.exists() ? (snap.data() as StudentProfile) : null;
    } catch {
        return null;
    }
}

export async function upsertStudentProfile(
    uid: string,
    name: string,
    language: string,
): Promise<void> {
    try {
        const ref  = doc(db, 'student_profile', uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            await setDoc(ref, {
                uid,
                name,
                studied_topics: [],
                weak_topics: [],
                recent_scores: [],
                preferred_language: language,
                exam_target: null,
                streak: 0,
                total_questions: 0,
                last_active: serverTimestamp(),
            });
        }
    } catch { /* non-critical */ }
}

export async function updateStudiedTopic(uid: string, topic: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'student_profile', uid), {
            studied_topics: arrayUnion(topic),
            last_active: serverTimestamp(),
        });
    } catch { /* non-critical */ }
}

export async function updateExamScore(uid: string, topic: string, score: number): Promise<void> {
    try {
        const entry = { topic, score, date: new Date().toISOString().slice(0, 10) };
        const updates: Record<string, any> = {
            recent_scores: arrayUnion(entry),
            last_active: serverTimestamp(),
        };
        if (score < 50) updates.weak_topics = arrayUnion(topic);
        await updateDoc(doc(db, 'student_profile', uid), updates);
    } catch { /* non-critical */ }
}

export async function incrementQuestionCount(uid: string): Promise<void> {
    try {
        await updateDoc(doc(db, 'student_profile', uid), {
            total_questions: increment(1),
            last_active: serverTimestamp(),
        });
    } catch { /* non-critical */ }
}
