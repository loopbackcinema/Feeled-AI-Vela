/**
 * SceneFactory — src/cinema/scenes/SceneFactory.ts
 *
 * Maps sceneId → scene renderer module.
 * Each scene is a self-contained SVG animation that:
 *   - Receives (tick: number, color: string, isFrozen: boolean, isReveal: boolean)
 *   - Returns SVG element content (as JSX in scene components)
 *   - Knows nothing about audio, subtitles, interactions, or timing
 *
 * Scalable: adding a new concept = adding one scene file + one entry here.
 * CinemaViewport never knows which scene is active.
 *
 * Scene registry:
 */

export type SceneId =
    | 'physics_force'
    | 'physics_wave'
    | 'physics_gravity'
    | 'physics_thermodynamics'
    | 'biology_cell'
    | 'biology_dna'
    | 'biology_circulation'
    | 'chemistry_bonds'
    | 'electricity_circuit'
    | 'mathematics_graph'
    | 'default_particles';

export interface SceneRenderProps {
    tick:      number;    // Animation clock — 50ms increments
    color:     string;    // Accent color from current act
    isFrozen:  boolean;   // Freeze frame — animation pauses at current tick
    isReveal:  boolean;   // Concept reveal — special visual treatment
}

// ── Scene detection ────────────────────────────────────────────────────────────
// Converts sceneId string from StageRenderer to typed SceneId
export function toSceneId(raw: string): SceneId {
    const valid: SceneId[] = [
        'physics_force', 'physics_wave', 'physics_gravity', 'physics_thermodynamics',
        'biology_cell', 'biology_dna', 'biology_circulation',
        'chemistry_bonds', 'electricity_circuit', 'mathematics_graph',
        'default_particles',
    ];
    // Map legacy names from StageRenderer
    const aliases: Record<string, SceneId> = {
        'thermodynamics': 'physics_thermodynamics',
        'electricity':    'electricity_circuit',
    };
    if (valid.includes(raw as SceneId)) return raw as SceneId;
    if (aliases[raw]) return aliases[raw];
    return 'default_particles';
}

// ── Scene metadata (used by CinemaViewport for aria labels, debug) ─────────────
export const SCENE_META: Record<SceneId, { label: string; subjects: string[] }> = {
    physics_force:        { label: 'Force & Motion',        subjects: ['Physics'] },
    physics_wave:         { label: 'Waves & Light',         subjects: ['Physics'] },
    physics_gravity:      { label: 'Gravity & Orbits',      subjects: ['Physics'] },
    physics_thermodynamics:{ label: 'Heat & Energy',        subjects: ['Physics', 'Chemistry'] },
    biology_cell:         { label: 'Cell Biology',          subjects: ['Biology'] },
    biology_dna:          { label: 'DNA & Genetics',        subjects: ['Biology'] },
    biology_circulation:  { label: 'Heart & Circulation',   subjects: ['Biology'] },
    chemistry_bonds:      { label: 'Molecular Bonds',       subjects: ['Chemistry'] },
    electricity_circuit:  { label: 'Electric Circuits',     subjects: ['Physics'] },
    mathematics_graph:    { label: 'Mathematical Functions', subjects: ['Mathematics'] },
    default_particles:    { label: 'Concept Space',         subjects: ['*'] },
};
