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

export interface RevisionPriority {
    topic: string;
    subject: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    daysSinceLastStudy?: number;
    improvementNote?: string;
}

export interface LearningPattern {
    type: 'strength' | 'opportunity' | 'habit' | 'curiosity';
    observation: string;
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

// ── Part 4: Smart Revision Engine ────────────────────────────────────────────

export function generateSmartRevisionPlan(memory: StudentMemory): RevisionPriority[] {
    const plan: RevisionPriority[] = [];
    const seen = new Set<string>();
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // HIGH: weak topics with score >= 3
    for (const wt of (memory.weakTopics || []).sort((a, b) => b.weaknessScore - a.weaknessScore)) {
        if (plan.length >= 6) break;
        if (seen.has(wt.topic.toLowerCase())) continue;
        seen.add(wt.topic.toLowerCase());
        plan.push({
            topic: wt.topic, subject: wt.subject, priority: wt.weaknessScore >= 3 ? 'HIGH' : 'MEDIUM',
            reason: wt.weaknessScore >= 3
                ? 'Repeatedly struggled — needs focused revision cycle'
                : 'Some difficulty detected — one more revision recommended',
        });
    }

    // HIGH: exam performance < 50% (check for repeated failure)
    const examCounts: Record<string, number> = {};
    for (const perf of (memory.recentExamPerformance || [])) {
        const ratio = perf.total > 0 ? perf.score / perf.total : 1;
        if (ratio < 0.5) examCounts[perf.chapter] = (examCounts[perf.chapter] || 0) + 1;
    }
    for (const [chapter, count] of Object.entries(examCounts)) {
        if (plan.length >= 6) break;
        if (seen.has(chapter.toLowerCase())) continue;
        const perf = memory.recentExamPerformance.find(p => p.chapter === chapter)!;
        seen.add(chapter.toLowerCase());
        const note = count >= 2 ? `Chemical Equations still needs one more revision cycle.` : undefined;
        plan.push({
            topic: chapter, subject: perf.subject,
            priority: count >= 2 ? 'HIGH' : 'MEDIUM',
            reason: count >= 2 ? 'Failed mock test multiple times' : 'Below 50% in mock test',
            improvementNote: note,
        });
    }

    // MEDIUM/HIGH: topics not studied in 3+ days
    for (const rt of (memory.recentTopics || [])) {
        if (plan.length >= 6) break;
        if (seen.has(rt.topic.toLowerCase())) continue;
        const daysAgo = Math.floor((now - rt.timestamp) / day);
        if (daysAgo < 3) continue;
        seen.add(rt.topic.toLowerCase());
        plan.push({
            topic: rt.topic, subject: rt.subject,
            priority: daysAgo >= 7 ? 'HIGH' : daysAgo >= 5 ? 'MEDIUM' : 'LOW',
            reason: daysAgo >= 7
                ? `${rt.topic} has not been revised in ${daysAgo} days`
                : `Not revisited in ${daysAgo} days`,
            daysSinceLastStudy: daysAgo,
        });
    }

    // LOW: topics where score improved (worth maintaining)
    const byChapter: Record<string, number[]> = {};
    for (const p of (memory.recentExamPerformance || [])) {
        if (!byChapter[p.chapter]) byChapter[p.chapter] = [];
        byChapter[p.chapter].push(p.total > 0 ? p.score / p.total : 0);
    }
    for (const [chapter, scores] of Object.entries(byChapter)) {
        if (plan.length >= 6) break;
        if (seen.has(chapter.toLowerCase()) || scores.length < 2) continue;
        const latest = scores[0], prev = scores[scores.length - 1];
        if (latest > prev && latest >= 0.6) {
            seen.add(chapter.toLowerCase());
            const perf = memory.recentExamPerformance.find(p => p.chapter === chapter)!;
            plan.push({
                topic: chapter, subject: perf.subject, priority: 'LOW',
                reason: 'Improving — maintain with one more revision',
                improvementNote: `You improved in ${chapter} after your second revision.`,
            });
        }
    }

    // Sort: HIGH → MEDIUM → LOW
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return plan.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 6);
}

