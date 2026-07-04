import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { fetchRagContext, normaliseGrade, effectiveMedium } from './_rag.js';

const schema = {
    type: Type.OBJECT,
    properties: {
        textbookAnswer:   { type: Type.STRING },
        examFormat:       { type: Type.ARRAY, items: { type: Type.STRING } },
        simpleExplanation:{ type: Type.STRING },
        keyKeywords:      { type: Type.ARRAY, items: { type: Type.STRING } },
        markBasedAnswers: {
            type: Type.OBJECT,
            properties: {
                twoMark:  { type: Type.STRING },
                fiveMark: { type: Type.STRING },
            },
            required: ['twoMark', 'fiveMark'],
        },
    },
    required: ['textbookAnswer', 'examFormat', 'simpleExplanation', 'keyKeywords', 'markBasedAnswers'],
};
const xrQuizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question:     { type: Type.STRING },
                    options:      { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    feedback:     { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['question', 'options', 'correctIndex', 'feedback'],
            },
        },
    },
    required: ['questions'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // XR Lab mode — cinemaV2 flag routing போலவே: existing endpoint, புதிய branch.
    // mode இல்லாத எல்லா calls-ம் பழைய flow-க்கே போகும் (backward compatible).
    if (req.body?.mode === 'xr') {
        if (req.body?.task === 'tts') return handleXRTTS(req, res, ai);
        if (req.body?.task === 'quiz') return handleXRQuiz(req, res, ai);
        if (req.body?.task === 'summary') return handleXRSummary(req, res, ai);
        if (req.body?.task === 'explain') return handleXRExplain(req, res, ai);
        return res.status(400).json({ error: 'Invalid task for XR mode' });
    }

    try {
        const { question, context } = req.body;
        const medium = effectiveMedium(context.language === 'Tamil' ? 'Tamil' : 'English');
        const grade  = normaliseGrade(context.standard ?? '');

        const { context: ragContext, chunksFound, citations, scores } = await fetchRagContext({
            query:   question,
            subject: context.subject,
            grade,
            medium,
            board:   context.board ?? 'TN Samacheer',
        });

        console.log(`[concept] grade="${grade}" subject="${context.subject}" medium="${medium}" RAG=${chunksFound} scores=[${scores.join(',')}]`);

        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, English Medium):\n${ragContext}\n\nUse the above textbook content as your PRIMARY source. Your textbookAnswer and markBasedAnswers must closely follow the textbook wording. For simpleExplanation, rephrase in simpler terms.`
            : 'No textbook excerpt available — answer from general academic knowledge.';

        const prompt = `You are an expert academic tutor for TN Samacheer Board students.
Question: ${question}
Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}
Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.

${ragSection}

CRITICAL RULES:
1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
2. Keep text clean and plain.
3. textbookAnswer: A detailed, exam-ready answer (5 mark style).
4. examFormat: 3-5 bullet points for presenting in an exam.
5. simpleExplanation: Easy 1-2 sentence explanation a younger student could understand.
6. keyKeywords: 4-6 important technical terms from this topic.
7. markBasedAnswers.twoMark: A concise 2-mark answer (2-3 sentences).
8. markBasedAnswers.fiveMark: A structured 5-mark answer with clear points.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: schema },
        });

        if (!response.text) throw new Error('Empty response');
        const data = JSON.parse(response.text.trim());
        res.status(200).json({ ...data, ragCitations: citations });
    } catch (error) {
        console.error('Concept API Error:', error);
        res.status(500).json({ error: 'Failed to generate concept explanation' });
    }
}

