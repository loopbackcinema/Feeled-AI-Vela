import type { StudentMemory } from './memoryService';

export interface StudyTask {
    icon: string;
    text: string;
    mode: 'chat' | 'story' | 'exam' | 'game';
    topic?: string;
}

export interface RevisionItem {
    topic: string;
    subject: string;
    priority: 'urgent' | 'soon';
    reason: string;
}

export function generateDailyLearningGoals(memory: StudentMemory): StudyTask[] {
    const tasks: StudyTask[] = [];

    // Revise weak topics
    if (memory.weakTopics && memory.weakTopics.length > 0) {
        const wt = memory.weakTopics[0];
        tasks.push({
            icon: '📖',
            text: `Revise ${wt.topic} (${wt.subject})`,
            mode: 'chat',
            topic: wt.topic,
        });
    }

    // Practice MCQs on recent topic
    if (memory.recentTopics && memory.recentTopics.length > 0) {
        const rt = memory.recentTopics[0];
        tasks.push({
            icon: '📝',
            text: `Practice 5 ${rt.subject} MCQs on ${rt.topic}`,
            mode: 'exam',
            topic: rt.topic,
        });
    }

    // Story mode suggestion if not used recently
    const last5Modes = (memory.recentModes || []).slice(0, 5).map(m => m.mode);
    const hasRecentStory = last5Modes.includes('story');
    if (!hasRecentStory && memory.recentTopics && memory.recentTopics.length > 1) {
        const rt = memory.recentTopics[1];
        tasks.push({
            icon: '✨',
            text: `Read ${rt.topic} as a story`,
            mode: 'story',
            topic: rt.topic,
        });
    }

    // Game mode suggestion if not used in last 7 modes
    const last7Modes = (memory.recentModes || []).slice(0, 7).map(m => m.mode);
    const hasRecentGame = last7Modes.includes('game');
    if (!hasRecentGame) {
        tasks.push({
            icon: '🎮',
            text: 'Practice through a learning game',
            mode: 'game',
        });
    }

    // Retry failed mock tests
    if (memory.recentExamPerformance) {
        const failed = memory.recentExamPerformance.find(p => p.total > 0 && p.score / p.total < 0.6);
        if (failed) {
            tasks.push({
                icon: '🔄',
                text: `Retry ${failed.chapter} mock test`,
                mode: 'exam',
                topic: failed.chapter,
            });
        }
    }

    return tasks.slice(0, 4);
}

export function generateRevisionSchedule(memory: StudentMemory): RevisionItem[] {
    const items: RevisionItem[] = [];
    const seenTopics = new Set<string>();
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;

    // Urgent: weak topics with score >= 2
    for (const wt of (memory.weakTopics || [])) {
        if (items.length >= 3) break;
        if (wt.weaknessScore >= 2 && !seenTopics.has(wt.topic.toLowerCase())) {
            seenTopics.add(wt.topic.toLowerCase());
            items.push({
                topic: wt.topic,
                subject: wt.subject,
                priority: 'urgent',
                reason: 'struggled in recent practice',
            });
        }
    }

    // Soon: recent topics not revisited in 3 days
    for (const rt of (memory.recentTopics || [])) {
        if (items.length >= 3) break;
        if (rt.timestamp < threeDaysAgo && !seenTopics.has(rt.topic.toLowerCase())) {
            seenTopics.add(rt.topic.toLowerCase());
            items.push({
                topic: rt.topic,
                subject: rt.subject,
                priority: 'soon',
                reason: 'not revisited in a few days',
            });
        }
    }

    // Urgent: exam performance below 50%
    for (const perf of (memory.recentExamPerformance || [])) {
        if (items.length >= 3) break;
        if (perf.total > 0 && perf.score / perf.total < 0.5 && !seenTopics.has(perf.chapter.toLowerCase())) {
            seenTopics.add(perf.chapter.toLowerCase());
            items.push({
                topic: perf.chapter,
                subject: perf.subject,
                priority: 'urgent',
                reason: 'below 50% in mock test',
            });
        }
    }

    return items.slice(0, 3);
}

