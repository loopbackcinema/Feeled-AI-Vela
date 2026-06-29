import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const { topic, grade, subject, language, style } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const gradeNum = parseInt(String(grade ?? '').replace(/\D/g, ''), 10) || 10;

    const prompt = `You are the AI Director of "மாயக் கற்றல் திரையரங்கம்" (Magical Learning Cinema).

Your job is NOT to write a story. Your job is to PLAN a cinematic lesson like a film director.

TOPIC: "${topic}"
SUBJECT: ${subject || 'Science'}
GRADE: ${gradeNum}
LANGUAGE: ${language || 'English'}
STYLE: ${style || 'Dramatic'}

═══════════════════════════════════════
STEP 1 — CONCEPT ANALYSIS
═══════════════════════════════════════

First, analyze what type of scientific concept this is.

AVAILABLE VISUAL GRAMMARS:
- "force" — objects, pushes, pulls, motion vectors, F=ma, Newton, pressure, friction
- "flow" — movement through systems: blood, electricity, water, photosynthesis, current
- "orbit" — circular paths, attraction: gravity, electrons, planets, atomic structure
- "wave" — oscillation, propagation: light, sound, EM radiation, frequency
- "growth" — progressive development: cell division, population, compound interest
- "reaction" — state change: chemical reactions, phase transitions, acid-base
- "network" — connected nodes: DNA, neural, circuit, ecosystem
- "field" — invisible forces: magnetic field, electric field, gravitational field
- "cycle" — repeating process: water cycle, carbon cycle, rock cycle, seasons
- "comparison" — side-by-side contrast: mitosis vs meiosis, acids vs bases
- "journey" — discovery narrative: historical scientist story, evolutionary timeline
- "graph" — mathematical functions, data visualization, statistics

Select the PRIMARY grammar and up to 2 secondary grammars.

═══════════════════════════════════════
STEP 2 — SCENE PLAN (5 scenes, one per act)
═══════════════════════════════════════

For each scene, plan:
- visual_grammar: which grammar drives this scene
- camera: how the camera frames this moment
  Options: wide_establishing, close_up, follow_object, orbit_around, zoom_in, zoom_out, pov_inside, cutaway, freeze_frame
- key_visual: ONE specific thing the student must see (e.g. "apple falling", "force arrow appearing", "cell splitting")
- scientific_overlay: labels, formulas, or arrows that appear (e.g. "F=ma label", "gravity arrow", "ATP molecule")
- animation_type: how it moves (e.g. "object_falls", "arrow_extends", "particles_flow", "cell_divides")
- duration_seconds: how long this scene lasts (8-20 seconds)
- emotional_target: what the student should feel (curious/confused/tense/discovering/confident)

═══════════════════════════════════════
STEP 3 — CINEMATIC DIALOGUE (30-40 beats total)
═══════════════════════════════════════

Write dialogue that DESCRIBES what the student is SEEING on screen.
- Narrator describes the visual in real time
- Protagonist reacts to what they observe
- Never explain before showing
- Every dialogue beat must reference something visible on screen
- Each beat: 1-2 sentences, spoken in 3-5 seconds

RULE: Never invent visuals randomly. Every visual must help the student understand the concept.
NEVER use: floating stars, random particles, generic glowing circles.
ALWAYS use: force arrows, water flow, orbit paths, field lines, cell structures — things that TEACH.

═══════════════════════════════════════
OUTPUT FORMAT — valid JSON only, no markdown
═══════════════════════════════════════

{
  "cinema_title": "string",
  "subject": "string",
  "grade": "string",

  "concept_analysis": {
    "primary_grammar": "force",
    "secondary_grammars": ["motion", "field"],
    "scientific_domain": "string",
    "core_misconception": "string",
    "aha_moment": "string"
  },

  "protagonist": {
    "name": "string",
    "era": "string",
    "role": "string",
    "tamil_connection": "string",
    "avatar_emoji": "string"
  },

  "scene_plan": [
    {
      "scene_number": 1,
      "act_type": "hook",
      "act_title": "string",
      "visual_grammar": "force",
      "camera": "wide_establishing",
      "key_visual": "string — what student sees",
      "scientific_overlay": "string — labels/formulas/arrows visible",
      "animation_type": "string — how it moves",
      "duration_seconds": 12,
      "emotional_target": "curious",
      "setting": {
        "place": "string",
        "tamil_parallel": "string",
        "mood": "string"
      }
    }
  ],

  "acts": [
    {
      "act_number": 1,
      "act_title": "string",
      "act_type": "hook",
      "scene_ref": 1,
      "screenplay": [
        {"speaker": "narrator", "text": "string", "emotion": "curious", "is_concept_reveal": false},
        {"speaker": "protagonist", "text": "string", "emotion": "curious", "is_concept_reveal": false},
        {"speaker": "narrator", "text": "string", "emotion": "mysterious", "is_concept_reveal": false},
        {"speaker": "narrator", "text": "string", "emotion": "tense", "is_concept_reveal": false},
        {"speaker": "protagonist", "text": "string", "emotion": "confused", "is_concept_reveal": false},
        {"speaker": "narrator", "text": "string", "emotion": "curious", "is_concept_reveal": false},
        {"speaker": "protagonist", "text": "string", "emotion": "wondering", "is_concept_reveal": false},
        {"speaker": "narrator", "text": "string", "emotion": "hooks", "is_concept_reveal": false}
      ],
      "concept_board": {
        "title": "string",
        "formula": "string",
        "key_points": ["string", "string", "string"],
        "tamil_analogy": "string"
      },
      "curtain_question": "string"
    }
  ],

  "interval_card": {"recap": "string", "teaser": "string"},

  "exam_spotlight": {
    "most_asked_question": "string",
    "model_answer_structure": ["string", "string", "string"],
    "marks_tip": "string",
    "previous_year_hint": "string"
  },

  "quiz": [
    {"question": "string", "options": ["A","B","C","D"], "answer": "A", "explanation": "string", "concept_connection": "string"},
    {"question": "string", "options": ["A","B","C","D"], "answer": "B", "explanation": "string", "concept_connection": "string"},
    {"question": "string", "options": ["A","B","C","D"], "answer": "C", "explanation": "string", "concept_connection": "string"}
  ]
}

CRITICAL: Generate all 5 scenes in scene_plan and all 5 acts. Each act must have 6-8 screenplay beats. Total screenplay beats: 30-40. JSON must be complete and valid.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 2048 },
            },
        });
        if (!response.text) throw new Error('Empty response');
        const raw = response.text.replace(/```json\n?|```/g, '').trim();
        const cinema = JSON.parse(raw);
        return res.status(200).json({ cinema });
    } catch (error) {
        console.error('Cinema error:', String(error));
        return res.status(500).json({ error: 'Cinema generation failed', detail: String(error) });
    }
}
