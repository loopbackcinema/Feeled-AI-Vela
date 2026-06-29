/**
 * PresentationModelBuilder — assembles PresentationModel from CinemaEngine state.
 *
 * This is the only place where engine state is translated into render instructions.
 * React never touches engine state directly.
 *
 * Input:  Raw engine outputs (SceneState, SubtitleState, InteractionUIState, etc.)
 * Output: PresentationModel — everything React needs, nothing more.
 */
import { SceneState } from '../renderers/StageRenderer';
import { SubtitleState } from '../renderers/SubtitleRenderer';
import { InteractionUIState } from '../renderers/InteractionRenderer';
import { PlaybackState } from '../state/CinemaState';
import { LearningExperienceObject } from '../../types';
import {
    PresentationModel,
    ScenePresentation,
    SubtitlePresentation,
    InteractionPresentation,
    OptionPresentation,
    MemoryPresentation,
    AudioPresentation,
    ProgressPresentation,
    ControlsPresentation,
    PlaybackDisplayState,
    EMPTY_SUBTITLE,
    HIDDEN_INTERACTION,
    HIDDEN_MEMORY,
    ExamInsightPresentation,
    makeLoadingPresentation,
} from './PresentationModel';

// ── Act metadata ──────────────────────────────────────────────────────────────
const ACT_LABELS: Record<string, string> = {
    arrival_curiosity: 'Curiosity',
    exploration:       'Exploration',
    discovery:         'Discovery',
    integration:       'Integration',
    mastery:           'Mastery',
};
const ACT_COLORS: Record<string, string> = {
    arrival_curiosity: '#f59e0b',
    exploration:       '#60a5fa',
    discovery:         '#f43f5e',
    integration:       '#34d399',
    mastery:           '#a78bfa',
};
const STAGE_BG: Record<string, string> = {
    arrival_curiosity: 'radial-gradient(ellipse at 38% 40%,#1c0540,#04000e)',
    exploration:       'radial-gradient(ellipse at 62% 30%,#000d30,#04000e)',
    discovery:         'radial-gradient(ellipse at 50% 35%,#250008,#04000e)',
    integration:       'radial-gradient(ellipse at 45% 40%,#001e0a,#04000e)',
    mastery:           'radial-gradient(ellipse at 50% 35%,#0e0028,#04000e)',
};

// ── Speaker label and colour ──────────────────────────────────────────────────
function speakerLabel(speaker: string, protagonistEmoji: string, protagonistName: string): string {
    if (speaker === 'narrator')       return '🎙 Narrator';
    if (speaker === 'student_voice')  return '🎓 Student';
    if (speaker === 'concept_voice')  return '💡 Concept';
    if (speaker === 'memory_anchor')  return '';
    return `${protagonistEmoji} ${protagonistName}`;
}
function speakerColor(speaker: string, isReveal: boolean): string {
    if (isReveal)                     return '#f0abfc';
    if (speaker === 'narrator')       return '#c4b5fd';
    if (speaker === 'student_voice')  return '#bfdbfe';
    if (speaker === 'concept_voice')  return '#f0abfc';
    return '#fde68a'; // protagonist
}

// ── Playback state mapping ────────────────────────────────────────────────────
function mapPlayback(state: PlaybackState): PlaybackDisplayState {
    const map: Record<PlaybackState, PlaybackDisplayState> = {
        idle:        'starting',
        loading:     'loading',
        playing:     'playing',
        paused:      'paused',
        interaction: 'interaction',
        silence:     'silence',
        complete:    'complete',
    };
    return map[state] ?? 'playing';
}

// ── Audio visualizer bars (animated by tick) ──────────────────────────────────
function visualizerBars(tick: number, isPlaying: boolean): number[] {
    if (!isPlaying) return [0.1, 0.1, 0.1, 0.1];
    return [0, 1, 2, 3].map(j => 0.2 + 0.8 * Math.abs(Math.sin(tick * 0.13 + j * 0.9)));
}

// ── Main builder function ─────────────────────────────────────────────────────
export interface BuilderInput {
    // Engine outputs
    scene:           SceneState | null;
    subtitle:        SubtitleState;
    interaction:     InteractionUIState;
    playback:        PlaybackState;
    currentActIndex: number;
    actsCompleted:   number[];
    elapsedSeconds:  number;
    animationTick:   number;
    lessonComplete:  boolean;

    // Memory anchor
    memoryVisible:   boolean;
    memorySentence:  string | null;
    memoryImageDesc: string;

    // Audio
    isMuted:  boolean;
    volume:   number;
    isPlaying: boolean;

    // Fullscreen
    isFullscreen: boolean;

    // LEO content (for post-lesson + protagonist info)
    leo: LearningExperienceObject | null;

