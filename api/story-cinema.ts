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

    const prompt = `You are the director of "மாயக் கற்றல் திரையரங்கம்" (Magical Learning Theatre).
Stage "${topic}" (${subject || 'Science'}, Grade ${gradeNum}) as a 5-act cinematic lesson for Tamil Nadu students.
Language: ${language || 'English'}. Style: ${style || 'Dramatic'}.

Pick a historical protagonist (Newton/Raman/Einstein for Physics; Ramanujan for Maths; Curie/Mendel for Biology; Thiruvalluvar for Tamil; else a Tamil student named Priya or Arjun).

═══════════════════════════════════════
CINEMATIC CONTENT RULES (MANDATORY)
═══════════════════════════════════════

TARGET OUTPUT:
- 30–40 screenplay beats total across all 5 acts.
- Each beat spoken in approximately 2–4 seconds.
- Total lesson naturally takes 90–120 seconds when narrated.
- This means each act must have 6–8 screenplay beats minimum.

EACH ACT MUST CONTAIN THESE BEAT TYPES IN ORDER:
1. Opening visual beat — set the scene, no explanation yet (narrator)
2. Character entrance/reaction — protagonist speaks, reacts to what they see
3. Observation narration — narrator describes what is happening step by step
4. Character dialogue — protagonist asks a question or makes a wrong prediction
5. Visual transition beat — narrator describes a change in the scene
6. Emotional beat — character feels wonder, confusion, or discovery
7. Closing hook — narrator ends the act with tension or a question

QUALITY RULES:
- Do not summarize. Develop the scene gradually.
- Every screenplay beat must either: reveal something new, deepen understanding, or increase curiosity.
- Never repeat information already stated in a previous beat.
- Each act must feel like a different scene — location, mood, and visual state must change.

VISUAL PROGRESSION RULE:
- Every visual state must correspond to a different SVG stage.
- Do not keep the same visual while multiple dialogue lines are spoken.
- Each act must describe 3–5 distinct visual moments in stage_elements.

ACT STRUCTURE:
- Act 1 (hook): Open with a surprising phenomenon. No explanation. End with "why does this happen?"
- Act 2 (rising_action): Show observations step by step. Build a prediction moment. Surface a misconception.
- Act 3 (climax): The concept reveal — the "aha!" moment. ONE line must have is_concept_reveal:true. Build up to it.
- Act 4 (resolution): Connect to Tamil Nadu daily life. 3 vivid real-world examples. Student sees the concept everywhere.
- Act 5 (exam_bridge): Consolidate understanding. Exam tip. One unforgettable memory anchor sentence.

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════

Output ONLY valid JSON (no markdown, no explanation):
{
  "cinema_title":"string",
  "subject":"string",
  "grade":"string",
  "protagonist":{
    "name":"string","era":"string","role":"string",
    "tamil_connection":"string","avatar_emoji":"string"
  },
  "acts":[{
    "act_number":1,
    "act_title":"string",
    "act_type":"hook",
    "setting":{
      "place":"string","tamil_parallel":"string",
      "time_of_day":"string","mood":"string"
    },
    "stage_elements":[
      {"element_type":"character","name":"string","description":"string","position":"left","animation":"enter","highlight":true},
      {"element_type":"prop","name":"string","description":"string","position":"center","animation":"appear","highlight":false},
      {"element_type":"environment","name":"string","description":"string","position":"right","animation":"fade_in","highlight":false}
    ],
    "screenplay":[
      {"speaker":"narrator","text":"string","emotion":"curious","is_concept_reveal":false},
      {"speaker":"protagonist","text":"string","emotion":"curious","is_concept_reveal":false},
      {"speaker":"narrator","text":"string","emotion":"mysterious","is_concept_reveal":false},
      {"speaker":"narrator","text":"string","emotion":"tense","is_concept_reveal":false},
      {"speaker":"protagonist","text":"string","emotion":"confused","is_concept_reveal":false},
      {"speaker":"narrator","text":"string","emotion":"curious","is_concept_reveal":false},
      {"speaker":"protagonist","text":"string","emotion":"wondering","is_concept_reveal":false},
      {"speaker":"narrator","text":"string","emotion":"hooks","is_concept_reveal":false}
    ],
    "concept_board":{
      "title":"string","formula":"string",
      "key_points":["string","string","string"],
      "tamil_analogy":"string"
    },
    "curtain_question":"string"
  }],
  "interval_card":{"recap":"string","teaser":"string"},
  "exam_spotlight":{
    "most_asked_question":"string",
    "model_answer_structure":["string","string","string"],
    "marks_tip":"string",
    "previous_year_hint":"string"
  },
  "quiz":[
    {"question":"string","options":["A","B","C","D"],"answer":"A","explanation":"string","concept_connection":"string"},
    {"question":"string","options":["A","B","C","D"],"answer":"B","explanation":"string","concept_connection":"string"},
    {"question":"string","options":["A","B","C","D"],"answer":"C","explanation":"string","concept_connection":"string"}
  ]
}

FINAL CHECK BEFORE OUTPUT:
- Count total screenplay beats. Must be 30–40.
- Every act must have 6–8 beats.
- No act may repeat information from a previous act.
- Every visual stage_element must describe a distinct visual moment.
- The JSON must be complete. Do not truncate.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 1024 },
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
