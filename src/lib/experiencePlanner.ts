/**
 * Experience Planner — src/lib/experiencePlanner.ts
 *
 * The brain of FeelEd AI.
 *
 * Input:  LearningExperienceObject + StudentProfile
 * Output: ExperiencePlan
 *
 * Responsibilities:
 * 1. Map LEO educational content → 5-act ExperienceAct sequence
 * 2. Select real-world connections appropriate for this student's context
 * 3. Schedule interactions at the right moments (per Learning Grammar)
 * 4. Set timing, silence, freeze frames per Document 4 rules
 * 5. Select memory model appropriate for this student
 * 6. Apply adaptation rules for struggling vs. advanced learners
 *
 * This planner knows nothing about SVG, React, camera, or audio files.
 * It produces an ExperiencePlan that the Cinema Engine renders.
 */

import {
    LearningExperienceObject,
    StudentProfile,
    ExperiencePlan,
    ExperienceAct,
    PlannedInteraction,
    ActPacing,
    TimingPlan,
    MemoryPlan,
    SubtitlePlan,
    AudioPlan,
    MusicTransition,
    CompletionCriteria,
    RealWorldConnection,
    CandidateMemoryModel,
    LearnerStrength,
    SessionLength,
    InteractionLevel,
} from '../types';

// ── Timing constants (seconds) ────────────────────────────────────────────────
// These encode Document 4 mandatory minimums.
const TIMING = {
    silence_pre_prediction:    3,   // Rule A2, I2
    silence_post_reveal:       4,   // Rule A2
    silence_pre_memory_anchor: 3,   // Rule M3
    memory_anchor_hold:        6,   // Rule M2
    silence_post_anchor:       3,   // Rule M3
    freeze_frame_min:          3,   // Rule T3
    pre_option_pause:          2,   // Rule T2
    post_concept_darkness:     2,   // Rule TR2
} as const;

// ── Session duration targets (seconds) ────────────────────────────────────────
const SESSION_TARGETS: Record<SessionLength, number> = {
    short:    480,   // 8 minutes
    standard: 900,   // 15 minutes
    extended: 1500,  // 25 minutes
};

// ── Act duration distribution (% of total session) ───────────────────────────
// Weighted toward exploration and discovery (core learning acts)
const ACT_WEIGHTS = [0.12, 0.25, 0.28, 0.20, 0.15]; // acts 1-5

// ── Interaction level by learner strength ────────────────────────────────────
// Struggling learners: more predict (level 2), fewer explain (level 3)
// Advanced learners: more explain and experiment
function selectInteractionLevel(
    strength: LearnerStrength,
    actType: string,
    hasOptions: boolean
): InteractionLevel {
    if (actType === 'arrival_curiosity') return 1;   // Always reflect — never predict in Act 1
    if (actType === 'mastery') return 1;             // Reflect in Act 5

    const levelMap: Record<LearnerStrength, InteractionLevel> = {
        struggling:  2,  // Predict — concrete, guided
        developing:  2,  // Predict — builds confidence
        confident:   hasOptions ? 2 : 3,  // Predict or explain
        advanced:    3,  // Explain — open-ended
    };
    return levelMap[strength];
}

// ── Select real-world connections for this student ───────────────────────────
function selectConnections(
    connections: RealWorldConnection[],
    profile: StudentProfile,
    count: number
): RealWorldConnection[] {
    // Priority: match student's urban/rural context, then by difficulty (concrete first)
    const contextMatch = connections.filter(c =>
        c.urban_rural === profile.preferred_connection_context || c.urban_rural === 'both'
    );
    const others = connections.filter(c =>
        c.urban_rural !== profile.preferred_connection_context && c.urban_rural !== 'both'
    );

    // Sort by difficulty: concrete > semi-abstract > abstract for struggling learners
    const difficultyOrder: Record<string, number> = {
        concrete: profile.strength === 'struggling' ? 0 : 1,
        'semi-abstract': 1,
        abstract: profile.strength === 'advanced' ? 0 : 2,
    };
    const sorted = [...contextMatch, ...others]
        .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

    return sorted.slice(0, count);
}