    // Lesson identity
    topic:    string;
    grade:    number;
    subject:  string;
    language: string;
}

export function buildPresentationModel(input: BuilderInput): PresentationModel {
    if (!input.leo) return makeLoadingPresentation(input.topic, input.grade);

    const leo = input.leo;
    const actType = input.scene?.actType ?? 'arrival_curiosity';
    const accentColor = ACT_COLORS[actType] ?? '#a78bfa';
    const tick = input.animationTick;

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene: ScenePresentation | null = input.scene ? {
        sceneId:    input.scene.sceneType,
        background: STAGE_BG[actType] ?? STAGE_BG['exploration'],
        accentColor,
        characters: input.scene.characters.map((c, i) => ({
            emoji:       c.emoji,
            label:       c.label,
            position:    c.position,
            highlighted: c.highlighted,
            floatPhase:  i * 1.2,
        })),
        isFrozen:   input.scene.isFrozen,
        isDark:     input.scene.isDark,
        isReveal:   input.scene.isReveal,
        animationTick: tick,
    } : null;

    // ── Subtitle ─────────────────────────────────────────────────────────────
    const sub = input.subtitle;
    const subtitle: SubtitlePresentation = sub.visible ? {
        visible:          true,
        text:             sub.text,
        speakerLabel:     speakerLabel('narrator', '🧑', leo.topic), // simplified for now
        speakerColor:     speakerColor('narrator', sub.isConceptReveal),
        isConceptReveal:  sub.isConceptReveal,
        highlightedWords: sub.highlightedWords,
        isBilingual:      sub.isBilingual,
        secondaryText:    sub.secondaryText,
        key:              sub.text.slice(0, 20) + tick,
    } : EMPTY_SUBTITLE;

    // ── Interaction ───────────────────────────────────────────────────────────
    const ia = input.interaction;
    let interaction: InteractionPresentation = HIDDEN_INTERACTION;

    if (ia.active) {
        const mode = ia.answered ? 'feedback'
            : ia.level === 1 ? 'reflect'
            : 'predict';

        const options: OptionPresentation[] = ia.options.map((text, i) => ({
            text,
            index: i,
            state: !ia.answered ? (ia.selectedIndex === i ? 'selected' : 'default')
                : i === ia.selectedIndex
                    ? (ia.isCorrect ? 'correct' : 'wrong')
                    : 'default',
        }));

        interaction = {
            mode,
            question:      ia.question,
            options,
            feedback:      ia.feedback,
            feedbackColor: ia.isCorrect ? '#86efac' : '#a78bfa',
        };
    }

    // ── Memory ───────────────────────────────────────────────────────────────
    const memory: MemoryPresentation = {
        visible:          input.memoryVisible,
        imageDescription: input.memoryImageDesc || leo.memory_anchor.image_description,
        sentence:         input.memorySentence ?? '',
        sentenceVisible:  !!input.memorySentence,
    };

    // ── Audio ─────────────────────────────────────────────────────────────────
    const audio: AudioPresentation = {
        isMuted:        input.isMuted,
        volume:         input.volume,
        isPlaying:      input.isPlaying,
        isSilence:      input.playback === 'silence',
        visualizerBars: visualizerBars(tick, input.isPlaying),
    };

    // ── Progress ─────────────────────────────────────────────────────────────
    const progress: ProgressPresentation = {
        actIndex:        input.currentActIndex,
        actTotal:        5,
        actLabel:        ACT_LABELS[actType] ?? '',
        accentColor,
        progressPercent: Math.round(((input.currentActIndex + 1) / 5) * 100),
        actsCompleted:   input.actsCompleted,
        playbackState:   mapPlayback(input.playback),
        lessonComplete:  input.lessonComplete,
    };

    // ── Controls ─────────────────────────────────────────────────────────────
    const controls: ControlsPresentation = {
        canPlay:        input.playback !== 'playing' && input.playback !== 'interaction',
        canPause:       input.playback === 'playing',
        showScrollHint: input.lessonComplete,
        isFullscreen:   input.isFullscreen,
    };

    // ── Exam insight ──────────────────────────────────────────────────────────
    const examInsight: ExamInsightPresentation = {
        tnBoardPattern: leo.assessment_insight.tn_board_pattern,
        marksTip:       leo.assessment_insight.marks_tip,
    };

    return {
        lessonTitle:     leo.central_question,
        centralQuestion: leo.central_question,
        scene,
        subtitle,
        interaction,
        memory,
        audio,
        progress,
        controls,
        reflectionQuestions:   leo.reflection,
        applicationQuestions:  leo.application,
        examInsight,
        memoryAnchorReminder:  leo.memory_anchor.anchor_sentence,
    };
}
