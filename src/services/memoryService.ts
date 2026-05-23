import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const MAX_RECENT_TOPICS    = 25;
const MAX_EXAM_PERFORMANCE = 20;
const MAX_RECENT_MODES     = 15;

export interface StudentMemory {
    uid:               string;
    name:              string;
    email:             string | null;
    createdAt:         any;
    updatedAt:         any;
    preferredLanguage: 'English' | 'Tamil' | 'Tanglish';
    learningGoal:      null | '10th Board' | '12th Board' | 'NEET' | 'JEE';
    streak: {
        current:        number;
        longest:        number;
        lastActiveDate: string;
    };
    recentTopics: Array<{
        topic:     string;
        subject:   string;
        source:    'chat' | 'story' | 'exam' | 'game';
        timestamp: number;
    }>;
    weakTopics: Array<{
        topic:        string;
        subject:      string;
        weaknessScore: number;
        lastDetected: number;
    }>;
    recentExamPerformance: Array<{
        chapter:   string;
        subject:   string;
        score:     number;
        total:     number;
        timestamp: number;
    }>;
    recentModes: Array<{
        mode:      'chat' | 'story' | 'exam' | 'game';
        timestamp: number;
    }>;
}

export async function getStudentMemory(uid: string): Promise<StudentMemory | null> {
    try {
        const snap = await getDoc(doc(db, 'students_memory', uid));
        return snap.exists() ? (snap.data() as StudentMemory) : null;
    } catch (e) {
        console.warn('getStudentMemory error:', e);
        return null;
    }
}

export async function initializeStudentMemory(user: {
    uid: string; displayName: string | null; email: string | null;
}): Promise<void> {
    try {
        const ref  = doc(db, 'students_memory', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) return;
        await setDoc(ref, {
            uid:   user.uid,
            name:  user.displayName || 'Student',
            email: user.email || null,
            createdAt:  serverTimestamp(),
            updatedAt:  serverTimestamp(),
            preferredLanguage: 'English',
            learningGoal:      null,
            streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
            recentTopics:          [],
            weakTopics:            [],
            recentExamPerformance: [],
            recentModes:           [],
        });
    } catch (e) {
        console.warn('initializeStudentMemory error:', e);
    }
}

export async function updateRecentTopic({
    uid, topic, subject, source,
}: { uid: string; topic: string; subject: string; source: 'chat' | 'story' | 'exam' | 'game' }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        const filtered = memory.recentTopics
            .filter(t => t.topic.toLowerCase() !== topic.toLowerCase())
            .slice(0, MAX_RECENT_TOPICS - 1);
        const newTopics = [{ topic, subject, source, timestamp: Date.now() }, ...filtered];
        await updateDoc(doc(db, 'students_memory', uid), { recentTopics: newTopics, updatedAt: serverTimestamp() });
    } catch (e) {
        console.warn('updateRecentTopic error:', e);
    }
}

export async function updateWeakTopic({
    uid, topic, subject, weaknessIncrement = 1,
}: { uid: string; topic: string; subject: string; weaknessIncrement?: number }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        const existing = memory.weakTopics.find(w => w.topic.toLowerCase() === topic.toLowerCase());
        const updatedWeakTopics = existing
            ? memory.weakTopics.map(w =>
                w.topic.toLowerCase() === topic.toLowerCase()
                    ? { ...w, weaknessScore: w.weaknessScore + weaknessIncrement, lastDetected: Date.now() }
                    : w
            )
            : [...memory.weakTopics, { topic, subject, weaknessScore: weaknessIncrement, lastDetected: Date.now() }];
        await updateDoc(doc(db, 'students_memory', uid), { weakTopics: updatedWeakTopics, updatedAt: serverTimestamp() });
    } catch (e) {
        console.warn('updateWeakTopic error:', e);
    }
}

export async function updateExamPerformance({
    uid, chapter, subject, score, total,
}: { uid: string; chapter: string; subject: string; score: number; total: number }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        if (score / total < 0.5) {
            await updateWeakTopic({ uid, topic: chapter, subject, weaknessIncrement: 2 });
        }
        const newPerformance = [
            { chapter, subject, score, total, timestamp: Date.now() },
            ...memory.recentExamPerformance,
        ].slice(0, MAX_EXAM_PERFORMANCE);
        await updateDoc(doc(db, 'students_memory', uid), {
            recentExamPerformance: newPerformance,
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.warn('updateExamPerformance error:', e);
    }
}

export async function updateRecentMode({
    uid, mode,
}: { uid: string; mode: 'chat' | 'story' | 'exam' | 'game' }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        const newModes = [
            { mode, timestamp: Date.now() },
            ...memory.recentModes,
        ].slice(0, MAX_RECENT_MODES);
        await updateDoc(doc(db, 'students_memory', uid), { recentModes: newModes, updatedAt: serverTimestamp() });
    } catch (e) {
        console.warn('updateRecentMode error:', e);
    }
}

export async function updateLearningStreak(uid: string): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        const today     = new Date().toISOString().split('T')[0];
        const lastDate  = memory.streak.lastActiveDate;
        if (lastDate === today) return;
        const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
        const newCurrent = lastDate === yesterday ? memory.streak.current + 1 : 1;
        const newLongest = Math.max(newCurrent, memory.streak.longest);
        await updateDoc(doc(db, 'students_memory', uid), {
            streak:    { current: newCurrent, longest: newLongest, lastActiveDate: today },
            updatedAt: serverTimestamp(),
        });
    } catch (e) {
        console.warn('updateLearningStreak error:', e);
    }
}

export async function getPersonalizedContext(uid: string): Promise<string> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return '';

        const recentTopicNames = memory.recentTopics
            .slice(0, 5).map(t => t.topic).join(', ') || 'None yet';

        const weakTopicNames = memory.weakTopics
            .sort((a, b) => b.weaknessScore - a.weaknessScore)
            .slice(0, 3).map(t => t.topic).join(', ') || 'None detected yet';

        const recentScores = memory.recentExamPerformance
            .slice(0, 3).map(p => `${p.subject} ${p.score}/${p.total}`).join(', ') || 'No exams taken yet';

        return `STUDENT MEMORY CONTEXT:
- Student name: ${memory.name}
- Recently studied: ${recentTopicNames}
- Weak topics: ${weakTopicNames}
- Recent exam scores: ${recentScores}
- Preferred language: ${memory.preferredLanguage}
- Learning goal: ${memory.learningGoal || 'Not set'}
- Current streak: ${memory.streak.current} days`.trim();
    } catch (e) {
        console.warn('getPersonalizedContext error:', e);
        return '';
    }
}