// ── Select memory model for this student ─────────────────────────────────────
function selectMemoryModel(
    models: CandidateMemoryModel[],
    profile: StudentProfile
): CandidateMemoryModel {
    // Always prefer scientifically accurate models
    const accurate = models.filter(m => m.scientifically_accurate);
    if (accurate.length === 0) return models[0];

    // For rural students: prefer models with nature/physical-world imagery
    // For urban students: prefer models with technology/city imagery
    // For struggling: prefer most concrete ("why_memorable" mentions familiar objects)
    // Simple heuristic: first accurate model is already the primary candidate
    return accurate[0];
}

// ── Build a PlannedInteraction ────────────────────────────────────────────────
function buildInteraction(
    leo: LearningExperienceObject,
    actNumber: number,
    actType: string,
    profile: StudentProfile
): PlannedInteraction | null {
    const level = selectInteractionLevel(
        profile.strength,
        actType,
        leo.prediction_opportunities.length > 0
    );

    // Act 1: Level 1 (Reflect) — curiosity question, no options
    if (actType === 'arrival_curiosity') {
        return {
            level: 1,
            moment: 'post_observation',
            purpose: 'Activate prior knowledge and create learning tension before any explanation',
            question: `Take a moment. ${leo.curiosity_hook.learning_tension}`,
            feedback_if_correct: '',  // Level 1 has no correct/wrong
            feedback_if_wrong: '',
            silence_before_seconds: TIMING.silence_pre_prediction,
            silence_after_seconds: 4,
        };
    }

    // Act 2: Level 2 (Predict) — use prediction_opportunities from LEO
    if (actType === 'exploration' && leo.prediction_opportunities.length > 0) {
        const pred = leo.prediction_opportunities[0];
        const misconception = leo.common_misconceptions.find(m =>
            pred.why_wrong_options_feel_right.toLowerCase().includes(m.statement.substring(0, 20).toLowerCase())
        );
        return {
            level: level,
            moment: 'pre_reveal',
            purpose: `Test understanding before concept reveal. Target misconception: ${misconception?.statement ?? 'general'}`,
            question: pred.question,
            options: pred.options,
            correct_index: pred.correct_index,
            misconception_targeted: misconception?.statement ?? undefined,
            feedback_if_correct: `Your instinct was right. Here is exactly why — ${leo.concept_reveal.what_becomes_visible}`,
            feedback_if_wrong: `It feels that way. But watch what actually happens — ${leo.concept_reveal.the_moment}`,
            silence_before_seconds: TIMING.silence_pre_prediction,
            silence_after_seconds: 2,
        };
    }

    // Act 4: Level 1 (Reflect) — connect to real world
    if (actType === 'integration') {
        return {
            level: 1,
            moment: 'mid_act',
            purpose: 'Connect concept to student\'s own daily life experience',
            question: leo.reflection[1] ?? leo.reflection[0],
            feedback_if_correct: '',
            feedback_if_wrong: '',
            silence_before_seconds: 2,
            silence_after_seconds: 3,
        };
    }

    // Act 5: Level 1 (Reflect) — final reflection
    if (actType === 'mastery') {
        return {
            level: 1,
            moment: 'post_act',
            purpose: 'Confirm understanding and prepare for memory anchor',
            question: leo.reflection[0],
            feedback_if_correct: '',
            feedback_if_wrong: '',
            silence_before_seconds: 2,
            silence_after_seconds: TIMING.silence_post_reveal,
        };
    }

    // Act 3 (Discovery): Level 0 — pure observation, no interaction
    return null;
}

