import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { logMemoryError } from './errorLogger';
import { buildCompactContext } from './contextSelector';

const MAX_RECENT_TOPICS      = 25;
const MAX_EXAM_PERFORMANCE   = 20;
const MAX_RECENT_MODES       = 15;
const MAX_MENTOR_SUGGESTIONS = 20;
const MAX_REVISION_CYCLES    = 30;
const MAX_LEARNING_INSIGHTS  = 15;

// ── Fix 2 / Fix 4: Time-window constants ─────────────────────────────────────
const THIRTY_MINUTES = 30 * 60 * 1000;
const FIVE_MINUTES   =  5 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function withinLast24Hours(timestamp: number): boolean {
    return Date.now() - timestamp < TWENTY_FOUR_HOURS;
}

// ── Fix 3: Write counter helper ───────────────────────────────────────────────
// Returns fields to spread into every updateDoc payload for write auditing.
function _writeAudit() {
    return { writeCount: increment(1) as unknown as number, lastWriteAt: Date.now() };
}

// ── Part 14: In-memory read cache ─────────────────────────────────────────────
const _cache = new Map<string, { data: StudentMemory; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function _cacheGet(uid: string): StudentMemory | null {
    const entry = _cache.get(uid);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) { _cache.delete(uid); return null; }
    return entry.data;
}
function _cacheSet(uid: string, data: StudentMemory) {
    _cache.set(uid, { data, ts: Date.now() });
}
function _cachePatch(uid: string, partial: Partial<StudentMemory>) {
    const entry = _cache.get(uid);
    if (entry) _cache.set(uid, { data: { ...entry.data, ...partial }, ts: entry.ts });
}
export function invalidateMemoryCache(uid: string) {
    _cache.delete(uid);
}

// ── Part 13: Extended StudentMemory schema ────────────────────────────────────

export interface StudentMemory {
    uid:               string;
    name:              string;
    email:             string | null;
    createdAt:         any;
    updatedAt:         any;
    preferredLanguage: 'English' | 'Tamil' | 'Tanglish';
    learningGoal:      null | '10th Board' | '12th Board' | 'NEET' | 'JEE';
    welcomeShown:      boolean;
    welcomeVariant:    number;

    // Fix 3: Write frequency tracking
    writeCount:  number;
    lastWriteAt: number;

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
        topic:         string;
        subject:       string;
        weaknessScore: number;
        lastDetected:  number;
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

    // ── Part 13 extensions ───────────────────────────────────────────────────

    studyPlans: Array<{
        date:        string;
        tasks:       Array<{ icon: string; text: string; mode: string; topic?: string }>;
        completed:   string[];
        generatedAt: number;
    }>;

    revisionCycles: Array<{
        topic:           string;
        subject:         string;
        cycleCount:      number;
        lastRevised:     number;
        nextRevisionDue: number;
        masteryScore:    number;
    }>;

    learningInsights: Array<{
        insight:      string;
        type:         'strength' | 'opportunity' | 'habit' | 'curiosity';
        generatedAt:  number;
        acknowledged: boolean;
    }>;

    subjectStrengths: Array<{
        subject:       string;
        avgScore:      number;
        topicsStudied: number;
        lastUpdated:   number;
    }>;

    goalTracking: {
        goal:                StudentMemory['learningGoal'];
        startDate:           string;
        milestonesCompleted: string[];
        currentProgress:     number;
    } | null;

    conceptConnections: Array<{
        from:       string;
        to:         string;
        link:       string;
        reinforced: number;
    }>;

    mentorSuggestions: Array<{
        suggestion:  string;
        mode:        'chat' | 'story' | 'exam' | 'game';
        topic?:      string;
        generatedAt: number;
        acted:       boolean;
    }>;
}

// ── Core read/write ───────────────────────────────────────────────────────────

export async function getStudentMemory(uid: string, forceRefresh = false): Promise<StudentMemory | null> {
    try {
        if (!forceRefresh) {
            const cached = _cacheGet(uid);
            if (cached) return cached;
        }
        const snap = await getDoc(doc(db, 'students_memory', uid));
        if (!snap.exists()) return null;
        const data = snap.data() as StudentMemory;
        _cacheSet(uid, data);
        return data;
    } catch (e) {
        logMemoryError('getStudentMemory', e, { uid });
        return null;
    }
}

export async function initializeStudentMemory(user: {
    uid: string; displayName: string | null; email: string | null;
}): Promise<void> {
    try {
        const ref  = doc(db, 'students_memory', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            _cacheSet(user.uid, snap.data() as StudentMemory);
            return;
        }
        const initial: Omit<StudentMemory, 'createdAt' | 'updatedAt'> & { createdAt: any; updatedAt: any } = {
            uid:   user.uid,
            name:  user.displayName || 'Student',
            email: user.email || null,
            createdAt:  serverTimestamp(),
            updatedAt:  serverTimestamp(),
            preferredLanguage: 'English',
            learningGoal:      null,
            welcomeShown:      false,
            welcomeVariant:    0,
            writeCount:  0,
            lastWriteAt: 0,
            streak: { current: 1, longest: 1, lastActiveDate: new Date().toISOString().split('T')[0] },
            recentTopics:          [],
            weakTopics:            [],
            recentExamPerformance: [],
            recentModes:           [],
            studyPlans:         [],
            revisionCycles:     [],
            learningInsights:   [],
            subjectStrengths:   [],
            goalTracking:       null,
            conceptConnections: [],
            mentorSuggestions:  [],
        };
        await setDoc(ref, initial);
        _cacheSet(user.uid, initial as StudentMemory);
    } catch (e) {
        logMemoryError('initializeStudentMemory', e, { uid: user.uid });
    }
}

