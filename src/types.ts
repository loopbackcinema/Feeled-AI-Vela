
export interface QuizQuestion {
    question: string;
    options: string[];
    answer: string;
}

export interface Story {
    title: string;
    emotion_tone: string;
    introduction: string;
    emotional_trigger: string;
    concept_explanation: string;
    resolution: string;
    moral_message: string;
    conclusion: string;
    quiz: QuizQuestion[];
}

export interface StoryRequest {
    topic: string;
    std: string;
    language: string;
    narratorVoice: string;
    emotionTone: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type Page = 'home' | 'chat' | 'generator' | 'story' | 'about' | 'founder' | 'research' | 'contact' | 'privacy' | 'pilot' | 'game' | 'exam-mock' | 'teachers' | 'parents' | 'my-stories' | 'student-dashboard' | 'admin-dashboard' | 'answer' | 'practice' | 'exam';

export interface RagCitation {
    subject:    string;
    chapter:    string;
    chapterNum: number;
    page:       number;
    chunkType:  string;
    score:      number;
}

export interface TextbookImage {
    url: string;
    grade: number;
    subject: string;
    medium: string;
    page: number;
    width: number;
    height: number;
}

export interface StudyChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    ragUsed?: boolean;
    timestamp: number;
    suggestions?: string[];
    ragCitations?: RagCitation[];
    textbookImages?: TextbookImage[];
    incomplete?: boolean;   // assistant reply ended abnormally (empty / stream error / no completion signal)
}

export interface StudentContext {
    board: string;
    standard: string;
    subject: string;
    language: string;
    learningMode: 'Junior' | 'Senior';
    goal: 'Exam' | 'Deep Learning';
}

export interface ConceptResponse {
    textbookAnswer: string;
    examFormat: string[];
    simpleExplanation: string;
    keyKeywords: string[];
    markBasedAnswers?: {
        twoMark: string;
        fiveMark: string;
    };
}

export interface PracticeQuestion {
    type: 'mcq' | 'short' | 'long';
    question: string;
    options?: string[];
    correctAnswer: string;
}

export interface ExamPrep {
    importantQuestions: string[];
    revisionNotes: string[];
    predictedQuestions: string[];
}

export interface UserSettings {
    isHighContrast: boolean;
    isDyslexicFont: boolean;
    uiLanguage: 'English' | 'Tamil';
}

// ── FeelEd Cinema (Grade 10–12 Story Mode) ──────────────────────────────────
export type CinemaActType = "hook" | "rising_action" | "climax" | "resolution" | "exam_bridge";
export type StageElementType = "character" | "object" | "formula" | "diagram" | "label" | "effect";
export type StagePosition = "left" | "center" | "right" | "top" | "bottom";
export type StageAnimation = "enter" | "float" | "pulse" | "fall" | "rise" | "spin" | "glow";
export type ScreenplaySpeaker = "narrator" | "protagonist" | "student_voice" | "concept_voice";
export type ScreenplayEmotion = "curious" | "excited" | "dramatic" | "calm" | "triumphant";

export interface CinemaProtagonist {
    name: string;
    era: string;
    role: string;
    tamil_connection: string;
    avatar_emoji: string;
}

export interface StageElement {
    element_type: StageElementType;
    name: string;
    description: string;
    position: StagePosition;
    animation: StageAnimation;
    highlight: boolean;
}

export interface ScreenplayLine {
    speaker: ScreenplaySpeaker;
    text: string;
    emotion: ScreenplayEmotion;
    is_concept_reveal: boolean;
}

export interface ConceptBoard {
    title: string;
    formula: string;
    key_points: string[];
    tamil_analogy: string;
}

export interface CinemaSetting {
    place: string;
    tamil_parallel: string;
    time_of_day: string;
    mood: string;
}

export interface CinemaAct {
    act_number: number;
    act_title: string;
    act_type: CinemaActType;
    setting: CinemaSetting;
    stage_elements: StageElement[];
    screenplay: ScreenplayLine[];
    concept_board: ConceptBoard;
    curtain_question: string;
}

export interface IntervalCard {
    recap: string;
    teaser: string;
}

export interface ExamSpotlight {
    most_asked_question: string;
    model_answer_structure: string[];
    marks_tip: string;
    previous_year_hint: string;
}

export interface CinemaQuizItem {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    concept_connection: string;
}

export interface CinemaStory {
    cinema_title: string;
    subject: string;
    grade: string;
    protagonist: CinemaProtagonist;
    acts: CinemaAct[];
    interval_card: IntervalCard;
    exam_spotlight: ExamSpotlight;
    quiz: CinemaQuizItem[];
}


// ─── Learning Experience Object v2 (refined schema) ─────────────────────────
// Separation of concerns: NO cinematic/camera language in this layer.
// Cinema Engine (Document 4) decides all visual/audio presentation.