// ── Part 5: Learning Pattern Detection ───────────────────────────────────────

export function detectLearningPatterns(memory: StudentMemory): LearningPattern[] {
    const patterns: LearningPattern[] = [];

    // Strong subjects: avg exam score >= 0.7 in subjects with 2+ entries
    const scoresBySubject: Record<string, number[]> = {};
    for (const p of (memory.recentExamPerformance || [])) {
        if (!scoresBySubject[p.subject]) scoresBySubject[p.subject] = [];
        scoresBySubject[p.subject].push(p.total > 0 ? p.score / p.total : 0);
    }
    for (const [subject, scores] of Object.entries(scoresBySubject)) {
        if (scores.length < 2) continue;
        const avg = scores.reduce((s, n) => s + n, 0) / scores.length;
        if (avg >= 0.7) {
            patterns.push({ type: 'strength', observation: `You perform consistently well in ${subject} mock tests — that's a reliable exam strength.` });
        }
    }

    // Curiosity areas: most explored subject (most unique topics)
    const topicsBySubject: Record<string, Set<string>> = {};
    for (const t of (memory.recentTopics || [])) {
        if (!topicsBySubject[t.subject]) topicsBySubject[t.subject] = new Set();
        topicsBySubject[t.subject].add(t.topic.toLowerCase());
    }
    let mostCurious = { subject: '', count: 0 };
    for (const [subject, topics] of Object.entries(topicsBySubject)) {
        if (topics.size > mostCurious.count) mostCurious = { subject, count: topics.size };
    }
    if (mostCurious.count >= 4) {
        patterns.push({ type: 'curiosity', observation: `You tend to revisit ${mostCurious.subject} topics frequently — strong curiosity in this area.` });
    }

    // Conceptual vs memory: chat/story topics indicate conceptual strength
    const conceptualTopics = (memory.recentTopics || []).filter(t => t.source === 'chat' || t.source === 'story');
    const examTopics = (memory.recentTopics || []).filter(t => t.source === 'exam');
    if (conceptualTopics.length > examTopics.length * 2) {
        patterns.push({ type: 'strength', observation: 'You ask strong conceptual questions — understanding the "why" behind topics, not just facts.' });
    } else if (examTopics.length > conceptualTopics.length) {
        patterns.push({ type: 'habit', observation: 'You lean toward exam practice — balancing with conceptual exploration can deepen understanding.' });
    }

    // Weak subject pattern
    const weakSubjects = [...new Set((memory.weakTopics || []).map(w => w.subject))];
    if (weakSubjects.length > 0) {
        patterns.push({ type: 'opportunity', observation: `${weakSubjects.slice(0, 2).join(' and ')} ${weakSubjects.length > 1 ? 'have' : 'has'} the most room for growth — focused revision here will have visible results.` });
    }

    // Mode variety habit
    const last10Modes = (memory.recentModes || []).slice(0, 10).map(m => m.mode);
    const uniqueModes = new Set(last10Modes).size;
    if (last10Modes.length >= 5 && uniqueModes >= 3) {
        patterns.push({ type: 'habit', observation: 'You use multiple learning modes — combining chat, story, and exam practice creates stronger memory pathways.' });
    }

    return patterns.slice(0, 4);
}

// ── Part 6: Cross-Mode Intelligence ──────────────────────────────────────────

