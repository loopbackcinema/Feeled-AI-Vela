import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic storytelling endpoint — "மாயக் கற்றல் திரையரங்கம்" (Magical Learning
// Theatre). A 5-act stage play that turns an academic topic into a cinematic
// learning experience for Tamil Nadu Grade 10–12 students.
// Parallel to api/story.ts and api/story-scenes.ts; both are left untouched.
// ─────────────────────────────────────────────────────────────────────────────

type ActType = "hook" | "rising_action" | "climax" | "resolution" | "exam_bridge";
type ElementType = "character" | "object" | "formula" | "diagram" | "label" | "effect";
type Position = "left" | "center" | "right" | "top" | "bottom";
type Animation = "enter" | "float" | "pulse" | "fall" | "rise" | "spin" | "glow";
type Speaker = "narrator" | "protagonist" | "student_voice" | "concept_voice";
type Emotion = "curious" | "excited" | "dramatic" | "calm" | "triumphant";

interface Protagonist {
    name: string;
    era: string;
    role: string;
    tamil_connection: string;
    avatar_emoji: string;
}

interface StageElement {
    element_type: ElementType;
    name: string;
    description: string;
    position: Position;
    animation: Animation;
    highlight: boolean;
}

interface ScreenplayLine {
    speaker: Speaker;
    text: string;
    emotion: Emotion;
    is_concept_reveal: boolean;
}

interface ConceptBoard {
    title: string;
    formula: string;
    key_points: string[];
    tamil_analogy: string;
}

interface Setting {
    place: string;
    tamil_parallel: string;
    time_of_day: string;
    mood: string;
}

interface CinemaAct {
    act_number: number;
    act_title: string;
    act_type: ActType;
    setting: Setting;
    stage_elements: StageElement[];
    screenplay: ScreenplayLine[];
    concept_board: ConceptBoard;
    curtain_question: string;
}

interface IntervalCard {
    recap: string;
    teaser: string;
}

interface ExamSpotlight {
    most_asked_question: string;
    model_answer_structure: string[];
    marks_tip: string;
    previous_year_hint: string;
}

interface CinemaQuizItem {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
    concept_connection: string;
}

interface CinemaStory {
    cinema_title: string;
    subject: string;
    grade: string;
    protagonist: Protagonist;
    acts: CinemaAct[];
    interval_card: IntervalCard;
    exam_spotlight: ExamSpotlight;
    quiz: CinemaQuizItem[];
}

const stageElementSchema = {
    type: Type.OBJECT,
    properties: {
        element_type: { type: Type.STRING, enum: ["character", "object", "formula", "diagram", "label", "effect"] },
        name:         { type: Type.STRING },
        description:  { type: Type.STRING },
        position:     { type: Type.STRING, enum: ["left", "center", "right", "top", "bottom"] },
        animation:    { type: Type.STRING, enum: ["enter", "float", "pulse", "fall", "rise", "spin", "glow"] },
        highlight:    { type: Type.BOOLEAN },
    },
    required: ["element_type", "name", "description", "position", "animation", "highlight"],
};

const screenplaySchema = {
    type: Type.OBJECT,
    properties: {
        speaker:           { type: Type.STRING, enum: ["narrator", "protagonist", "student_voice", "concept_voice"] },
        text:              { type: Type.STRING },
        emotion:           { type: Type.STRING, enum: ["curious", "excited", "dramatic", "calm", "triumphant"] },
        is_concept_reveal: { type: Type.BOOLEAN },
    },
    required: ["speaker", "text", "emotion", "is_concept_reveal"],
};

const actSchema = {
    type: Type.OBJECT,
    properties: {
        act_number: { type: Type.NUMBER },
        act_title:  { type: Type.STRING },
        act_type:   { type: Type.STRING, enum: ["hook", "rising_action", "climax", "resolution", "exam_bridge"] },
        setting: {
            type: Type.OBJECT,
            properties: {
                place:         { type: Type.STRING },
                tamil_parallel:{ type: Type.STRING },
                time_of_day:   { type: Type.STRING },
                mood:          { type: Type.STRING },
            },
            required: ["place", "tamil_parallel", "time_of_day", "mood"],
        },
        stage_elements: { type: Type.ARRAY, items: stageElementSchema },
        screenplay:     { type: Type.ARRAY, items: screenplaySchema },
        concept_board: {
            type: Type.OBJECT,
            properties: {
                title:         { type: Type.STRING },
                formula:       { type: Type.STRING },
                key_points:    { type: Type.ARRAY, items: { type: Type.STRING } },
                tamil_analogy: { type: Type.STRING },
            },
            required: ["title", "formula", "key_points", "tamil_analogy"],
        },
        curtain_question: { type: Type.STRING },
    },
    required: ["act_number", "act_title", "act_type", "setting", "stage_elements", "screenplay", "concept_board", "curtain_question"],
};

const cinemaSchema = {
    type: Type.OBJECT,
    properties: {
        cinema_title: { type: Type.STRING },
        subject:      { type: Type.STRING },
        grade:        { type: Type.STRING },
        protagonist: {
            type: Type.OBJECT,
            properties: {
                name:             { type: Type.STRING },
                era:              { type: Type.STRING },
                role:             { type: Type.STRING },
                tamil_connection: { type: Type.STRING },
                avatar_emoji:     { type: Type.STRING },
            },
            required: ["name", "era", "role", "tamil_connection", "avatar_emoji"],
        },
        acts: { type: Type.ARRAY, items: actSchema },
        interval_card: {
            type: Type.OBJECT,
            properties: {
                recap:  { type: Type.STRING },
                teaser: { type: Type.STRING },
            },
            required: ["recap", "teaser"],
        },
        exam_spotlight: {
            type: Type.OBJECT,
            properties: {
                most_asked_question:   { type: Type.STRING },
                model_answer_structure:{ type: Type.ARRAY, items: { type: Type.STRING } },
                marks_tip:             { type: Type.STRING },
                previous_year_hint:    { type: Type.STRING },
            },
            required: ["most_asked_question", "model_answer_structure", "marks_tip", "previous_year_hint"],
        },
        quiz: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question:           { type: Type.STRING },
                    options:            { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer:             { type: Type.STRING },
                    explanation:        { type: Type.STRING },
                    concept_connection: { type: Type.STRING },
                },
                required: ["question", "options", "answer", "explanation", "concept_connection"],
            },
        },
    },
    required: ["cinema_title", "subject", "grade", "protagonist", "acts", "interval_card", "exam_spotlight", "quiz"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { topic, grade, subject, language, style } = req.body;
        const gradeNum = parseInt(String(grade ?? '').replace(/\D/g, ''), 10) || 10;

        const gradeGuidance = gradeNum <= 10
            ? `GRADE 10 — wonder-focused. Spark awe and curiosity. Tie every idea to daily life a 15-year-old knows: school, home, the local market, buses, the beach, festivals.`
            : gradeNum === 11
                ? `GRADE 11 — career-connected and deeper. Go beyond the textbook: connect the concept to higher studies, professions and real-world applications. Use more precise, technical language.`
                : `GRADE 12 — board exam pressure and mastery. Be rigorous and exam-sharp. Treat the student as someone preparing for high-stakes TN Board exams; emphasise precision, common traps and full mastery.`;

        const prompt = `You are the director of "மாயக் கற்றல் திரையரங்கம்" (Magical Learning Theatre), an immersive, cinematic, stage-play learning experience for Tamil Nadu students.

TASK: Stage the academic topic "${topic}" (subject: ${subject}) as a 5-act cinematic play for a Grade ${gradeNum} student.
LANGUAGE: Write all narrative, dialogue and concept text in ${language}.
CINEMATIC STYLE: ${style}.
${gradeGuidance}

PROTAGONIST — choose a historically apt hero based on the subject:
- Physics → Newton, Einstein, or C.V. Raman
- Chemistry → Mendeleev or Marie Curie
- Biology → Darwin, Mendel, or Pasteur
- Maths → Ramanujan or Aryabhatta
- History → an actual figure from the relevant period
- Economics → Marshall, Kautilya, or Adam Smith
- Tamil → Thiruvalluvar, Avvaiyar, or Bharathiyar
- Computer Science → Alan Turing or Grace Hopper
- Geography → Ibn Battuta or Ptolemy
- If none fit → a brilliant, relatable Tamil student as the protagonist.
Fill the protagonist's era, role, a genuine tamil_connection (how their work links to Tamil Nadu / Tamil culture / Tamil students' lives), and a fitting avatar_emoji.

THE 5 ACTS — use exactly these act_number → act_type pairs, in order:
1. hook          — raise the curtain, introduce the protagonist and the world, spark a question.
2. rising_action — tension builds; a problem grows that demands the concept.
3. climax        — THE MAIN CONCEPT REVELATION. Reveal the core idea, formula or law here, dramatically, woven into the dialogue (mark those lines with is_concept_reveal: true).
4. resolution    — the protagonist applies the concept and resolves the story; the student sees it click.
5. exam_bridge   — bridge the whole play to the TN Board exam format (question types, mark weightage, how to write the answer).

EVERY ACT MUST:
- Include a Tamil Nadu analogy — fill setting.tamil_parallel with a vivid local parallel (a Chennai street, a Madurai temple, a village paddy field, a local market, a TN classroom, etc.).
- Provide setting (place, tamil_parallel, time_of_day, mood).
- Provide stage_elements: the visual props on stage (characters, objects, formulas, diagrams, labels, effects) with position, animation and whether each is highlighted.
- Provide a screenplay: an ordered list of spoken lines by narrator / protagonist / student_voice / concept_voice, each with an emotion, marking concept-reveal lines with is_concept_reveal: true.
- Provide a concept_board: title, the exact formula/definition/law, 3-5 key_points, and a tamil_analogy.
- End with a curtain_question: one open Socratic question to leave the student thinking.

INTERVAL: After Act 3 (the climax) and before Act 4, the show breaks for interval_card — a short recap of what was learned so far and a teaser for the resolution.

EXAM SPOTLIGHT: After Act 5, give exam_spotlight grounded in the TN Board (Samacheer) exam: the most_asked_question on this topic, a model_answer_structure (ordered points for a full-mark answer), a marks_tip, and a previous_year_hint.

QUIZ: Exactly 3 multiple-choice questions, each with exactly 4 options, the correct "answer" (must exactly match one of the options), an "explanation", and a "concept_connection" linking it back to the act where the concept was revealed.

Return the output strictly as JSON matching the provided schema. Do not include any markdown or commentary outside the JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: "application/json",
                responseSchema: cinemaSchema,
            },
        });

        if (!response.text) throw new Error("Empty response from Gemini");
        const cinema: CinemaStory = JSON.parse(response.text.trim());
        res.status(200).json({ cinema });
    } catch (error) {
        console.error('Gemini Cinema Story Generation Error:', error);
        res.status(500).json({ error: 'Pedagogical generation failed' });
    }
}