// ── Build ActPacing ───────────────────────────────────────────────────────────
function buildPacing(
    actNumber: number,
    actType: string,
    totalSeconds: number,
    observationCount: number
): ActPacing {
    const duration = Math.round(totalSeconds * ACT_WEIGHTS[actNumber - 1]);

    const silenceMoments = [];
    const freezeFrames = [];

    if (actType === 'exploration') {
        // Freeze each observation step briefly
        for (let i = 0; i < Math.min(observationCount, 3); i++) {
            freezeFrames.push({
                observation_index: i,
                duration_seconds: TIMING.freeze_frame_min,
                focus_point: `Observation step ${i + 1} — allow student to look carefully`,
            });
        }
        silenceMoments.push({
            trigger: 'pre_prediction' as const,
            duration_seconds: TIMING.silence_pre_prediction,
        });
    }

    if (actType === 'discovery') {
        silenceMoments.push({
            trigger: 'post_reveal' as const,
            duration_seconds: TIMING.silence_post_reveal,
        });
    }

    if (actType === 'mastery') {
        silenceMoments.push({
            trigger: 'reflection' as const,
            duration_seconds: 3,
        });
    }

    return {
        estimated_duration_seconds: duration,
        silence_moments: silenceMoments,
        freeze_frames: freezeFrames,
        replay_moments: actType === 'integration'
            ? ['concept_reveal_moment']  // Replay the reveal after integration begins
            : [],
    };
}

// ── Build AudioPlan ───────────────────────────────────────────────────────────
function buildAudioPlan(leo: LearningExperienceObject, profile: StudentProfile): AudioPlan {
    const isTamil = profile.language === 'Tamil';

    // Collect first-appearance scientific terms from misconceptions + essential idea
    const emphasisTerms = [
        ...leo.common_misconceptions.map(m => m.statement.split(' ').slice(0, 3).join(' ')),
        leo.essential_idea.split(' ').slice(0, 4).join(' '),
    ].slice(0, 5);

    const musicTransitions: MusicTransition[] = [
        {
            trigger: 'Lesson begins — curiosity hook shown',
            music_state: 'begins_softly',
            educational_purpose: 'Signal entry into learning space — Rule A3',
        },
        {
            trigger: 'Approaching concept reveal in Act 3',
            music_state: 'swells',
            educational_purpose: 'Mark approaching cognitive transition — Rule A3',
        },
        {
            trigger: 'Prediction moment begins',
            music_state: 'stops',
            educational_purpose: 'Learner thinking requires silence — Rule A3, Document 4',
        },
        {
            trigger: 'Concept reveal moment arrives',
            music_state: 'single_note',
            educational_purpose: 'Mark the moment of discovery — Rule A3',
        },
        {
            trigger: 'Integration phase begins (Act 4)',
            music_state: 'returns_gently',
            educational_purpose: 'Signal transition to meaning-making — Rule A3',
        },
        {
            trigger: 'Memory anchor appears',
            music_state: 'fades',
            educational_purpose: 'Memory anchor requires silence — Rule M3',
        },
    ];

    return {
        voice_language: profile.language,
        narrator_voice: isTamil ? 'Zephyr' : 'Kore',
        protagonist_voice: isTamil ? 'Fenrir' : 'Charon',
        music_transitions: musicTransitions,
        ambient_sound_scenes: ['arrival_curiosity', 'integration'],  // Concrete acts get ambient sound
        emphasis_terms: emphasisTerms,
    };
}

// ── Build SubtitlePlan ────────────────────────────────────────────────────────
function buildSubtitlePlan(leo: LearningExperienceObject, profile: StudentProfile): SubtitlePlan {
    // Keywords: scientific terms from misconceptions and essential idea
    const keywords = [
        ...leo.common_misconceptions.flatMap(m => m.statement.split(/\s+/).filter(w => w.length > 6)),
        ...leo.essential_idea.split(/\s+/).filter(w => w.length > 5),
    ].slice(0, 8);

    return {
        language: profile.language,
        bilingual: profile.language === 'Tamil',  // Tamil students always get bilingual
        keywords_to_highlight: [...new Set(keywords)],
        suppress_during_prediction: true,         // Rule S5 — always
        progressive_reveal: true,                 // Rule S3 — always
    };
}

