/**
 * PresentationModelBuilder — src/cinema/presentation/PresentationModelBuilder.ts
 *
 * FeelEd Runtime (FRT) — Assembles PresentationModel from RenderState.
 *
 * Input:  RenderState (immutable snapshot from CinemaEngine)
 * Output: PresentationModel (render instructions for CinemaViewport)
 *
 * This is the ONLY translation layer.
 * No cinema logic here — only mapping.
 * No React imports. No engine imports. Pure data transformation.
 */
import { RenderState } from '../state/RenderState';
import { LearningExperienceObject } from '../../types';
import { detectGrammar } from '../scenes/SceneFactory';
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
    ExamInsightPresentation,
    EMPTY_SUBTITLE,
    HIDDEN_INTERACTION,
    HIDDEN_MEMORY,
    makeLoadingPresentation,
} from './PresentationModel';

// ── Grammar → StageLayer sceneId mapping ─────────────────────────────────────
function grammarToSceneId(grammar: string): string {
    const map: Record<string, string> = {
        force:          'physics_force',
        wave:           'physics_wave',
        orbit:          'physics_gravity',
        flow:           'physics_electricity',
        growth:         'biology_cell',
        transformation: 'chemistry_molecule',
        network:        'biology_cell',
        comparison:     'physics_force',
        journey:        'physics_gravity',
        spiral:         'biology_cell',
        graph:          'mathematics_graph',
        particles:      'particles',
    };
    return map[grammar] ?? 'particles';
}

// ── Act labels and colours ────────────────────────────────────────────────────
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

function mapPhase(phase: string): PlaybackDisplayState {
    const map: Record<string, PlaybackDisplayState> = {
        idle: 'starting', starting: 'starting', narrating: 'playing',
        frozen: 'playing', pre_silence: 'silence', interacting: 'interaction',
        post_silence: 'silence', revealing: 'playing', memory_anchor: 'playing',
        complete: 'complete',
    };
    return map[phase] ?? 'playing';
}

function visualizerBars(renderTimestamp: number, isPlaying: boolean): number[] {
    if (!isPlaying) return [0.1, 0.1, 0.1, 0.1];
    const t = renderTimestamp * 0.001;
    return [0, 1, 2, 3].map(j => 0.2 + 0.8 * Math.abs(Math.sin(t * 2.6 + j * 0.9)));
}

// ── Main build function ───────────────────────────────────────────────────────
export function buildFromRenderState(
    rs: RenderState,
    animationTick: number,
    isFullscreen: boolean,
    leo: LearningExperienceObject | null,
    topic: string,
    grade: number,
): PresentationModel {
    if (!leo) return makeLoadingPresentation(topic, grade);

    const actType = rs.scene?.actPhase ?? 'arrival_curiosity';
    const accentColor = ACT_COLORS[actType] ?? '#a78bfa';

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene: ScenePresentation | null = rs.scene ? {
        sceneId:    grammarToSceneId(detectGrammar(rs.scene.sceneType + ' ' + (rs.scene.characters.map(c=>c.label).join(' ')))),
        background: '',
        accentColor,
        characters: rs.scene.characters.map((c, i) => ({
            emoji:       c.emoji,
            label:       c.label,
            position:    c.position,
            highlighted: c.highlighted,
            floatPhase:  i * 1.2,
        })),
        isFrozen:      rs.scene.isFrozen,
        isDark:        rs.scene.isDark,
        isReveal:      rs.scene.isReveal,
        animationTick: rs.scene.isFrozen ? 0 : animationTick,
    } : null;

    // ── Subtitle ──────────────────────────────────────────────────────────────
    const sub = rs.subtitle;
    const subtitle: SubtitlePresentation = sub.visible ? {
        visible:         true,
        text:            sub.text,
        speakerLabel:    sub.speaker === 'narrator' ? '🎙 Narrator'
                       : sub.speaker === 'student_voice' ? '🎓 Student'
                       : sub.speaker === 'concept_voice' ? '💡 Concept'
                       : sub.speaker === 'memory_anchor' ? ''
                       : `🧑 ${sub.speaker}`,
        speakerColor:    sub.isConceptReveal ? '#f0abfc'
                       : sub.speaker === 'narrator' ? '#c4b5fd'
                       : sub.speaker === 'student_voice' ? '#bfdbfe'
                       : '#fde68a',
        isConceptReveal: sub.isConceptReveal,
        highlightedWords:sub.highlightedWords,
        isBilingual:     sub.isBilingual,
        secondaryText:   sub.secondaryText,
        key:             `${sub.text.slice(0,12)}-${rs.timestamp}`,
    } : EMPTY_SUBTITLE;

    // ── Interaction ───────────────────────────────────────────────────────────
    const ia = rs.interaction;
    const interaction: InteractionPresentation = ia.active ? {
        mode: ia.answered ? 'feedback' : ia.level === 1 ? 'reflect' : 'predict',
        question: ia.question,
        options: ia.options.map((text, i): OptionPresentation => ({
            text, index: i,
            state: !ia.answered ? (ia.selectedIndex === i ? 'selected' : 'default')
                : i === ia.selectedIndex ? (ia.isCorrect ? 'correct' : 'wrong') : 'default',
        })),
        feedback:      ia.feedback,
        feedbackColor: ia.isCorrect ? '#86efac' : '#a78bfa',
    } : HIDDEN_INTERACTION;

    // ── Memory ────────────────────────────────────────────────────────────────
    const memory: MemoryPresentation = {
        visible:          rs.memory.visible,
        imageDescription: rs.memory.imageDescription || leo.memory_anchor.image_description,
        sentence:         rs.memory.sentence,
        sentenceVisible:  rs.memory.sentenceVisible,
    };

    // ── Audio ─────────────────────────────────────────────────────────────────
    const audio: AudioPresentation = {
        isMuted:        rs.audio.isMuted,
        volume:         rs.audio.volume,
        isPlaying:      rs.audio.isPlaying,
        isSilence:      rs.audio.isSilencePhase,
        visualizerBars: visualizerBars(rs.timestamp, rs.audio.isPlaying && !rs.audio.isMuted),
    };

    // ── Progress ──────────────────────────────────────────────────────────────
    const progress: ProgressPresentation = {
        actIndex:        rs.progress.actIndex,
        actTotal:        rs.progress.actTotal,
        actLabel:        ACT_LABELS[actType] ?? '',
        accentColor,
        progressPercent: Math.round(((rs.progress.actIndex + 1) / rs.progress.actTotal) * 100),
        actsCompleted:   rs.progress.actsCompleted,
        playbackState:   mapPhase(rs.phase),
        lessonComplete:  rs.phase === 'complete',
    };

    // ── Controls ──────────────────────────────────────────────────────────────
    const controls: ControlsPresentation = {
        canPlay:        rs.phase !== 'narrating' && rs.phase !== 'interacting',
        canPause:       rs.phase === 'narrating',
        showScrollHint: rs.phase === 'complete',
        isFullscreen,
    };

    // ── Exam insight ──────────────────────────────────────────────────────────
    const examInsight: ExamInsightPresentation = {
        tnBoardPattern: leo.assessment_insight.tn_board_pattern,
        marksTip:       leo.assessment_insight.marks_tip,
    };

    return {
        lessonTitle:           leo.central_question,
        centralQuestion:       leo.central_question,
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