export type MisconceptionSeverity   = 'minor' | 'dangerous' | 'complex';
export type CorrectionStrategy      = 'prediction' | 'reflection' | 'demonstration' | 'comparison' | 'experiment';
export type ConceptRevealEmotion    = 'satisfying' | 'surprising' | 'relieving' | 'awe-inspiring';
export type ConnectionDifficulty    = 'concrete' | 'semi-abstract' | 'abstract';
export type ConnectionContext       = 'urban' | 'rural' | 'both';
export type EmotionStage            = 'Curious' | 'Confused' | 'Thinking' | 'Discovery' | 'Confidence';
export type EmotionDuration         = 'brief' | 'moderate' | 'extended';

export interface Misconception {
    statement: string;
    why_believable: string;
    severity: MisconceptionSeverity;
    correction_strategy: CorrectionStrategy;
}

export interface PredictionOpportunity {
    moment: string;
    question: string;
    options: string[];
    correct_index: number;
    why_wrong_options_feel_right: string;
}

export interface LearningTransformation {
    before_student_believes: string;
    after_student_understands: string;
}

export interface ConceptReveal {
    the_moment: string;             // Felt experience — no camera language
    what_becomes_visible: string;
    learning_transformation: LearningTransformation;
    emotional_quality: ConceptRevealEmotion;
}

export interface EmotionalArcStage {
    stage: EmotionStage;
    trigger: string;                // What creates this emotion
    duration: EmotionDuration;
}

export interface CandidateMemoryModel {
    name: string;
    description: string;
    why_memorable: string;
    scientifically_accurate: boolean;
    accuracy_note: string;
}

export interface RealWorldConnection {
    example: string;
    connection_to_concept: string;
    difficulty: ConnectionDifficulty;
    urban_rural: ConnectionContext;
    age_relevance: string;
}

export interface MemoryAnchor {
    image_description: string;     // No camera language — plain scene description
    anchor_sentence: string;
    cognitive_hook: string;
}

export interface LearningSuccessCriteria {
    student_can_explain: string[];
    student_can_predict: string[];
    student_can_identify: string[];
    student_can_apply: string[];
}

export interface AssessmentInsight {
    understanding_vs_memorization: string;
    tn_board_pattern: string;
    marks_tip: string;
}

export interface CuriosityHook {
    phenomenon: string;            // Zero explanation words
    why_surprising: string;
    learning_tension: string;      // Replaces opening_image (cinema concern)
}

export interface LearningExperienceObject {
    topic: string;
    grade: number;
    subject: string;
    language: string;
    central_question: string;
    essential_idea: string;
    curiosity_hook: CuriosityHook;
    common_misconceptions: Misconception[];
    observation_sequence: string[];
    prediction_opportunities: PredictionOpportunity[];
    concept_reveal: ConceptReveal;
    emotional_arc: EmotionalArcStage[];
    candidate_memory_models: CandidateMemoryModel[];
    real_world_connections: RealWorldConnection[];
    reflection: string[];
    application: string[];
    memory_anchor: MemoryAnchor;
    learning_success_criteria: LearningSuccessCriteria;
    assessment_insight: AssessmentInsight;
}

// ─── Experience Planner Types ─────────────────────────────────────────────────
// The Experience Planner takes a LEO + student context → ExperiencePlan
// The Cinema Engine consumes ExperiencePlan. It knows nothing about LEOs.
// No SVG, no React, no camera — only learning orchestration.

export type ActType = 'arrival_curiosity' | 'exploration' | 'discovery' | 'integration' | 'mastery';
export type InteractionLevel = 0 | 1 | 2 | 3 | 4;
export type LearnerStrength = 'struggling' | 'developing' | 'confident' | 'advanced';
export type SessionLength = 'short' | 'standard' | 'extended'; // 8min | 15min | 25min

// ── Student Profile (what the planner knows about the learner) ────────────────
export interface StudentProfile {
    grade: number;
    language: 'Tamil' | 'English' | 'Tanglish';
    strength: LearnerStrength;
    topics_completed: string[];         // previous lesson ids
    misconceptions_held: string[];      // known misconceptions not yet corrected
    preferred_connection_context: 'urban' | 'rural' | 'both';
    session_length: SessionLength;
}

// ── Experience Act (one of five acts in the plan) ────────────────────────────
export interface ExperienceAct {
    act_number: 1 | 2 | 3 | 4 | 5;
    act_type: ActType;
    learning_goal: string;              // What the learner should achieve in this act
    target_emotion: string;             // The emotional state the planner aims for
    phenomenon_to_show: string;         // What the Cinema Engine should show (not how)
    narration_points: string[];         // What should be communicated (not the script)
    key_misconception_to_address: string | null;  // If any — one per act
    interaction: PlannedInteraction | null;
    pacing: ActPacing;
    connections_to_use: RealWorldConnection[];   // Selected for this student's context
}

