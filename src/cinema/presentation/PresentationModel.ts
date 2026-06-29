/**
 * PresentationModel — src/cinema/presentation/PresentationModel.ts
 *
 * The single object that React receives. Nothing else.
 * React is 100% dumb — it renders this model and nothing more.
 *
 * Rule: "React never decides. React only renders PresentationModel."
 *
 * Every field in this model is a direct render instruction.
 * No booleans that require interpretation.
 * No raw engine state.
 * No act indices.
 * No timing numbers.
 *
 * The Cinema Engine + useCinemaEngine hook produce this.
 * CinemaViewport consumes this.
 * React never sees anything else.
 */

// ── Scene ─────────────────────────────────────────────────────────────────────
export interface ScenePresentation {
    sceneId: string;                // e.g. "physics_force", "biology_cell"
    background: string;             // CSS gradient — pre-computed
    accentColor: string;            // Current act accent
    characters: CharacterPresentation[];
    isFrozen: boolean;              // Freeze frame — animation pauses
    isDark: boolean;                // Pre-reveal darkness (Rule TR2)
    isReveal: boolean;              // Concept reveal moment — special visual
    animationTick: number;          // Increments at 50ms — drives SVG animations
}

export interface CharacterPresentation {
    emoji: string;
    label: string;
    position: 'left' | 'center' | 'right';
    highlighted: boolean;
    floatPhase: number;             // Per-character float animation phase offset
}

// ── Subtitle ──────────────────────────────────────────────────────────────────
export interface SubtitlePresentation {
    visible: boolean;
    text: string;
    speakerLabel: string;           // Pre-formatted: "🎙 Narrator", "🧑 Newton", etc.
    speakerColor: string;           // Pre-computed colour for this speaker
    isConceptReveal: boolean;       // Triggers special reveal styling
    highlightedWords: string[];     // Words to visually emphasise
    isBilingual: boolean;
    secondaryText: string;
    key: string;                    // Changes on each new line → triggers React animation
}

export const EMPTY_SUBTITLE: SubtitlePresentation = {
    visible: false,
    text: '',
    speakerLabel: '',
    speakerColor: '#c4b5fd',
    isConceptReveal: false,
    highlightedWords: [],
    isBilingual: false,
    secondaryText: '',
    key: '0',
};

// ── Interaction ───────────────────────────────────────────────────────────────
export type InteractionDisplayMode = 'hidden' | 'reflect' | 'predict' | 'feedback';

export interface InteractionPresentation {
    mode: InteractionDisplayMode;
    question: string;
    options: OptionPresentation[];
    feedback: string;
    feedbackColor: string;          // Pre-computed: green for correct, red for wrong
}

export interface OptionPresentation {
    text: string;
    state: 'default' | 'selected' | 'correct' | 'wrong';
    index: number;
}

export const HIDDEN_INTERACTION: InteractionPresentation = {
    mode: 'hidden',
    question: '',
    options: [],
    feedback: '',
    feedbackColor: '#a78bfa',
};

// ── Memory Anchor ─────────────────────────────────────────────────────────────
export interface MemoryPresentation {
    visible: boolean;
    imageDescription: string;       // Shown as evocative text before V2 has actual images
    sentence: string;               // The anchor sentence — appears after silence
    sentenceVisible: boolean;       // Separate from visible — timed delay
}

export const HIDDEN_MEMORY: MemoryPresentation = {
    visible: false,
    imageDescription: '',
    sentence: '',
    sentenceVisible: false,
};

// ── Audio ─────────────────────────────────────────────────────────────────────
export interface AudioPresentation {
    isMuted: boolean;
    volume: number;                 // 0–1
    isPlaying: boolean;
    isSilence: boolean;             // Mandatory silence moment in progress
    visualizerBars: number[];       // 4 bar heights for audio visualiser (0–1)
}

// ── Progress ──────────────────────────────────────────────────────────────────
export interface ProgressPresentation {
    actIndex: number;               // 0-based
    actTotal: number;               // Always 5
    actLabel: string;               // "Curiosity", "Exploration", etc.
    accentColor: string;
    progressPercent: number;        // 0–100
    actsCompleted: number[];        // Act numbers that are done
    playbackState: PlaybackDisplayState;
    lessonComplete: boolean;
}

export type PlaybackDisplayState =
    | 'loading'     // LEO generating
    | 'starting'    // Engine warming up
    | 'playing'     // Normal playback
    | 'paused'      // User paused
    | 'silence'     // Mandatory silence
    | 'interaction' // Waiting for student response
    | 'complete';   // Lesson done

// ── Controls ─────────────────────────────────────────────────────────────────
export interface ControlsPresentation {
    canPlay: boolean;
    canPause: boolean;
    showScrollHint: boolean;        // Hint to scroll down for reflection/exam tips
    isFullscreen: boolean;
}

// ── The Complete PresentationModel ────────────────────────────────────────────
export interface PresentationModel {
    // Core identity
    lessonTitle: string;
    centralQuestion: string;

    // All layers — React renders exactly these, nothing more
    scene: ScenePresentation | null;
    subtitle: SubtitlePresentation;
    interaction: InteractionPresentation;
    memory: MemoryPresentation;
    audio: AudioPresentation;
    progress: ProgressPresentation;
    controls: ControlsPresentation;

    // Post-lesson content (rendered below viewport)
    reflectionQuestions: string[];
    applicationQuestions: string[];
    examInsight: ExamInsightPresentation | null;
    memoryAnchorReminder: string;   // anchor_sentence shown again at bottom
}

export interface ExamInsightPresentation {
    tnBoardPattern: string;
    marksTip: string;
}

// ── Default (loading state) ───────────────────────────────────────────────────
export function makeLoadingPresentation(topic: string, grade: number): PresentationModel {
    return {
        lessonTitle: topic,
        centralQuestion: '',
        scene: null,
        subtitle: EMPTY_SUBTITLE,
        interaction: HIDDEN_INTERACTION,
        memory: HIDDEN_MEMORY,
        audio: { isMuted: false, volume: 0.9, isPlaying: false, isSilence: false, visualizerBars: [0.2,0.4,0.3,0.5] },
        progress: {
            actIndex: 0, actTotal: 5, actLabel: 'Loading',
            accentColor: '#a78bfa', progressPercent: 0,
            actsCompleted: [], playbackState: 'loading', lessonComplete: false,
        },
        controls: { canPlay: false, canPause: false, showScrollHint: false, isFullscreen: false },
        reflectionQuestions: [],
        applicationQuestions: [],
        examInsight: null,
        memoryAnchorReminder: '',
    };
}