// ── Adaptation notes ──────────────────────────────────────────────────────────
function generateAdaptationNotes(
    leo: LearningExperienceObject,
    profile: StudentProfile
): string {
    const notes = [];

    if (profile.strength === 'struggling') {
        notes.push('Reduced interaction complexity — Level 2 predict used throughout for scaffolding');
        notes.push('Concrete real-world examples prioritized over semi-abstract');
        notes.push('Extended silence moments to allow processing time');
    }
    if (profile.strength === 'advanced') {
        notes.push('Level 3 explain interactions used where possible for deeper engagement');
        notes.push('Application questions emphasize transfer to novel situations');
    }
    if (profile.preferred_connection_context === 'rural') {
        notes.push('Rural Tamil Nadu examples selected (agriculture, village settings)');
    }
    if (profile.preferred_connection_context === 'urban') {
        notes.push('Urban Chennai examples selected (MTC bus, IT corridor, markets)');
    }
    if (profile.session_length === 'short') {
        notes.push('Timing compressed for 8-minute session — interaction count reduced to 2');
    }
    const heldMisconceptions = profile.misconceptions_held.filter(m =>
        leo.common_misconceptions.some(lm => lm.statement.includes(m.slice(0, 20)))
    );
    if (heldMisconceptions.length > 0) {
        notes.push(`Known misconceptions targeted: ${heldMisconceptions.join('; ')}`);
    }

    return notes.join('. ');
}