export function generateCrossModeContext(memory: StudentMemory): string {
    const parts: string[] = [];

    // Topics explored via story mode
    const storyTopics = (memory.recentTopics || [])
        .filter(t => t.source === 'story').slice(0, 3).map(t => t.topic);
    if (storyTopics.length > 0) {
        parts.push(`Stories explored: ${storyTopics.join(', ')}`);
    }

    // Recent exam weak areas
    const examWeak = (memory.recentExamPerformance || [])
        .filter(p => p.total > 0 && p.score / p.total < 0.6).slice(0, 2);
    if (examWeak.length > 0) {
        const weakList = examWeak.map(p => `${p.chapter} (${p.score}/${p.total})`).join(', ');
        parts.push(`Recent exam struggles: ${weakList}`);
    }

    // Topics from game mode
    const gameTopics = (memory.recentTopics || [])
        .filter(t => t.source === 'game').slice(0, 2).map(t => t.topic);
    if (gameTopics.length > 0) {
        parts.push(`Game practice: ${gameTopics.join(', ')}`);
    }

    // Suggest underused modes
    const last7Modes = (memory.recentModes || []).slice(0, 7).map(m => m.mode);
    const unused: string[] = [];
    if (!last7Modes.includes('story')) unused.push('story mode for hard concepts');
    if (!last7Modes.includes('game'))  unused.push('game mode for practice');
    if (!last7Modes.includes('exam'))  unused.push('mock test to measure progress');
    if (unused.length > 0) parts.push(`Suggest trying: ${unused.slice(0, 2).join(', ')}`);

    return parts.length > 0 ? `CROSS-MODE CONTEXT:\n${parts.join('\n')}` : '';
}

// ── Part 9: AI-Powered Insight Cards ─────────────────────────────────────────

export interface InsightCard {
    icon: string;
    label: string;
    value: string;
    color: string;         // CSS color for accent
    mode?: 'chat' | 'story' | 'exam' | 'game';
    actionTopic?: string;
}

export function generateInsightCards(memory: StudentMemory): InsightCard[] {
    const cards: InsightCard[] = [];

    // 🔥 Current Streak
    const streak = memory.streak?.current || 0;
    cards.push({
        icon: streak >= 3 ? '🔥' : '🌱',
        label: 'Current Streak',
        value: streak > 0 ? `${streak} Day${streak > 1 ? 's' : ''}` : 'Start Today',
        color: '#f59e0b',
    });

    // 📚 Strong Topic (subject with best avg exam score)
    const scoresBySubject: Record<string, number[]> = {};
    for (const p of (memory.recentExamPerformance || [])) {
        if (!scoresBySubject[p.subject]) scoresBySubject[p.subject] = [];
        scoresBySubject[p.subject].push(p.total > 0 ? p.score / p.total : 0);
    }
    let strongSubject = '';
    let bestAvg = 0;
    for (const [subj, scores] of Object.entries(scoresBySubject)) {
        const avg = scores.reduce((s, n) => s + n, 0) / scores.length;
        if (avg > bestAvg) { bestAvg = avg; strongSubject = subj; }
    }
    if (!strongSubject && memory.recentTopics?.length > 0) {
        // Fall back to most-studied subject
        const subjectCounts: Record<string, number> = {};
        for (const t of memory.recentTopics) subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
        strongSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    }
    if (strongSubject) {
        cards.push({ icon: '📚', label: 'Strong Area', value: strongSubject, color: '#22c55e' });
    }

    // ⚡ Needs Revision (top weak topic)
    const topWeak = (memory.weakTopics || []).sort((a, b) => b.weaknessScore - a.weaknessScore)[0];
    if (topWeak) {
        cards.push({
            icon: '⚡', label: 'Needs Revision', value: topWeak.topic,
            color: '#ef4444', mode: 'exam', actionTopic: topWeak.topic,
        });
    }

    // 🎯 Recommended Today (first daily task topic)
    const dailyTasks = generateDailyLearningGoals(memory);
    const firstTask = dailyTasks[0];
    if (firstTask) {
        cards.push({
            icon: '🎯', label: 'Recommended Today',
            value: firstTask.topic || firstTask.text.slice(0, 30),
            color: '#6366f1', mode: firstTask.mode, actionTopic: firstTask.topic,
        });
    }

    return cards.slice(0, 4);
}

// ── Part 8: Learning Journey Builder ─────────────────────────────────────────

export interface JourneyEntry {
    type: 'topic' | 'exam' | 'milestone';
    icon: string;
    text: string;
    timestamp: number;
}

export interface JourneyDay {
    dateLabel: string;
    dateKey: string;
    entries: JourneyEntry[];
}