export function generateMotivationalGuidance(memory: StudentMemory): string {
    const streak = memory.streak?.current || 0;

    if (streak >= 7) {
        return `Studying ${streak} days in a row builds real long-term retention — keep the pattern.`;
    }

    if (streak >= 3) {
        return `Consistent study across ${streak} days is exactly how concepts stick.`;
    }

    // Check if recent topics span 3+ different subjects
    const recentSubjects = [...new Set((memory.recentTopics || []).slice(0, 10).map(t => t.subject))];
    if (recentSubjects.length >= 3) {
        const subjectList = recentSubjects.slice(0, 3).join(', ');
        return `You've covered ${subjectList} this week — cross-subject practice strengthens overall reasoning.`;
    }

    // Check average exam performance
    const exams = memory.recentExamPerformance || [];
    if (exams.length > 0) {
        const avg = exams.reduce((sum, p) => sum + (p.total > 0 ? p.score / p.total : 0), 0) / exams.length;
        if (avg >= 0.7) {
            return 'Recent mock test scores above 70% indicate solid preparation.';
        }
    }

    // Check weak topics count
    const weakCount = (memory.weakTopics || []).length;
    if (weakCount >= 3) {
        return `You have ${weakCount} topics that need revision — targeted review here will have the highest impact on exam performance.`;
    }

    return 'Start with one topic today — even 15 minutes of focused study builds momentum.';
}

export function generateFuturePathSuggestions(memory: StudentMemory): string[] {
    const goal = memory.learningGoal;

    if (goal === '10th Board') {
        return [
            'Focus on 2-mark and 5-mark question formats — TN Board rewards structured answers.',
            'Repeatedly practiced definitions and formulas appear in almost every paper.',
            "Past 5 years' repeated questions are the most efficient revision target.",
        ];
    }

    if (goal === '12th Board') {
        return [
            'Derivations and proof-based questions carry high marks in 12th Board papers.',
            'Conceptual clarity in Chemistry reactions and Physics numericals is essential.',
            'Practice answer writing with key diagrams — visual answers score higher.',
        ];
    }

    if (goal === 'NEET') {
        return [
            'Biology conceptual mastery at NCERT level is the foundation of NEET success.',
            'Repeated revision of Biology chapters yields more marks than cramming new material.',
            'Organic Chemistry reaction mechanisms and Physics numerical speed need focused practice.',
        ];
    }

    if (goal === 'JEE') {
        return [
            'Mathematics problem-solving speed is the deciding factor in JEE performance.',
            'Physics numericals require daily timed practice — accuracy under pressure matters.',
            'Chemistry: organic mechanisms and physical chemistry numericals are high-yield.',
        ];
    }

    return [
        'Explore topics from multiple subjects to build broad academic foundation.',
        'Regular short practice sessions outperform occasional long study marathons.',
        'Connect concepts across subjects — interdisciplinary understanding deepens retention.',
    ];
}

const CONNECTIONS: Record<string, { to: string; link: string }[]> = {
    'electricity': [{ to: 'magnetism', link: 'current flow creates magnetic fields' }, { to: "ohm's law", link: 'resistance governs current in circuits' }],
    'photosynthesis': [{ to: 'respiration', link: 'both involve energy conversion in cells' }, { to: 'food chain', link: 'photosynthesis is the energy entry point' }],
    'motion': [{ to: "newton's laws", link: 'laws describe the causes of motion' }, { to: 'momentum', link: 'momentum depends on mass and velocity' }],
    'acids': [{ to: 'bases', link: 'acids and bases neutralize each other' }, { to: 'salts', link: 'neutralization produces salts and water' }],
    'cell': [{ to: 'tissues', link: 'cells form tissues through specialization' }, { to: 'dna', link: 'DNA inside the cell carries genetic information' }],
    'light': [{ to: 'refraction', link: 'light bends when passing between media' }, { to: 'lenses', link: 'lenses use refraction to focus light' }],
    'algebra': [{ to: 'equations', link: 'algebra provides tools to solve equations' }, { to: 'graphs', link: 'algebraic functions map to geometric graphs' }],
    'periodic table': [{ to: 'atomic structure', link: 'element position reflects electron configuration' }, { to: 'chemical bonding', link: 'valence electrons determine bonding' }],
    'heredity': [{ to: 'dna', link: 'DNA is the molecular basis of heredity' }, { to: 'evolution', link: 'hereditary variation drives natural selection' }],
    'democracy': [{ to: 'constitution', link: 'constitution defines the framework of democracy' }, { to: 'fundamental rights', link: 'democracy guarantees fundamental rights' }],
};

export function generateConceptConnections(memory: StudentMemory): { from: string; to: string; link: string }[] {
    const connections: { from: string; to: string; link: string }[] = [];
    const seen = new Set<string>();

    const topics = (memory.recentTopics || []).slice(0, 5);

    for (const rt of topics) {
        if (connections.length >= 3) break;
        const key = rt.topic.toLowerCase();
        const matches = CONNECTIONS[key];
        if (matches) {
            for (const match of matches) {
                if (connections.length >= 3) break;
                const dedupeKey = `${key}->${match.to}`;
                if (!seen.has(dedupeKey)) {
                    seen.add(dedupeKey);
                    connections.push({ from: rt.topic, to: match.to, link: match.link });
                }
            }
        }
    }

    return connections;
}

