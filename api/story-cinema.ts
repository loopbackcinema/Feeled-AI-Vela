import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Cinema generation — no responseSchema, no RAG in this call (RAG via separate endpoint)
// thinkingBudget:0 disables thinking mode for speed. Target: <8s on Vercel Hobby.

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const { topic, grade, subject, language, style } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const gradeNum = parseInt(String(grade ?? '').replace(/\D/g, ''), 10) || 10;

    const prompt = `You are the director of "மாயக் கற்றல் திரையரங்கம்" (Magical Learning Theatre).

Stage "${topic}" (${subject || 'Science'}, Grade ${gradeNum}) as a 5-act play for Tamil Nadu students.
Language: ${language || 'English'}. Style: ${style || 'Dramatic'}.

Pick a historical protagonist (Newton/Raman/Einstein for Physics; Ramanujan for Maths; Curie/Mendel for Biology; Thiruvalluvar for Tamil; else a Tamil student).

Output ONLY valid JSON with this structure (no markdown):
{
  "cinema_title":"string","subject":"string","grade":"string",
  "protagonist":{"name":"string","era":"string","role":"string","tamil_connection":"string","avatar_emoji":"string"},
  "acts":[{
    "act_number":1,"act_title":"string",
    "act_type":"hook",
    "setting":{"place":"string","tamil_parallel":"Chennai street/temple/etc","time_of_day":"string","mood":"string"},
    "stage_elements":[{"element_type":"character","name":"string","description":"string","position":"left","animation":"enter","highlight":true}],
    "screenplay":[{"speaker":"narrator","text":"string","emotion":"curious","is_concept_reveal":false}],
    "concept_board":{"title":"string","formula":"string","key_points":["string","string"],"tamil_analogy":"string"},
    "curtain_question":"string"
  }],
  "interval_card":{"recap":"string","teaser":"string"},
  "exam_spotlight":{"most_asked_question":"string","model_answer_structure":["string","string"],"marks_tip":"string","previous_year_hint":"string"},
  "quiz":[{"question":"string","options":["A","B","C","D"],"answer":"A","explanation":"string","concept_connection":"string"}]
}

Rules: 5 acts (hook→rising_action→climax→resolution→exam_bridge). Each act: 2 stage_elements max, 3 screenplay lines max. Climax: one line with is_concept_reveal:true. 3 quiz items. Keep responses concise.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 },
            },
        });

        if (!response.text) throw new Error('Empty response');

        let cinema: any;
        const raw = response.text.replace(/```json\n?|```/g, '').trim();
        cinema = JSON.parse(raw);

        return res.status(200).json({ cinema });
    } catch (error) {
        console.error('Cinema error:', String(error));
        return res.status(500).json({ error: 'Cinema generation failed', detail: String(error) });
    }
}
