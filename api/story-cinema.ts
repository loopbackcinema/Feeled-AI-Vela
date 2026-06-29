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

CRITICAL CONTENT RULES:
- Each act MUST have 6-8 screenplay lines minimum. This is mandatory.
- Total screenplay lines across all 5 acts: 30-40 lines.
- Each line should be 1-2 sentences that can be narrated in 3-5 seconds.
- Target total lesson duration: 90-120 seconds of narration.
- Create a genuine cinematic experience: build tension, reveal, wonder, resolution.
- Act 1 (hook): Open with a surprising real-world phenomenon. Make student ask "why?".
- Act 2 (rising_action): Show observations step by step. Build prediction moment.
- Act 3 (climax): The concept reveal moment — the "aha!" — with is_concept_reveal:true on ONE key line.
- Act 4 (resolution): Connect to daily life in Tamil Nadu. 2-3 vivid real-world examples.
- Act 5 (exam_bridge): Consolidate. Exam tip. Memory anchor sentence.

Output ONLY valid JSON (no markdown):
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
      {"element_type":"prop","name":"string","description":"string","position":"center","animation":"appear","highlight":false}
    ],
    "screenplay":[
      {"speaker":"narrator","text":"string","emotion":"curious","is_concept_reveal":false},
      {"speaker":"protagonist","text":"string","emotion":"curious","is_concept_reveal":false},
      {"speaker":"narrator","text":"string","emotion":"curious","is_concept_reveal":false},
      {"speaker":"narrator","text":"string","emotion":"tense","is_concept_reveal":false},
      {"speaker":"protagonist","text":"string","emotion":"confused","is_concept_reveal":false},
      {"speaker":"narrator","text":"string","emotion":"curious","is_concept_reveal":false}
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

IMPORTANT: Generate all 5 acts. Each act must have exactly 6-8 screenplay entries. Do not truncate. The JSON must be complete and valid.`;

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