// ── Write helpers ─────────────────────────────────────────────────────────────

export async function updateRecentTopic({
    uid, topic, subject, source,
}: { uid: string; topic: string; subject: string; source: 'chat' | 'story' | 'exam' | 'game' }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;

        // Fix 2: Skip if same topic+source was logged within 30 minutes
        const recentDuplicate = memory.recentTopics.find(t =>
            t.topic.toLowerCase() === topic.toLowerCase() &&
            t.source === source &&
            Date.now() - t.timestamp < THIRTY_MINUTES
        );
        if (recentDuplicate) return;

        const filtered = memory.recentTopics
            .filter(t => t.topic.toLowerCase() !== topic.toLowerCase())
            .slice(0, MAX_RECENT_TOPICS - 1);
        const newTopics = [{ topic, subject, source, timestamp: Date.now() }, ...filtered];
        await updateDoc(doc(db, 'students_memory', uid), {
            recentTopics: newTopics,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { recentTopics: newTopics });
    } catch (e) {
        logMemoryError('updateRecentTopic', e, { uid, topic });
    }
}

export async function updateWeakTopic({
    uid, topic, subject, weaknessIncrement = 1,
}: { uid: string; topic: string; subject: string; weaknessIncrement?: number }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        const existing = memory.weakTopics.find(w => w.topic.toLowerCase() === topic.toLowerCase());
        const updated = existing
            ? memory.weakTopics.map(w =>
                w.topic.toLowerCase() === topic.toLowerCase()
                    ? { ...w, weaknessScore: w.weaknessScore + weaknessIncrement, lastDetected: Date.now() }
                    : w
            )
            : [...memory.weakTopics, { topic, subject, weaknessScore: weaknessIncrement, lastDetected: Date.now() }];
        await updateDoc(doc(db, 'students_memory', uid), {
            weakTopics: updated,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { weakTopics: updated });
    } catch (e) {
        logMemoryError('updateWeakTopic', e, { uid, topic });
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

        const existing = memory.subjectStrengths.find(s => s.subject === subject);
        const allForSubject = newPerformance.filter(p => p.subject === subject);
        const avgScore = allForSubject.length > 0
            ? allForSubject.reduce((s, p) => s + (p.total > 0 ? p.score / p.total : 0), 0) / allForSubject.length
            : 0;
        const newStrengths = existing
            ? memory.subjectStrengths.map(s =>
                s.subject === subject
                    ? { ...s, avgScore, topicsStudied: s.topicsStudied + 1, lastUpdated: Date.now() }
                    : s
            )
            : [...memory.subjectStrengths, { subject, avgScore, topicsStudied: 1, lastUpdated: Date.now() }];

        await updateDoc(doc(db, 'students_memory', uid), {
            recentExamPerformance: newPerformance,
            subjectStrengths:      newStrengths,
            updatedAt:             serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { recentExamPerformance: newPerformance, subjectStrengths: newStrengths });
    } catch (e) {
        logMemoryError('updateExamPerformance', e, { uid, chapter, subject });
    }
}

export async function updateRecentMode({
    uid, mode,
}: { uid: string; mode: 'chat' | 'story' | 'exam' | 'game' }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;

        // Fix 4: Skip if same mode logged within 5 minutes
        const recentMode = memory.recentModes.find(m =>
            m.mode === mode &&
            Date.now() - m.timestamp < FIVE_MINUTES
        );
        if (recentMode) return;

        const newModes = [{ mode, timestamp: Date.now() }, ...memory.recentModes].slice(0, MAX_RECENT_MODES);
        await updateDoc(doc(db, 'students_memory', uid), {
            recentModes: newModes,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { recentModes: newModes });
    } catch (e) {
        logMemoryError('updateRecentMode', e, { uid, mode });
    }
}

export async function updateLearningStreak(uid: string): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        // Fix 5: Exit immediately if streak already counted today (no Firestore write needed)
        const today    = new Date().toISOString().split('T')[0];
        const lastDate = memory.streak.lastActiveDate;
        if (lastDate === today) return;
        const yesterday  = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
        const newCurrent = lastDate === yesterday ? memory.streak.current + 1 : 1;
        const newLongest = Math.max(newCurrent, memory.streak.longest);
        const streak     = { current: newCurrent, longest: newLongest, lastActiveDate: today };
        await updateDoc(doc(db, 'students_memory', uid), {
            streak,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { streak });
    } catch (e) {
        logMemoryError('updateLearningStreak', e, { uid });
    }
}