// ── MAIN: plan() function ─────────────────────────────────────────────────────
export function plan(
    leo: LearningExperienceObject,
    profile: StudentProfile
): ExperiencePlan {
    const totalSeconds = SESSION_TARGETS[profile.session_length];
    const lessonId = `${leo.topic.replace(/\s+/g, '-').toLowerCase()}-gr${leo.grade}-${Date.now()}`;

    // ── Map LEO content to 5 acts ────────────────────────────────────────────
    const actConfigs: Array<{
        actType: ExperienceAct['act_type'];
        learningGoal: string;
        targetEmotion: string;
        phenomenon: string;
        narrationPoints: string[];
        misconceptionToAddress: string | null;
    }> = [
        {
            actType: 'arrival_curiosity',
            learningGoal: 'Create genuine curiosity. Activate prior knowledge. Generate the central question.',
            targetEmotion: 'Curious',
            phenomenon: leo.curiosity_hook.phenomenon,
            narrationPoints: [
                'Show the surprising phenomenon without explanation',
                `Why this feels wrong: ${leo.curiosity_hook.why_surprising}`,
                `The question this creates: ${leo.central_question}`,
            ],
            misconceptionToAddress: null,  // Act 1 never corrects — only creates tension
        },
        {
            actType: 'exploration',
            learningGoal: 'Observe the phenomenon carefully. Build prediction readiness. Surface the misconception.',
            targetEmotion: 'Confused and Thinking',
            phenomenon: leo.observation_sequence.join(' → '),
            narrationPoints: [
                ...leo.observation_sequence.map((obs, i) => `Observation ${i+1}: ${obs}`),
                leo.common_misconceptions[0]?.statement
                    ? `Address: students typically believe "${leo.common_misconceptions[0].statement}"`
                    : '',
            ].filter(Boolean),
            misconceptionToAddress: leo.common_misconceptions[0]?.statement ?? null,
        },
        {
            actType: 'discovery',
            learningGoal: 'Reveal the scientific truth. Correct the central misconception. Connect observation to concept.',
            targetEmotion: 'Discovery',
            phenomenon: leo.concept_reveal.the_moment,
            narrationPoints: [
                `What becomes visible: ${leo.concept_reveal.what_becomes_visible}`,
                `The transformation: from "${leo.concept_reveal.learning_transformation.before_student_believes}" to "${leo.concept_reveal.learning_transformation.after_student_understands}"`,
                `Essential idea: ${leo.essential_idea}`,
            ],
            misconceptionToAddress: leo.common_misconceptions[1]?.statement ?? leo.common_misconceptions[0]?.statement ?? null,
        },
        {
            actType: 'integration',
            learningGoal: 'Connect the concept to daily life. Show why it matters. Broaden understanding.',
            targetEmotion: 'Meaningful',
            phenomenon: 'Real-world manifestations of the concept in Tamil Nadu student experience',
            narrationPoints: selectConnections(leo.real_world_connections, profile, 3)
                .map(c => `${c.example}: ${c.connection_to_concept}`),
            misconceptionToAddress: leo.common_misconceptions[2]?.statement ?? null,
        },
        {
            actType: 'mastery',
            learningGoal: 'Consolidate memory. Confirm understanding. Prepare for exam. Deliver memory anchor.',
            targetEmotion: 'Confident',
            phenomenon: `${leo.memory_anchor.image_description} — ${leo.memory_anchor.anchor_sentence}`,
            narrationPoints: [
                ...leo.application,
                `Exam preparation: ${leo.assessment_insight.marks_tip}`,
                `Memory anchor: ${leo.memory_anchor.anchor_sentence}`,
            ],
            misconceptionToAddress: null,
        },
    ];

    // ── Build ExperienceActs ─────────────────────────────────────────────────
    const acts: ExperienceAct[] = actConfigs.map((config, i) => {
        const actNumber = (i + 1) as 1 | 2 | 3 | 4 | 5;
        const connections = actNumber === 4
            ? selectConnections(leo.real_world_connections, profile, 3)
            : [];

        return {
            act_number: actNumber,
            act_type: config.actType,
            learning_goal: config.learningGoal,
            target_emotion: config.targetEmotion,
            phenomenon_to_show: config.phenomenon,
            narration_points: config.narrationPoints,
            key_misconception_to_address: config.misconceptionToAddress,
            interaction: buildInteraction(leo, actNumber, config.actType, profile),
            pacing: buildPacing(actNumber, config.actType, totalSeconds, leo.observation_sequence.length),
            connections_to_use: connections,
        };
    });

    // ── Build TimingPlan ─────────────────────────────────────────────────────
    const actDurations: Record<number, number> = {};
    let totalSilences = 0;
    let interactionCount = 0;

    acts.forEach(act => {
        actDurations[act.act_number] = act.pacing.estimated_duration_seconds;
        totalSilences += act.pacing.silence_moments.reduce((s, m) => s + m.duration_seconds, 0);
        if (act.interaction) interactionCount++;
    });

    // Add memory anchor timing
    totalSilences += TIMING.silence_pre_memory_anchor + TIMING.memory_anchor_hold + TIMING.silence_post_anchor;

    const timingPlan: TimingPlan = {
        total_duration_seconds: totalSeconds,
        act_durations: actDurations,
        mandatory_silences_total: totalSilences,
        interaction_count: interactionCount,
        estimated_cognitive_load:
            profile.strength === 'struggling' ? 'low' :
            profile.strength === 'advanced' ? 'high' : 'medium',
    };

    // ── Build MemoryPlan ─────────────────────────────────────────────────────
    const selectedModel = selectMemoryModel(leo.candidate_memory_models, profile);
    const memoryPlan: MemoryPlan = {
        selected_memory_model: selectedModel,
        anchor: leo.memory_anchor,
        timing: {
            appears_after_seconds: totalSeconds - 60,
            silence_before_image_seconds: 0,
            image_hold_seconds: TIMING.memory_anchor_hold,
            anchor_sentence_silence_before: TIMING.silence_pre_memory_anchor,
            anchor_sentence_silence_after: TIMING.silence_post_anchor,
        },
        recurrence_trigger: leo.assessment_insight.tn_board_pattern.split('.')[0] ?? null,
    };

    // ── Build completion criteria ────────────────────────────────────────────
    const completionCriteria: CompletionCriteria = {
        minimum_acts_completed: profile.session_length === 'short' ? 3 : 5,
        prediction_accuracy_required: false,  // Wrong answers are learning too
        reflection_answered: true,
        memory_anchor_shown: true,
        success_indicators: leo.learning_success_criteria,
    };

    return {
        lesson_id: lessonId,
        topic: leo.topic,
        grade: leo.grade,
        subject: leo.subject,
        language: leo.language,
        central_question: leo.central_question,
        learning_goal: leo.essential_idea,
        target_learner: profile,
        acts,
        timing_plan: timingPlan,
        memory_plan: memoryPlan,
        subtitle_plan: buildSubtitlePlan(leo, profile),
        audio_plan: buildAudioPlan(leo, profile),
        completion_criteria: completionCriteria,
        adaptation_notes: generateAdaptationNotes(leo, profile),
    };
}
