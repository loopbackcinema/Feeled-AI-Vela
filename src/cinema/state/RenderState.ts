/**
 * RenderState — src/cinema/state/RenderState.ts
 *
 * Immutable snapshot of the Cinema Engine's current runtime state.
 * Produced by CinemaEngine after every meaningful change.
 * Consumed by PresentationModelBuilder to produce PresentationModel.
 *
 * This is NOT the same as CinemaStateManager (which is mutable runtime state).
 * RenderState is a frozen snapshot — safe to pass across boundaries.
 *
 * Pipeline:
 *   CinemaEngine (mutable) → RenderState (immutable) → PresentationModel (UI)
 *
 * No React. No SVG. No camera. No audio files.
 * Pure data describing "what is happening right now."
 */

export type PlaybackPhase =
    | 'idle'
    | 'starting'
    | 'narrating'       // Audio + subtitle playing
    | 'frozen'          // Freeze frame — observation moment
    | 'pre_silence'     // Mandatory pause before interaction
    | 'interacting'     // Waiting for student response
    | 'post_silence'    // Mandatory pause after interaction
    | 'revealing'       // Concept reveal moment
    | 'memory_anchor'   // Memory anchor sequence
    | 'complete';

export type ActPhase =
    | 'arrival_curiosity'
    | 'exploration'
    | 'discovery'
    | 'integration'
    | 'mastery';

export interface RenderStateSceneData {
    sceneType: string;          // e.g. "force", "wave", "cell" — not a React component
    actPhase: ActPhase;
    accentColor: string;
    characters: RenderStateCharacter[];
    isFrozen: boolean;
    isDark: boolean;            // Pre-reveal darkness
    isReveal: boolean;          // Concept reveal moment
}

export interface RenderStateCharacter {
    emoji: string;
    label: string;
    position: 'left' | 'center' | 'right';
    highlighted: boolean;
    floatPhase: number;         // Per-character animation offset
}

export interface RenderStateSubtitle {
    visible: boolean;
    text: string;
    speaker: string;
    isConceptReveal: boolean;
    highlightedWords: string[];
    isBilingual: boolean;
    secondaryText: string;
}

export interface RenderStateInteraction {
    active: boolean;
    level: 0 | 1 | 2 | 3 | 4;
    question: string;
    options: string[];
    selectedIndex: number | null;
    answered: boolean;
    isCorrect: boolean | null;
    feedback: string;
}

export interface RenderStateMemory {
    visible: boolean;
    imageDescription: string;
    sentenceVisible: boolean;
    sentence: string;
}

export interface RenderStateAudio {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;             // 0–1
    isSilencePhase: boolean;    // Currently in a mandatory silence moment
}

export interface RenderStateProgress {
    actIndex: number;           // 0-based
    actTotal: number;
    actsCompleted: number[];
    elapsedSeconds: number;
}

/**
 * RenderState — the complete immutable snapshot.
 * CinemaEngine produces this. PresentationModelBuilder consumes it.
 */
export interface RenderState {
    readonly phase: PlaybackPhase;
    readonly scene: RenderStateSceneData | null;
    readonly subtitle: RenderStateSubtitle;
    readonly interaction: RenderStateInteraction;
    readonly memory: RenderStateMemory;
    readonly audio: RenderStateAudio;
    readonly progress: RenderStateProgress;
    readonly timestamp: number;     // When this snapshot was taken
}

// ── Default / empty RenderState ───────────────────────────────────────────────
export const EMPTY_RENDER_STATE: RenderState = {
    phase: 'idle',
    scene: null,
    subtitle: {
        visible: false, text: '', speaker: '',
        isConceptReveal: false, highlightedWords: [],
        isBilingual: false, secondaryText: '',
    },
    interaction: {
        active: false, level: 0, question: '', options: [],
        selectedIndex: null, answered: false, isCorrect: null, feedback: '',
    },
    memory: {
        visible: false, imageDescription: '',
        sentenceVisible: false, sentence: '',
    },
    audio: {
        isPlaying: false, isMuted: false, volume: 0.9, isSilencePhase: false,
    },
    progress: {
        actIndex: 0, actTotal: 5, actsCompleted: [], elapsedSeconds: 0,
    },
    timestamp: 0,
};

// ── RenderStateEmitter — produced by CinemaEngine ────────────────────────────
export type RenderStateListener = (state: RenderState) => void;

export class RenderStateEmitter {
    private listeners: RenderStateListener[] = [];
    private current: RenderState = EMPTY_RENDER_STATE;

    emit(next: Partial<RenderState>): void {
        // Merge with current, freeze the result
        this.current = Object.freeze({
            ...this.current,
            ...next,
            timestamp: Date.now(),
        });
        this.listeners.forEach(fn => fn(this.current));
    }

    subscribe(fn: RenderStateListener): () => void {
        this.listeners.push(fn);
        return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    }

    getCurrent(): RenderState {
        return this.current;
    }
}
