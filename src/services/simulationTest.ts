// DEV-only simulation helpers — never import this in production components.
import { getStudentMemory } from './memoryService';
import { buildCompactContext } from './contextSelector';

export async function runUserSimulation(uid: string): Promise<void> {
    if (!import.meta.env.DEV) return;

    console.group('[FeelEd Simulation]');

    const memory = await getStudentMemory(uid);
    if (!memory) {
        console.warn('No memory found for uid:', uid);
        console.groupEnd();
        return;
    }

    // Test 1: Context size for different subjects
    const physicsCtx = buildCompactContext(memory, 'what is inertia');
    const bioCtx     = buildCompactContext(memory, 'explain photosynthesis');
    const mathCtx    = buildCompactContext(memory, 'solve algebra');

    console.log('Physics context chars:', physicsCtx.length);
    console.log('Biology context chars:', bioCtx.length);
    console.log('Math context chars:',    mathCtx.length);
    console.log('Max:', Math.max(physicsCtx.length, bioCtx.length, mathCtx.length));

    // Test 2: Duplicate ratio in recentTopics
    console.log('Recent topics:', memory.recentTopics.length);
    const uniqueTopics = new Set(memory.recentTopics.map(t => t.topic.toLowerCase()));
    console.log('Unique topics:', uniqueTopics.size);
    const dupRatio = memory.recentTopics.length > 0
        ? 1 - (uniqueTopics.size / memory.recentTopics.length)
        : 0;
    console.log('Duplication ratio:', (dupRatio * 100).toFixed(1) + '%');

    // Test 3: Write health
    console.log('Write count:', (memory as any).writeCount ?? 'not tracked yet');
    console.log('Streak:', memory.streak.current, 'days');
    console.log('Weak topics:', memory.weakTopics.length);

    // Test 4: Mode spam (same mode within 5 min)
    const modes    = memory.recentModes;
    const modeSpam = modes.filter((m, i) =>
        i > 0 &&
        m.mode === modes[i - 1].mode &&
        m.timestamp - modes[i - 1].timestamp < 5 * 60 * 1000
    ).length;
    console.log('Mode spam entries:', modeSpam, '(should be 0 after Fix 4)');

    console.groupEnd();
}
