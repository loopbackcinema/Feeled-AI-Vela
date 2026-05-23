import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { fetchRagContext, fetchExamFrequency, normaliseGrade, effectiveMedium } from './_rag.js';

function parseSuggestions(text: string): { reply: string; suggestions: string[] } {
    const match = text.match(/\nFOLLOWUP:([^\n]+)/);
    if (!match) return { reply: text.trim(), suggestions: [] };
    const suggestions = match[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, 3);
    const reply = text.replace(/\nFOLLOWUP:[^\n]+/, '').trim();
    return { reply, suggestions };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const {
            message,
            history = [],
            context,
            imageBase64,
            imageMimeType,
            studentContext = '', // pre-formatted string from getPersonalizedContext()
        } = req.body;

        const lang    = context?.language || 'English';
        const medium  = effectiveMedium(lang === 'Tamil' ? 'Tamil' : 'English');
        const grade   = normaliseGrade((context?.grade ?? context?.standard ?? '10').toString());
        const subject = context?.subject || 'General';
        const board   = context?.board   || 'TN Samacheer';

        // Run textbook RAG + exam frequency in parallel — no added latency
        const [ragResult, examFreq] = await Promise.all([
            fetchRagContext({ query: message, subject, grade, medium, board }),
            fetchExamFrequency({ query: message, subject, grade }),
        ]);

        const { context: ragContext, chunksFound, citations, scores } = ragResult;

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[chat-session] grade="${grade}" subject="${subject}" RAG=${chunksFound} examYears=[${examFreq.years.join(',')}] scores=[${scores.join(',')}]`);
        }

        // ── Textbook RAG ──────────────────────────────────────────────────────
        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${subject}):\n${ragContext}\n\nUse the above textbook content as your PRIMARY source when answering.`
            : 'No textbook excerpt — answer from general academic knowledge.';

        // ── Exam frequency note ───────────────────────────────────────────────
        const examNote = examFreq.years.length > 0
            ? `EXAM INTELLIGENCE: This topic appeared in TN Board papers for: ${examFreq.years.join(', ')}. Mention this naturally in the Exam Tip section. Tamil: "இந்த கேள்வி ${examFreq.years.join(', ')} தேர்வில் கேட்கப்பட்டது."`
            : '';

        // ── Mentor personality ────────────────────────────────────────────────
        const mentorPersonality = `You are FeelEd AI — a warm, knowledgeable educational mentor for Indian students following TN Samacheer curriculum (Grade ${grade}, ${subject}).

MENTOR PERSONALITY:
- Address the student by first name occasionally (naturally, not every message)
- Give SPECIFIC encouragement based on their actual progress only
  GOOD: "You've been exploring ${subject} concepts consistently"
  NEVER: "You are amazing!" or generic over-praise
- Mention exam relevance naturally when the topic appeared in past TN Board papers
- Connect learning to future goals when relevant (NEET / JEE / Board exams)
- End concept responses with 2-3 follow-up options when helpful
- Tone: educational, warm, practical — NOT therapist-like, NOT a hype machine
- NEVER: overpraise, emotionally manipulate, act like a counsellor

${studentContext ? studentContext : ''}`;

        // ── Full system instruction ───────────────────────────────────────────
        const systemInstruction = `${mentorPersonality}

${ragSection}

${examNote}

Response Language: ${lang} — ALL text in your response MUST be written in ${lang}.
For concept/academic questions, structure your response EXACTLY like this:

**📖 Simple Meaning**
[1-2 sentence simple explanation]

**🔬 Key Concept**
[Main academic explanation with proper terminology]

**📐 Formula / Rule**
[Formula or key rule — skip this section entirely if not applicable]

**🌍 Real-Life Example**
[One relatable real-world example]

**📝 Exam Tip**
[One specific tip for exam writing — include exam year info here if available]

**⚡ Quick Revision**
[3-5 bullet points of key points]

For casual or conversational questions, respond naturally without this format.
Response Language: ${lang} — ALL text MUST be in ${lang}.

After your response, on a new line add:
FOLLOWUP:question1|question2|question3
where question1, question2, question3 are 3 short follow-up questions the student might ask next, written in ${lang}.`;

        const userParts: any[] = [];
        if (imageBase64 && imageMimeType) {
            userParts.push({ inlineData: { mimeType: imageMimeType, data: imageBase64 } });
        }
        userParts.push({ text: message });

        const contents = [
            ...(history as any[]).map((msg: any) => ({
                role:  msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            })),
            { role: 'user', parts: userParts },
        ];

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullText = '';
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: { systemInstruction },
        });
        for await (const chunk of stream) {
            const t = chunk.text || '';
            if (t) { fullText += t; res.write('data: ' + JSON.stringify({ chunk: t }) + '\n\n'); }
        }
        const { reply, suggestions } = parseSuggestions(fullText);
        res.write('data: ' + JSON.stringify({
            done:        true,
            ragUsed:     chunksFound > 0,
            suggestions,
            ragCitations: citations,
            examYears:   examFreq.years,
        }) + '\n\n');
        res.end();

    } catch (error) {
        console.error('Chat Session Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