export async function markWelcomeShown(uid: string, variant: number): Promise<void> {
    try {
        await updateDoc(doc(db, 'students_memory', uid), {
            welcomeShown:   true,
            welcomeVariant: variant,
            updatedAt:      serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { welcomeShown: true, welcomeVariant: variant });
    } catch (e) {
        logMemoryError('markWelcomeShown', e, { uid });
    }
}

// ── Part 13: Mentor suggestion persistence ────────────────────────────────────

export async function saveMentorSuggestion({
    uid, suggestion, mode, topic,
}: { uid: string; suggestion: string; mode: 'chat' | 'story' | 'exam' | 'game'; topic?: string }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;

        // Fix 1: Skip if identical suggestion shown within 24h
        const isDuplicate = memory.mentorSuggestions.some(s =>
            s.suggestion === suggestion &&
            withinLast24Hours(s.generatedAt)
        );
        if (isDuplicate) return;

        const newEntry = { suggestion, mode, topic, generatedAt: Date.now(), acted: false };
        const updated = [newEntry, ...memory.mentorSuggestions].slice(0, MAX_MENTOR_SUGGESTIONS);
        await updateDoc(doc(db, 'students_memory', uid), {
            mentorSuggestions: updated,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { mentorSuggestions: updated });
    } catch (e) {
        logMemoryError('saveMentorSuggestion', e, { uid });
    }
}

export async function saveRevisionCycle({
    uid, topic, subject,
}: { uid: string; topic: string; subject: string }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;

        // Fix 1: Skip if same topic already has an active cycle revised within 24h
        const hasActiveCycle = memory.revisionCycles.some(c =>
            c.topic.toLowerCase() === topic.toLowerCase() &&
            withinLast24Hours(c.lastRevised)
        );
        if (hasActiveCycle) return;

        const now      = Date.now();
        const existing = memory.revisionCycles.find(r => r.topic.toLowerCase() === topic.toLowerCase());
        const gaps     = [2, 4, 7, 14];
        const nextCycle = existing ? existing.cycleCount + 1 : 1;
        const daysUntilNext = gaps[Math.min(nextCycle - 1, gaps.length - 1)];
        const nextDue = now + daysUntilNext * 24 * 60 * 60 * 1000;
        const updated = existing
            ? memory.revisionCycles.map(r =>
                r.topic.toLowerCase() === topic.toLowerCase()
                    ? { ...r, cycleCount: nextCycle, lastRevised: now, nextRevisionDue: nextDue }
                    : r
            )
            : [...memory.revisionCycles, { topic, subject, cycleCount: 1, lastRevised: now, nextRevisionDue: nextDue, masteryScore: 0.5 }];
        const capped = updated.slice(0, MAX_REVISION_CYCLES);
        await updateDoc(doc(db, 'students_memory', uid), {
            revisionCycles: capped,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { revisionCycles: capped });
    } catch (e) {
        logMemoryError('saveRevisionCycle', e, { uid, topic });
    }
}

export async function saveLearningInsight({
    uid, insight, type,
}: { uid: string; insight: string; type: StudentMemory['learningInsights'][0]['type'] }): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;

        // Fix 1: Skip if identical insight saved within 24h
        const isDuplicate = memory.learningInsights.some(i =>
            i.insight === insight &&
            withinLast24Hours(i.generatedAt)
        );
        if (isDuplicate) return;

        const updated = [
            { insight, type, generatedAt: Date.now(), acknowledged: false },
            ...memory.learningInsights,
        ].slice(0, MAX_LEARNING_INSIGHTS);
        await updateDoc(doc(db, 'students_memory', uid), {
            learningInsights: updated,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { learningInsights: updated });
    } catch (e) {
        logMemoryError('saveLearningInsight', e, { uid });
    }
}

export async function updateGoalTracking(uid: string, goal: StudentMemory['learningGoal']): Promise<void> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return;
        const goalTracking = memory.goalTracking?.goal === goal
            ? memory.goalTracking
            : { goal, startDate: new Date().toISOString().split('T')[0], milestonesCompleted: [], currentProgress: 0 };
        await updateDoc(doc(db, 'students_memory', uid), {
            goalTracking,
            learningGoal: goal,
            updatedAt: serverTimestamp(),
            ..._writeAudit(),
        });
        _cachePatch(uid, { goalTracking, learningGoal: goal });
    } catch (e) {
        logMemoryError('updateGoalTracking', e, { uid });
    }
}

// ── Personalized context — subject-aware, compact, 400-char max ──────────────

export async function getPersonalizedContext(uid: string, currentQuery = ''): Promise<string> {
    try {
        const memory = await getStudentMemory(uid);
        if (!memory) return '';
        return buildCompactContext(memory, currentQuery);
    } catch (e) {
        logMemoryError('getPersonalizedContext', e, { uid });
        return '';
    }
}