// ─────────────────────────────────────────────────────────────
// FeelEd XR Lab — 3D model explanation (RAG தேவையில்லை; client
// அனுப்பும் factSheet-ஏ grounding — hallucination தடுக்கும்)
// ─────────────────────────────────────────────────────────────
async function handleXRExplain(req: VercelRequest, res: VercelResponse, ai: GoogleGenAI) {
    try {
        const { topicName, factSheet, grade, language, style, question, easier, previousExplanation } = req.body;

        if (!topicName || !factSheet || !grade) {
            return res.status(400).json({ error: 'topicName, factSheet, grade required' });
        }

        const langRule = language === 'english'
            ? 'Write entirely in simple English.'
            : language === 'tanglish'
            ? 'Write in Tanglish: friendly spoken-style Tamil written in Tamil script, naturally mixing common English technical words in Latin script (e.g. "planets எல்லாம் சூரியனை orbit பண்ணுது").'
            : 'Write entirely in simple, friendly, natural Tamil (தமிழ்).';

        const styleRule = style === 'story'
            ? 'Explain as a short vivid story the student can picture in their mind.'
            : style === 'exam'
            ? 'Explain in a clear exam-oriented way: the key points a student must remember, in short flowing sentences.'
            : 'Explain in the simplest possible way, with one everyday example.';

        let task: string;
        if (question) {
            task = `The student is looking at a 3D model of "${topicName}" and asks: "${question}". Answer their question directly and warmly.`;
        } else if (easier) {
            task = `The student tapped "make it easier" — they did NOT understand this previous explanation:
"${previousExplanation ?? ''}"
Re-explain the SAME idea much more simply: shorter sentences, smaller words, and one comparison from daily life that a Grade ${grade} student in Tamil Nadu would instantly recognise (e.g. kitchen, cricket, bus, school).`;
        } else {
            task = `Give a warm opening explanation of "${topicName}" while the student explores its 3D model on screen.`;
        }

        const prompt = `You are FeelEd, a friendly AI tutor for Tamil Nadu school students (TN Samacheer board). The student is in Grade ${grade}.

FACTS — your ONLY source of truth. Do not invent anything beyond these:
${factSheet}

TASK: ${task}

RULES:
1. ${langRule}
2. ${styleRule}
3. Length: 60-120 words. Plain text only — no markdown symbols (no **, no ###, no bullets).
4. Match depth to Grade ${grade}: lower grades need simpler words; higher grades can take precise terms.
5. If the question cannot be fully answered from the FACTS, share what the facts do say and gently note the rest will come in a future lesson. Never invent.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 400, thinkingConfig: { thinkingBudget: 0 } },
        });

        if (!response.text) throw new Error('Empty response');
        res.status(200).json({ explanation: response.text.trim() });
    } catch (error) {
        console.error('XR Explain Error:', error);
        res.status(500).json({ error: 'Failed to generate XR explanation' });
    }
}


// ─────────────────────────────────────────────────────────────
// FeelEd XR — Voice narration (Gemini TTS). Returns base64 WAV.
// Session 2 · V1 Build Plan
// ─────────────────────────────────────────────────────────────
function pcmToWav(pcm: Buffer, sampleRate = 24000, channels = 1, bitDepth = 16): Buffer {
    const byteRate = sampleRate * channels * bitDepth / 8;
    const blockAlign = channels * bitDepth / 8;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + pcm.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);            // PCM
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitDepth, 34);
    header.write('data', 36);
    header.writeUInt32LE(pcm.length, 40);
    return Buffer.concat([header, pcm]);
}

async function handleXRTTS(req: VercelRequest, res: VercelResponse, ai: GoogleGenAI) {
    try {
        const { text } = req.body;
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'text required' });
        }
        // 1200 chars ≈ safe narration length; explanations are 60-120 words
        const clipped = text.slice(0, 1200);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: clipped }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
            },
        } as any);

        const b64 = (response as any)?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!b64) throw new Error('No audio in response');

        const wav = pcmToWav(Buffer.from(b64, 'base64'));
        res.status(200).json({ audio: wav.toString('base64') });
    } catch (error) {
        console.error('XR TTS Error:', error);
        res.status(500).json({ error: 'TTS failed' });
    }
}

// ─────────────────────────────────────────────────────────────
// FeelEd XR — Quiz (3 MCQ, misconception-aware feedback)
// Session 3 · V1 Build Plan
// ─────────────────────────────────────────────────────────────
function xrLangRule(language?: string): string {
    return language === 'english'
        ? 'Write entirely in simple English.'
        : language === 'tanglish'
        ? 'Write in Tanglish: friendly spoken-style Tamil written in Tamil script, naturally mixing common English technical words in Latin script.'
        : 'Write entirely in simple, friendly, natural Tamil (தமிழ்).';
}

async function handleXRQuiz(req: VercelRequest, res: VercelResponse, ai: GoogleGenAI) {
    try {
        const { topicName, factSheet, grade, language } = req.body;
        if (!topicName || !factSheet || !grade) {
            return res.status(400).json({ error: 'topicName, factSheet, grade required' });
        }

        const prompt = `You are FeelEd, a friendly AI tutor for Tamil Nadu school students (TN Samacheer board). The student is in Grade ${grade} and just explored a 3D model of "${topicName}".

FACTS — your ONLY source of truth. Every question and answer must come from these:
${factSheet}

TASK: Create exactly 3 multiple-choice questions testing understanding of the FACTS.

RULES:
1. ${xrLangRule(language)}
2. Each question has exactly 4 options and exactly ONE correct option (correctIndex 0-3). Vary correctIndex across the 3 questions.
3. Wrong options must be REAL misconceptions a Grade ${grade} student might genuinely hold — never silly filler options.
4. feedback: exactly 4 strings per question, one for each option in the same order.
   - Correct option: warm one-line praise + WHY it is right.
   - Each wrong option: gently name the misconception behind choosing it, then correct it in 1-2 short lines. Never mock the student.
5. Plain text only — no markdown symbols (no **, no ###).
6. Difficulty must match Grade ${grade}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: xrQuizSchema, thinkingConfig: { thinkingBudget: 0 } },
        });

        if (!response.text) throw new Error('Empty response');
        const data = JSON.parse(response.text.trim());
        if (!Array.isArray(data.questions) || data.questions.length < 3) throw new Error('Bad quiz shape');
        res.status(200).json({ questions: data.questions.slice(0, 3) });
    } catch (error) {
        console.error('XR Quiz Error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
}

// ─────────────────────────────────────────────────────────────
// FeelEd XR — Summary (lesson முடிவு சுருக்கம்)
// Session 3 · V1 Build Plan
// ─────────────────────────────────────────────────────────────
async function handleXRSummary(req: VercelRequest, res: VercelResponse, ai: GoogleGenAI) {
    try {
        const { topicName, factSheet, grade, language } = req.body;
        if (!topicName || !factSheet || !grade) {
            return res.status(400).json({ error: 'topicName, factSheet, grade required' });
        }

        const prompt = `You are FeelEd, a friendly AI tutor for Tamil Nadu school students (TN Samacheer board). The student is in Grade ${grade} and just finished exploring "${topicName}" with a 3D model and a quiz.

FACTS — your ONLY source of truth:
${factSheet}

TASK: Write a warm closing summary of the lesson — the 3-4 most important takeaways the student should remember, as short flowing sentences (not a list).

RULES:
1. ${xrLangRule(language)}
2. 50-90 words. Plain text only — no markdown symbols, no bullets.
3. End with one short encouraging line.
4. Match depth to Grade ${grade}. Never invent beyond the FACTS.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } },
        });

        if (!response.text) throw new Error('Empty response');
        res.status(200).json({ summary: response.text.trim() });
    } catch (error) {
        console.error('XR Summary Error:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
}