// ── Planned Interaction (what happens, not how it looks) ─────────────────────
export interface PlannedInteraction {
    level: InteractionLevel;
    moment: 'pre_observation' | 'mid_act' | 'post_observation' | 'pre_reveal' | 'post_act';
    purpose: string;                    // Educational purpose of this interaction
    question: string;
    options?: string[];                 // For level 2 (predict)
    correct_index?: number;
    misconception_targeted?: string;    // Which misconception this addresses
    feedback_if_correct: string;        // Continues the story — not "Correct!"
    feedback_if_wrong: string;          // Addresses misconception — not "Wrong!"
    silence_before_seconds: number;     // Mandatory pause before interaction appears
    silence_after_seconds: number;      // Mandatory pause after interaction resolves
}

// ── Act Pacing (timing rules for this act) ────────────────────────────────────
export interface ActPacing {
    estimated_duration_seconds: number;
    silence_moments: SilenceMoment[];
    freeze_frames: FreezeMoment[];      // When to pause and let student observe
    replay_moments: string[];           // Which observations to replay after reveal
}

export interface SilenceMoment {
    trigger: 'pre_prediction' | 'post_reveal' | 'memory_anchor' | 'reflection';
    duration_seconds: number;           // Document 4 Rule A2 — mandatory minimums
}

export interface FreezeMoment {
    observation_index: number;          // Which observation_sequence step to freeze
    duration_seconds: number;           // Minimum 3s per Document 4 Rule T3
    focus_point: string;                // What the student should look at
}

// ── Timing Plan (overall lesson rhythm) ──────────────────────────────────────
export interface TimingPlan {
    total_duration_seconds: number;
    act_durations: Record<number, number>;
    mandatory_silences_total: number;   // Sum of all silence moments
    interaction_count: number;
    estimated_cognitive_load: 'low' | 'medium' | 'high';
}

// ── Memory Plan (how the memory anchor is delivered) ─────────────────────────
export interface MemoryPlan {
    selected_memory_model: CandidateMemoryModel;  // Which model from LEO candidates
    anchor: MemoryAnchor;
    timing: {
        appears_after_seconds: number;            // After final act completes
        silence_before_image_seconds: number;     // Rule M2 — minimum 0
        image_hold_seconds: number;               // Rule M2 — minimum 6
        anchor_sentence_silence_before: number;   // Rule M3 — minimum 3
        anchor_sentence_silence_after: number;    // Rule M3 — minimum 3
    };
    recurrence_trigger: string | null;            // Topic that triggers recall in future
}

// ── Subtitle Plan ─────────────────────────────────────────────────────────────
export interface SubtitlePlan {
    language: string;
    bilingual: boolean;                           // Rule S4
    keywords_to_highlight: string[];              // Rule S2 — first appearances
    suppress_during_prediction: true;             // Rule S5 — always true
    progressive_reveal: true;                     // Rule S3 — always true
}

// ── Audio Plan ────────────────────────────────────────────────────────────────
export interface AudioPlan {
    voice_language: string;
    narrator_voice: string;                       // From multi-voice protocol Rule A6
    protagonist_voice: string | null;
    music_transitions: MusicTransition[];
    ambient_sound_scenes: string[];               // Which acts have ambient sound
    emphasis_terms: string[];                     // First-appearance terms Rule A5
}

export interface MusicTransition {
    trigger: string;                              // What causes the music change
    music_state: 'begins_softly' | 'swells' | 'stops' | 'single_note' | 'fades' | 'returns_gently';
    educational_purpose: string;                  // Justification per Document 4 Rule A3
}

// ── Completion Criteria ───────────────────────────────────────────────────────
export interface CompletionCriteria {
    minimum_acts_completed: number;
    prediction_accuracy_required: boolean;
    reflection_answered: boolean;
    memory_anchor_shown: boolean;
    success_indicators: LearningSuccessCriteria;  // From LEO — what student should achieve
}

// ── The ExperiencePlan (what the Cinema Engine consumes) ─────────────────────
export interface ExperiencePlan {
    lesson_id: string;
    topic: string;
    grade: number;
    subject: string;
    language: string;
    central_question: string;                     // Drives entire experience
    learning_goal: string;                        // essential_idea from LEO
    target_learner: StudentProfile;
    acts: ExperienceAct[];                        // Always 5
    timing_plan: TimingPlan;
    memory_plan: MemoryPlan;
    subtitle_plan: SubtitlePlan;
    audio_plan: AudioPlan;
    completion_criteria: CompletionCriteria;
    adaptation_notes: string;                     // Why this plan was adapted for this student
}
