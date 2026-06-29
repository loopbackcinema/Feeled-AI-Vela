/**
 * SceneFactory — src/cinema/scenes/SceneFactory.ts
 *
 * FeelEd Runtime (FRT) — Scene registration and lookup.
 *
 * CONCEPT GRAMMAR (not subject-based):
 * Scenes are classified by the type of visual narrative they represent,
 * not by subject. This enables reuse across subjects.
 *
 * One concept can map to multiple grammar types:
 *   Photosynthesis → FlowScene + GrowthScene + TransformationScene
 *   Newton's Laws  → ForceScene + ComparisonScene
 *   DNA            → SpiralScene + JourneyScene
 *
 * Adding a new concept = add one scene file + register here.
 * CinemaViewport never changes.
 * PresentationModel never references React components.
 *
 * PresentationModel carries:  sceneType: "force" (a string)
 * SceneFactory maps:          "force" → ForceScene component
 * CinemaViewport renders:     SceneFactory.create(sceneType, props)
 */
import React from 'react';

export type ConceptGrammarType =
    | 'force'           // Objects, pushes, pulls, motion — F=ma, Newton, pressure
    | 'wave'            // Oscillation, propagation — light, sound, EM radiation
    | 'orbit'           // Circular paths, attraction — gravity, electrons, planets
    | 'flow'            // Movement through systems — blood, electricity, photosynthesis
    | 'growth'          // Progressive development — cell division, population, compound interest
    | 'transformation'  // State change — chemical reactions, phase transitions, metamorphosis
    | 'network'         // Connected nodes — DNA, neural, circuit
    | 'comparison'      // Side-by-side contrast — acid/base, mitosis/meiosis, isotopes
    | 'journey'         // Linear narrative — historical discovery, evolutionary timeline
    | 'spiral'          // Helical, recursive — DNA helix, golden ratio
    | 'particles'       // Default — generic concept space
    | 'graph';          // Mathematical functions, data visualization

export interface SceneRenderProps {
    tick:      number;      // Animation clock from requestAnimationFrame
    color:     string;      // Accent colour for current act
    isFrozen:  boolean;     // Freeze frame — Document 4 Rule T3
    isReveal:  boolean;     // Concept reveal moment — Document 4 Rule C5
}

// ── Scene metadata ────────────────────────────────────────────────────────────
export interface SceneMeta {
    grammar:      ConceptGrammarType;
    label:        string;
    keywords:     string[];             // Trigger words that map to this scene
    subjects:     string[];             // Which subjects typically use this
    description:  string;              // What this scene visualizes
}

