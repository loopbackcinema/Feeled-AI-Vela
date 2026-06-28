
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