export function buildLearningJourney(memory: StudentMemory): JourneyDay[] {
    const dayMap: Record<string, JourneyEntry[]> = {};

    const modeIcons: Record<string, string> = { chat: '💬', story: '✨', exam: '📝', game: '🎮' };

    // Topics
    for (const t of (memory.recentTopics || []).slice(0, 30)) {
        const key = new Date(t.timestamp).toISOString().split('T')[0];
        if (!dayMap[key]) dayMap[key] = [];
        dayMap[key].push({
            type: 'topic',
            icon: modeIcons[t.source] || '📖',
            text: t.source === 'story'
                ? `Completed ${t.topic} Story`
                : t.source === 'game'
                ? `Practiced ${t.topic} via Game`
                : `Explored ${t.topic} (${t.subject})`,
            timestamp: t.timestamp,
        });
    }

    // Exam performance
    for (const p of (memory.recentExamPerformance || []).slice(0, 10)) {
        const key = new Date(p.timestamp).toISOString().split('T')[0];
        if (!dayMap[key]) dayMap[key] = [];
        const pct = p.total > 0 ? Math.round((p.score / p.total) * 100) : 0;
        dayMap[key].push({
            type: 'exam',
            icon: pct >= 70 ? '🏆' : pct >= 50 ? '📊' : '📉',
            text: `Scored ${p.score}/${p.total} in ${p.chapter}`,
            timestamp: p.timestamp,
        });
    }

    // Milestones (streak achievements)
    const streak = memory.streak?.current || 0;
    if (streak >= 5) {
        const today = new Date().toISOString().split('T')[0];
        if (!dayMap[today]) dayMap[today] = [];
        dayMap[today].push({
            type: 'milestone',
            icon: '⭐',
            text: `${streak}-day learning streak achieved`,
            timestamp: Date.now(),
        });
    }

    // Sort days desc, cap at 5 days
    const sorted = Object.entries(dayMap)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 5);

    return sorted.map(([key, entries]) => {
        const d = new Date(key);
        const dateLabel = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
        return {
            dateKey: key,
            dateLabel,
            entries: entries
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 4),
        };
    });
}

// ── Part 8: Progress Insights ─────────────────────────────────────────────────

export interface ProgressInsight {
    subject: string;
    trend: 'improving' | 'needs-revision' | 'stable';
    note: string;
}

export function generateProgressInsights(memory: StudentMemory): ProgressInsight[] {
    const insights: ProgressInsight[] = [];
    const seen = new Set<string>();

    // Check exam score trends per subject
    const scoresBySubject: Record<string, { score: number; total: number; timestamp: number }[]> = {};
    for (const p of (memory.recentExamPerformance || [])) {
        if (!scoresBySubject[p.subject]) scoresBySubject[p.subject] = [];
        scoresBySubject[p.subject].push({ score: p.score, total: p.total, timestamp: p.timestamp });
    }

    for (const [subject, scores] of Object.entries(scoresBySubject)) {
        if (seen.has(subject) || scores.length < 2) continue;
        const sorted = scores.sort((a, b) => b.timestamp - a.timestamp);
        const latest = sorted[0].score / sorted[0].total;
        const prev   = sorted[1].score / sorted[1].total;
        seen.add(subject);

        if (latest > prev && latest >= 0.6) {
            insights.push({ subject, trend: 'improving', note: `${subject} improving steadily` });
        } else if (latest < 0.5) {
            insights.push({ subject, trend: 'needs-revision', note: `${subject} revision needed` });
        } else {
            insights.push({ subject, trend: 'stable', note: `${subject} at steady level` });
        }
    }

    // Weak topics → needs-revision subjects
    for (const wt of (memory.weakTopics || []).slice(0, 2)) {
        if (seen.has(wt.subject)) continue;
        seen.add(wt.subject);
        insights.push({ subject: wt.subject, trend: 'needs-revision', note: `${wt.topic} revision needed` });
    }

    return insights.slice(0, 4);
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
