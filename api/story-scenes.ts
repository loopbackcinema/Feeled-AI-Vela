import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// ─────────────────────────────────────────────────────────────────────────────
// Scene-based storytelling endpoint for Grades 10–12.
// Parallel to api/story.ts (single linear story); this produces the 6-scene
// audio-visual narrative used by "மாயக் கற்றல் உலகம்" (Magical Learning World).
// api/story.ts is intentionally left untouched.
// ─────────────────────────────────────────────────────────────────────────────

type SceneType = "hook" | "conflict" | "discovery" | "application" | "reflection" | "exam_connect";

interface StoryScene {
    scene_number: number;
    scene_title: string;
    scene_type: SceneType;
    setting: string;
    characters: string[];
    narrative: string;
    concept_highlight: string;
    visual_prompt: string;
    socratic_question: string;
    student_response_hint: string;
}

interface SceneQuizItem {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
}

interface SceneStory {
    title: string;
    grade: string;
    subject: string;
    curriculum_connection: string;   // TN Samacheer chapter reference
    scenes: StoryScene[];
    exam_tips: string[];
    quiz: SceneQuizItem[];
}

const sceneSchema = {
    type: Type.OBJECT,
    properties: {
        scene_number:          { type: Type.NUMBER },
        scene_title:           { type: Type.STRING },
        scene_type:            { type: Type.STRING, enum: ["hook", "conflict", "discovery", "application", "reflection", "exam_connect"] },
        setting:               { type: Type.STRING },
        characters:            { type: Type.ARRAY, items: { type: Type.STRING } },
        narrative:             { type: Type.STRING },
        concept_highlight:     { type: Type.STRING },
        visual_prompt:         { type: Type.STRING },
        socratic_question:     { type: Type.STRING },
        student_response_hint: { type: Type.STRING },
    },
    required: [
        "scene_number", "scene_title", "scene_type", "setting", "characters",
        "narrative", "concept_highlight", "visual_prompt", "socratic_question", "student_response_hint",
    ],
};

const sceneStorySchema = {
    type: Type.OBJECT,
    properties: {
        title:                 { type: Type.STRING },
        grade:                 { type: Type.STRING },
        subject:               { type: Type.STRING },
        curriculum_connection: { type: Type.STRING },
        scenes:                { type: Type.ARRAY, items: sceneSchema },
        exam_tips:             { type: Type.ARRAY, items: { type: Type.STRING } },
        quiz: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question:    { type: Type.STRING },
                    options:     { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer:      { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                required: ["question", "options", "answer", "explanation"],
            },
        },
    },
    required: ["title", "grade", "subject", "curriculum_connection", "scenes", "exam_tips", "quiz"],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: "API_KEY not set" });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const { topic, grade, subject, language, emotionTone } = req.body;
        const gradeNum = parseInt(String(grade ?? '').replace(/\D/g, ''), 10) || 10;

        const gradeGuidance = gradeNum <= 10
            ? `Pitch this at a Grade 10 level: simple, warm language where a natural Tamil + English classroom mix (Tanglish) is welcome. Anchor everything in relatable daily life — school, home, local shops, buses, temples and festivals.`
            : `Pitch this at a Grade ${gradeNum} level: more technical and precise language. Give it a career- and future-oriented framing — connect the concept to higher studies, competitive exams (NEET / JEE), and real professions.`;

        const prompt = `You are the narrative engine behind "மாயக் கற்றல் உலகம்" (Magical Learning World), an immersive, audio-visual, scene-based learning experience for Tamil Nadu students.

TASK: Turn the academic topic "${topic}" (subject: ${subject}) into a 6-scene cinematic story for a Grade ${gradeNum} student.
LANGUAGE: Write the story in ${language}. ${gradeGuidance}
EMOTIONAL TONE: ${emotionTone}.

WORLD & CAST:
- Set every scene in real Tamil Nadu places (Chennai beaches and streets, Madurai temples and markets, rural villages, local markets, schools, bus stands, paddy fields).
- Use named Tamil characters (e.g. Murugan, Kavitha, Anbu, Priya, Selvi, Arjun). Reuse the same cast across scenes for continuity.
- Ground every explanation in TN Samacheer (Tamil Nadu State Board) curriculum language. Set "curriculum_connection" to the specific TN Samacheer chapter/unit this topic maps to.

THE 6 SCENES — use exactly these scene_number → scene_type pairs, in order:
1. hook         — open the world, introduce the characters, spark curiosity.
2. conflict     — a real problem appears that needs the concept to be solved.
3. discovery    — reveal the concept. IMPORTANT: embed the ACTUAL formula / definition / law naturally inside the characters' dialogue, not as a textbook dump.
4. application  — the characters apply the concept to solve the problem.
5. reflection   — the characters (and the student) reflect on what was learned and why it matters.
6. exam_connect — explicitly bridge the story to "how this concept appears in the TN Board exam" (question types, mark weightage, common traps).

FOR EVERY SCENE provide:
- scene_title: a short evocative title (e.g. "The Problem").
- setting: the specific Tamil Nadu location.
- characters: the named characters present in the scene.
- narrative: vivid story text — MINIMUM 100 words.
- concept_highlight: the exact educational concept embedded in that scene.
- visual_prompt: a rich description for an image generator (place, characters, mood, lighting, style) to render the scene.
- socratic_question: one open Socratic question to ask the student right after the scene to make them think.
- student_response_hint: the idea/answer you want to gently guide the student toward.

ALSO PROVIDE:
- exam_tips: exactly 3 actionable tips written from a TN Board examiner's perspective.
- quiz: exactly 3 multiple-choice questions, each with exactly 4 options, the correct "answer" (it must exactly match one of the options), and an "explanation" that connects the answer back to the TN Samacheer curriculum.

Return the output strictly as JSON matching the provided schema. Do not include any markdown or commentary outside the JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: sceneStorySchema,
            },
        });

        if (!response.text) throw new Error("Empty response from Gemini");
        const scenes_story: SceneStory = JSON.parse(response.text.trim());
        res.status(200).json({ scenes_story });
    } catch (error) {
        console.error('Gemini Scene Story Generation Error:', error);
        res.status(500).json({ error: 'Pedagogical generation failed' });
    }
}
