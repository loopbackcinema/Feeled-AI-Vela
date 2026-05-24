import { StudentMemory } from './memoryService';

interface SelectedContext {
    relevantTopics:    string[];
    relevantWeaknesses: string[];
    relevantExamScores: string[];
    goalContext:        string;
    streakContext:      string;
    totalTokenEstimate: number;
}

const SUBJECT_KEYWORDS: Record<string, string[]> = {
    physics:   ['inertia', 'motion', 'force', 'gravity', 'electricity',
                 'magnetism', 'light', 'sound', 'heat', 'wave', 'newton'],
    chemistry: ['acid', 'base', 'salt', 'reaction', 'element',
                 'compound', 'periodic', 'carbon', 'metal', 'oxide'],
    biology:   ['cell', 'photosynthesis', 'respiration', 'organ',
                 'tissue', 'evolution', 'nutrition', 'blood', 'nerve'],
    maths:     ['algebra', 'fraction', 'geometry', 'trigonometry',
                 'statistics', 'polynomial', 'equation', 'theorem'],
    social:    ['history', 'geography', 'civics', 'economics',
                 'revolution', 'climate', 'democracy', 'culture'],
};

function detectQuerySubject(query: string): string | null {
    const q = query.toLowerCase();
    for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
        if (keywords.some(k => q.includes(k))) return subject;
    }
    return null;
}

export function selectRelevantContext(
    memory: StudentMemory,
    currentQuery: string,
    maxTopics: number = 3,
    maxWeaknesses: number = 2,
): SelectedContext {
    const querySubject = detectQuerySubject(currentQuery);

    // Filter recent topics by subject relevance
    let relevantTopics = memory.recentTopics
        .slice(0, 10)
        .filter(t => {
            if (!querySubject) return true;
            const keywords = SUBJECT_KEYWORDS[querySubject] || [];
            return keywords.some(k =>
                t.topic.toLowerCase().includes(k) ||
                t.subject.toLowerCase().includes(querySubject)
            );
        })
        .slice(0, maxTopics)
        .map(t => t.topic);

    // Fallback: if no subject match, use most recent
    if (relevantTopics.length === 0) {
        relevantTopics = memory.recentTopics.slice(0, maxTopics).map(t => t.topic);
    }

    // Filter weaknesses by subject
    let relevantWeaknesses = memory.weakTopics
        .filter(w => {
            if (!querySubject) return true;
            const keywords = SUBJECT_KEYWORDS[querySubject] || [];
            return keywords.some(k =>
                w.topic.toLowerCase().includes(k) ||
                w.subject.toLowerCase().includes(querySubject)
            );
        })
        .sort((a, b) => b.weaknessScore - a.weaknessScore)
        .slice(0, maxWeaknesses)
        .map(w => w.topic);

    // Recent exam scores for relevant subject
    const relevantExamScores = memory.recentExamPerformance
        .filter(p => {
            if (!querySubject) return true;
            return p.subject.toLowerCase().includes(querySubject);
        })
        .slice(0, 2)
        .map(p => `${p.subject} ${p.score}/${p.total}`);

    const goalContext    = memory.learningGoal ? `Goal: ${memory.learningGoal}` : '';
    const streakContext  = memory.streak.current >= 3 ? `${memory.streak.current}-day streak` : '';

    const totalTokenEstimate =
        relevantTopics.join(', ').length +
        relevantWeaknesses.join(', ').length +
        relevantExamScores.join(', ').length + 50;

    return {
        relevantTopics,
        relevantWeaknesses,
        relevantExamScores,
        goalContext,
        streakContext,
        totalTokenEstimate,
    };
}

// Part 4: 400-char hard limit
const MAX_CONTEXT_CHARS = 400;

export function buildCompactContext(memory: StudentMemory, currentQuery: string): string {
    const ctx = selectRelevantContext(memory, currentQuery);

    const parts: string[] = [];
    if (ctx.relevantTopics.length > 0)    parts.push(`Recent: ${ctx.relevantTopics.join(', ')}`);
    if (ctx.relevantWeaknesses.length > 0) parts.push(`Needs work: ${ctx.relevantWeaknesses.join(', ')}`);
    if (ctx.relevantExamScores.length > 0) parts.push(`Scores: ${ctx.relevantExamScores.join(', ')}`);
    if (ctx.goalContext)   parts.push(ctx.goalContext);
    if (ctx.streakContext) parts.push(ctx.streakContext);

    if (parts.length === 0) return '';

    const result = `STUDENT CONTEXT:\n- Name: ${memory.name}\n- ${parts.join('\n- ')}`;
    return result.length > MAX_CONTEXT_CHARS
        ? result.substring(0, MAX_CONTEXT_CHARS) + '...'
        : result;
}