export function generateExamPriorityRecommendations(memory: StudentMemory): string[] {
    const priorities: string[] = [];
    const seen = new Set<string>();

    // 1. Top 2 weak topics by score
    const sortedWeak = [...(memory.weakTopics || [])].sort((a, b) => b.weaknessScore - a.weaknessScore);
    for (const wt of sortedWeak.slice(0, 2)) {
        const label = `${wt.subject} — ${wt.topic}`;
        if (!seen.has(wt.topic.toLowerCase())) {
            seen.add(wt.topic.toLowerCase());
            priorities.push(label);
        }
    }

    // 2. Top 2 low-scoring exam topics not already included
    const lowExams = (memory.recentExamPerformance || []).filter(p => p.total > 0 && p.score / p.total < 0.6);
    for (const perf of lowExams.slice(0, 2)) {
        if (priorities.length >= 4) break;
        if (!seen.has(perf.chapter.toLowerCase())) {
            seen.add(perf.chapter.toLowerCase());
            priorities.push(`${perf.subject} — ${perf.chapter}`);
        }
    }

    // 3. Fallback goal-specific topics
    if (priorities.length < 3) {
        const goal = memory.learningGoal;
        let fallbacks: string[] = [];
        if (goal === 'NEET') {
            fallbacks = ['Biology — Cell Division', 'Chemistry — Organic Reactions', 'Physics — Optics'];
        } else if (goal === 'JEE') {
            fallbacks = ['Mathematics — Calculus', 'Physics — Mechanics', 'Chemistry — Electrochemistry'];
        } else if (goal === '10th Board') {
            fallbacks = ['Science — Electricity', 'Maths — Algebra', 'Social Science — Democracy'];
        } else if (goal === '12th Board') {
            fallbacks = ['Physics — Electrostatics', 'Chemistry — Coordination Compounds', 'Maths — Calculus'];
        } else {
            fallbacks = ["Any topic you haven't revisited in 3+ days"];
        }
        for (const fb of fallbacks) {
            if (priorities.length >= 5) break;
            priorities.push(fb);
        }
    }

    return priorities.slice(0, 5);
}

export function generateLearningHabitInsights(memory: StudentMemory): string[] {
    const insights: string[] = [];

    // Check mode balance
    const last10Modes = (memory.recentModes || []).slice(0, 10).map(m => m.mode);
    const uniqueModes = new Set(last10Modes);
    if (last10Modes.length >= 5 && uniqueModes.size === 1) {
        const onlyMode = [...uniqueModes][0];
        insights.push(`You're mainly using ${onlyMode} mode — mixing in stories or games can make concepts stick differently.`);
    }

    // Short streak
    const streak = memory.streak?.current || 0;
    if (streak < 3) {
        insights.push('Short study gaps reduce retention — even 10 minutes daily is more effective than long sessions every few days.');
    }

    // Too many topics with too many weak
    const topicCount = (memory.recentTopics || []).length;
    const weakCount = (memory.weakTopics || []).length;
    if (topicCount > 15 && weakCount > 5) {
        insights.push("You're exploring many topics — spending more time deepening fewer topics at a time may strengthen understanding.");
    }

    // No exam performance
    if ((memory.recentExamPerformance || []).length === 0) {
        insights.push('Regular mock tests help reveal gaps that normal study misses — try one soon.');
    }

    return insights.slice(0, 3);
}

export function generateStudyPlan(memory: StudentMemory): { today: StudyTask[]; thisWeek: string[]; revisionQueue: string[] } {
    const today = generateDailyLearningGoals(memory);

    const goal = memory.learningGoal;
    let thisWeek: string[];

    if (goal === 'NEET') {
        thisWeek = [
            'Complete 1 Biology chapter revision',
            'Practice 20 Chemistry MCQs',
            'Time 10 Physics numericals',
        ];
    } else if (goal === 'JEE') {
        thisWeek = [
            'Solve 10 Maths problems daily',
            'Practice Physics derivations',
            'Review Chemistry reaction mechanisms',
        ];
    } else if (goal === '10th Board' || goal === '12th Board') {
        const sortedWeak = [...(memory.weakTopics || [])].sort((a, b) => b.weaknessScore - a.weaknessScore);
        const topWeakSubject = sortedWeak.length > 0 ? sortedWeak[0].subject : 'your weakest subject';
        thisWeek = [
            `Revise all formulas in ${topWeakSubject}`,
            'Write model answers for 5-mark questions',
            'Take 1 full mock test',
        ];
    } else {
        thisWeek = [
            'Explore one new concept per day',
            'Try a story to understand difficult topics',
            'Take 1 short quiz to test understanding',
        ];
    }

    const revisionSchedule = generateRevisionSchedule(memory);
    const revisionQueue = revisionSchedule.slice(0, 3).map(item => item.topic);

    return { today, thisWeek, revisionQueue };
}
