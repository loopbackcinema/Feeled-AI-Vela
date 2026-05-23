import type { StudentMemory } from './memoryService';

const TOPIC_RELATIONS: Record<string, string[]> = {
    'electricity':        ['magnetism', 'circuits', "ohm's law", 'electric current'],
    'photosynthesis':     ['respiration', 'food chain', 'chlorophyll', 'plant nutrition'],
    'algebra':            ['equations', 'polynomials', 'graphs', 'linear equations'],
    'trigonometry':       ['pythagoras theorem', 'coordinate geometry', 'circles', 'heights and distances'],
    'acids':              ['bases', 'salts', 'ph scale', 'chemical reactions'],
    'motion':             ["newton's laws", 'force', 'momentum', 'velocity'],
    'cell':               ['cell division', 'tissues', 'organ systems', 'mitosis'],
    'light':              ['refraction', 'reflection', 'lenses', 'optics'],
    'human body':         ['digestive system', 'circulatory system', 'nervous system', 'excretion'],
    'periodic table':     ['atomic structure', 'chemical bonding', 'elements', 'valency'],
    'geography':          ['maps', 'climate', 'natural resources', 'population'],
    'history':            ['independence movement', 'ancient india', 'mughal empire', 'colonial rule'],
    'democracy':          ['constitution', 'parliament', 'fundamental rights', 'government'],
    'heredity':           ['genetics', 'dna', 'evolution', 'mendel'],
    'thermodynamics':     ['heat', 'temperature', 'entropy', 'specific heat'],
    'waves':              ['sound', 'frequency', 'amplitude', 'resonance'],
    'carbon compounds':   ['hydrocarbons', 'organic chemistry', 'functional groups', 'isomerism'],
    'statistics':         ['probability', 'mean median mode', 'data representation', 'graphs'],
};

export function generateNextTopicSuggestions(memory: StudentMemory): string[] {
    if (!memory.recentTopics.length) return [];
    const suggestions = new Set<string>();
    for (const { topic } of memory.recentTopics.slice(0, 5)) {
        const key = Object.keys(TOPIC_RELATIONS).find(k => topic.toLowerCase().includes(k));
        if (key) {
            TOPIC_RELATIONS[key].slice(0, 2).forEach(s => suggestions.add(s));
        }
    }
    // Filter out topics already studied
    const studied = new Set(memory.recentTopics.map(t => t.topic.toLowerCase()));
    return Array.from(suggestions).filter(s => !studied.has(s)).slice(0, 3);
}

export function generateWeaknessRecommendations(memory: StudentMemory): string[] {
    if (!memory.weakTopics.length) return [];
    return memory.weakTopics
        .sort((a, b) => b.weaknessScore - a.weaknessScore)
        .slice(0, 3)
        .map(w => w.topic);
}

export function generateStudyInsights(memory: StudentMemory): string[] {
    const insights: string[] = [];

    if (memory.streak.current >= 7) {
        insights.push(`🔥 ${memory.streak.current}-day streak — you're building real momentum`);
    } else if (memory.streak.current >= 3) {
        insights.push(`📅 ${memory.streak.current} days in a row — keep it going!`);
    }

    if (memory.recentTopics.length >= 10) {
        const subjects = [...new Set(memory.recentTopics.slice(0, 10).map(t => t.subject))];
        if (subjects.length >= 3) {
            insights.push(`📚 Exploring ${subjects.slice(0, 3).join(', ')} — well-rounded study`);
        }
    }

    if (memory.weakTopics.length > 0) {
        const top = memory.weakTopics.sort((a, b) => b.weaknessScore - a.weaknessScore)[0];
        insights.push(`💡 Focus area: ${top.topic} — revisiting this will boost your score`);
    }

    if (memory.recentExamPerformance.length >= 3) {
        const recent = memory.recentExamPerformance.slice(0, 3);
        const avg = recent.reduce((s, p) => s + p.score / p.total, 0) / recent.length;
        if (avg >= 0.8) insights.push('🎯 Scoring 80%+ in recent mocks — exam ready!');
        else if (avg >= 0.6) insights.push('📈 Scores improving — a few more practice rounds and you\'ll ace it');
    }

    if (memory.learningGoal) {
        insights.push(`🎓 Goal: ${memory.learningGoal} — stay consistent`);
    }

    return insights.slice(0, 3);
}

export function generateExamReadiness(memory: StudentMemory): number {
    let score = 0;

    // Streak contributes up to 20 pts
    score += Math.min(memory.streak.current * 2, 20);

    // Topics studied contributes up to 20 pts
    score += Math.min(memory.recentTopics.length * 2, 20);

    // Exam performance contributes up to 40 pts
    if (memory.recentExamPerformance.length > 0) {
        const recent = memory.recentExamPerformance.slice(0, 5);
        const avg = recent.reduce((s, p) => s + p.score / p.total, 0) / recent.length;
        score += Math.round(avg * 40);
    }

    // Weak topics penalty (up to -10 pts)
    score -= Math.min(memory.weakTopics.length * 2, 10);

    // Bonus for variety of modes used
    const uniqueModes = new Set(memory.recentModes.slice(0, 10).map(m => m.mode)).size;
    score += uniqueModes * 3;

    return Math.max(0, Math.min(100, score));
}

export function generateCrossModeSuggestions(memory: StudentMemory): { mode: string; action: string; topic: string }[] {
    const suggestions: { mode: string; action: string; topic: string }[] = [];
    const recentModeSet = new Set(memory.recentModes.slice(0, 5).map(m => m.mode));

    // If weak topics exist, suggest exam mode
    if (memory.weakTopics.length > 0) {
        const weak = memory.weakTopics.sort((a, b) => b.weaknessScore - a.weaknessScore)[0];
        suggestions.push({ mode: 'exam', action: 'Practice weak topic', topic: weak.topic });
    }

    // If they haven't used story mode recently, suggest it
    if (!recentModeSet.has('story') && memory.recentTopics.length > 0) {
        const latest = memory.recentTopics[0];
        suggestions.push({ mode: 'story', action: 'Turn into a story', topic: latest.topic });
    }

    // Suggest next topic in chat
    const next = generateNextTopicSuggestions(memory);
    if (next.length > 0) {
        suggestions.push({ mode: 'chat', action: 'Explore next concept', topic: next[0] });
    }

    // If no exam recently, suggest one
    if (!recentModeSet.has('exam') && memory.recentTopics.length > 0) {
        const latest = memory.recentTopics[0];
        suggestions.push({ mode: 'exam', action: 'Test your knowledge', topic: latest.topic });
    }

    return suggestions.slice(0, 3);
}

export function generateGoalAwareContext(memory: StudentMemory): string {
    if (!memory.learningGoal) return '';
    const goalMap: Record<string, string> = {
        '10th Board': 'focusing on TN Samacheer Class 10 board exam preparation',
        '12th Board': 'preparing for TN Samacheer Class 12 board exams',
        'NEET':       'targeting NEET — Biology, Chemistry, and Physics are key',
        'JEE':        'targeting JEE — Maths, Physics, and Chemistry are key',
    };
    return goalMap[memory.learningGoal] || '';
}