export const SCENE_REGISTRY: Record<ConceptGrammarType, SceneMeta> = {
    force: {
        grammar: 'force', label: 'Force & Motion',
        keywords: ['force','inertia','newton','push','pull','momentum','f=ma','acceleration','friction','விசை'],
        subjects: ['Physics'],
        description: 'Objects, force arrows, mass blocks, motion vectors',
    },
    wave: {
        grammar: 'wave', label: 'Waves & Oscillation',
        keywords: ['wave','light','sound','frequency','wavelength','optic','electromagnetic','அலை','வெளிச்ச'],
        subjects: ['Physics'],
        description: 'Animated sine waves, wavelength markers, propagation',
    },
    orbit: {
        grammar: 'orbit', label: 'Orbits & Attraction',
        keywords: ['gravity','orbit','planet','satellite','electron','atomic','circular','கிரகம்','நட்சத்திர'],
        subjects: ['Physics', 'Chemistry'],
        description: 'Central body with orbiting particles, elliptical paths',
    },
    flow: {
        grammar: 'flow', label: 'Flow Systems',
        keywords: ['blood','circulation','current','photosynthesis','transport','artery','vein','electricity','ரத்த','மின்'],
        subjects: ['Biology', 'Physics'],
        description: 'Particles flowing through a system, directed movement',
    },
    growth: {
        grammar: 'growth', label: 'Growth & Development',
        keywords: ['cell division','mitosis','meiosis','growth','development','population','compound','பிரிவு'],
        subjects: ['Biology', 'Mathematics'],
        description: 'Progressive multiplication and development over time',
    },
    transformation: {
        grammar: 'transformation', label: 'Transformation',
        keywords: ['reaction','chemical','acid','base','phase','change','catalyst','neutralize','வினை'],
        subjects: ['Chemistry'],
        description: 'Before/after state change with visible transformation',
    },
    network: {
        grammar: 'network', label: 'Networks & Connections',
        keywords: ['dna','nucleotide','gene','protein','circuit','nervous','ecosystem','network','உயிரணு'],
        subjects: ['Biology', 'Physics'],
        description: 'Connected nodes and edges showing relationships',
    },
    comparison: {
        grammar: 'comparison', label: 'Comparison',
        keywords: ['compare','difference','versus','contrast','mitosis vs meiosis','acid vs base','isotope'],
        subjects: ['Biology', 'Chemistry', 'Physics'],
        description: 'Side-by-side visual comparison of two concepts',
    },
    journey: {
        grammar: 'journey', label: 'Discovery Journey',
        keywords: ['history','discovery','timeline','evolution','darwin','newton','einstein','raman','found'],
        subjects: ['Biology', 'Physics', 'Chemistry', 'History'],
        description: 'Historical narrative with character and setting',
    },
    spiral: {
        grammar: 'spiral', label: 'Helical & Recursive',
        keywords: ['dna','helix','double helix','fibonacci','golden ratio','spiral','chromosome'],
        subjects: ['Biology', 'Mathematics'],
        description: 'Helical or spiral structure rotating and revealing',
    },
    graph: {
        grammar: 'graph', label: 'Mathematical Graph',
        keywords: ['equation','graph','parabola','quadratic','function','calculus','curve','plot','சமன்பாடு'],
        subjects: ['Mathematics'],
        description: 'Mathematical curves with animated point tracing',
    },
    particles: {
        grammar: 'particles', label: 'Concept Space',
        keywords: [],   // Default — matches everything not caught above
        subjects: ['*'],
        description: 'Generic concept particle system for unrecognized topics',
    },
};

// ── Concept detection ─────────────────────────────────────────────────────────
export function detectGrammar(text: string): ConceptGrammarType {
    const t = text.toLowerCase();
    // Priority order: more specific grammars before general ones
    for (const [grammar, meta] of Object.entries(SCENE_REGISTRY) as [ConceptGrammarType, SceneMeta][]) {
        if (grammar === 'particles') continue; // Default — check last
        if (meta.keywords.some(kw => t.includes(kw))) return grammar;
    }
    return 'particles';
}

// ── Scene type in PresentationModel is a string, not a component ──────────────
// CinemaViewport calls:  SceneFactory.getComponent(sceneType)
// This is the ONLY place where string maps to React component.
// Everything above this line is renderer-agnostic.

export type SceneComponent = React.FC<SceneRenderProps>;
type SceneComponentLoader = () => Promise<{ default: SceneComponent }>;

// Lazy loading — only load scene modules that are actually needed
const SCENE_LOADERS: Partial<Record<ConceptGrammarType, SceneComponentLoader>> = {
    force:          () => import('./ForceScene'),
    wave:           () => import('./WaveScene'),
    orbit:          () => import('./OrbitScene'),
    flow:           () => import('./FlowScene'),
    growth:         () => import('./GrowthScene'),
    transformation: () => import('./TransformationScene'),
    network:        () => import('./NetworkScene'),
    comparison:     () => import('./ComparisonScene'),
    journey:        () => import('./JourneyScene'),
    spiral:         () => import('./SpiralScene'),
    graph:          () => import('./GraphScene'),
    particles:      () => import('./ParticlesScene'),
};

const componentCache = new Map<ConceptGrammarType, SceneComponent>();

export async function loadScene(grammar: ConceptGrammarType): Promise<SceneComponent> {
    if (componentCache.has(grammar)) return componentCache.get(grammar)!;
    const loader = SCENE_LOADERS[grammar] ?? SCENE_LOADERS['particles']!;
    const mod = await loader();
    componentCache.set(grammar, mod.default);
    return mod.default;
}

// Preload scenes that are likely to be needed (called on app init)
export function preloadScenes(grammars: ConceptGrammarType[]): void {
    grammars.forEach(g => loadScene(g).catch(() => {}));
}
