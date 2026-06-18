import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { fetchExamFrequency } from './_rag';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic storytelling endpoint — "மாயக் கற்றல் திரையரங்கம்"
// Prompt-only JSON (no responseSchema) for speed — fits Vercel Hobby 10s limit.
// fetchExamFrequency runs in parallel, not blocking the main generation.
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const { topic, grade, subject, language, style } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const gradeNum = parseInt(String(grade ?? '').replace(/\D/g, ''), 10) || 10;
    const gradeGuidance = gradeNum <= 10
        ? 'GRADE 10 — wonder-focused. Spark awe. Tie every idea to daily life a 15-year-old knows.'
        : gradeNum === 11
            ? 'GRADE 11 — career-connected. Connect to higher studies and real-world applications.'
            : 'GRADE 12 — board-exam sharp. Rigorous, precise, exam-focused.';

    const prompt = `You are the director of "மாயக் கற்றல் திரையரங்கம்" (Magical Learning Theatre).

TASK: Stage "${topic}" (subject: ${subject || 'General'}, Grade ${gradeNum}) as a 5-act cinematic play.
LANGUAGE: ${language || 'English'}. STYLE: ${style || 'Dramatic'}.
${gradeGuidance}

PROTAGONIST: Pick the best-fit historical figure (Newton/Einstein/Raman for Physics, Mendel/Curie for Biology/Chemistry, Ramanujan for Maths, Thiruvalluvar for Tamil, etc.) or a Tamil student if none fit.

Output ONLY valid JSON, no markdown, no commentary. Use this exact structure:

{
  "cinema_title": "string",
  "subject": "string",
  "grade": "string",
  "protagonist": {
    "name": "string",
    "era": "string",
    "role": "string",
    "tamil_connection": "string",
    "avatar_emoji": "string"
  },
  "acts": [
    {
      "act_number": 1,
      "act_title": "string",
      "act_type": "hook",
      "setting": { "place": "string", "tamil_parallel": "string", "time_of_day": "string", "mood": "string" },
      "stage_elements": [
        { "element_type": "character|object|formula|diagram|label|effect", "name": "string", "description": "string", "position": "left|center|right|top|bottom", "animation": "enter|float|pulse|fall|rise|glow", "highlight": true }
      ],
      "screenplay": [
        { "speaker": "narrator|protagonist|student_voice|concept_voice", "text": "string", "emotion": "curious|excited|dramatic|calm|triumphant", "is_concept_reveal": false }
      ],
      "concept_board": { "title": "string", "formula": "string", "key_points": ["string"], "tamil_analogy": "string" },
      "curtain_question": "string"
    }
  ],
  "interval_card": { "recap": "string", "teaser": "string" },
  "exam_spotlight": {
    "most_asked_question": "string",
    "model_answer_structure": ["string"],
    "marks_tip": "string",
    "previous_year_hint": "string"
  },
  "quiz": [
    { "question": "string", "options": ["A","B","C","D"], "answer": "A", "explanation": "string", "concept_connection": "string" }
  ]
}

RULES:
- Exactly 5 acts with act_types in order: hook, rising_action, climax, resolution, exam_bridge
- Each act: 2-3 stage_elements, 3-4 screenplay lines, concept_board with formula/key_points
- Climax act: at least one screenplay line with is_concept_reveal: true
- interval_card placed logically after act 3
- quiz: exactly 3 questions, 4 options each
- stage_elements: use meaningful names tied to the concept (e.g. "Newton's Apple", "F=ma formula", "sine wave diagram")
- tamil_parallel in every setting: vivid Tamil Nadu local reference`;

    try {
        // Run cinema generation and exam frequency lookup in PARALLEL
        const [response, freq] = await Promise.all([
            ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    temperature: 0.75,
                    responseMimeType: 'application/json',
                },
            }),
            fetchExamFrequency({
                query: topic,
                subject: subject || '',
                grade: String(gradeNum),
            }).catch(() => ({ years: [], count: 0 })),
        ]);

        if (!response.text) throw new Error('Empty Gemini response');

        let cinema: any;
        try {
            cinema = JSON.parse(response.text.trim());
        } catch (_) {
            // Strip any accidental markdown fences and retry
            const clean = response.text.replace(/```json|```/g, '').trim();
            cinema = JSON.parse(clean);
        }

        // Attach RAG exam frequency data
        if (freq.years.length > 0 && cinema.exam_spotlight) {
            cinema.exam_spotlight.rag_years = freq.years;
            cinema.exam_spotlight.rag_count = freq.count;
        }

        return res.status(200).json({ cinema });
    } catch (error) {
        console.error('Cinema generation error:', error);
        return res.status(500).json({ error: 'Cinema generation failed', detail: String(error) });
    }
}
