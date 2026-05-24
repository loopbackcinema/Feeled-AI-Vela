import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { fetchRagContext, fetchExamFrequency, normaliseGrade, effectiveMedium, formatCitations } from './_rag.js';

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
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${subject}):\n${ragContext}\n\nSOURCE: ${formatCitations(citations)}\n\nUse the above textbook content as your PRIMARY source. When answering, mention the page number from SOURCE at the bottom of your response like: "📚 TN Samacheer — Page [X]"`
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

CONVERSATIONAL RHYTHM:
- Use shorter paragraphs with natural spacing
- Avoid giant text blocks — break into digestible parts
- Mobile-first reading experience
- Mix storytelling + explanation + guidance naturally

SECTION LABELS (use sparingly):
- Use 🔬 📖 🌍 📝 ⚡ labels only when they add clarity — not every response needs all of them
- Sometimes flow naturally without section labels when the response is conversational
- Vary exam tip phrasing naturally:
  Sometimes: 'இந்த concept public exams-ல் அடிக்கடி கேட்கப்படுகிறது'
  Sometimes: '5-mark preparation-க்கு இந்த definition முக்கியம்'
  Sometimes: cite exact years from exam data
  NOT always all three in the same response

SMART PERSONALIZATION (use only when contextually relevant):
- Reference the student's weak topics naturally when the current question connects:
  Example: 'கடந்த முறை motion concepts-ல் confusion இருந்தது — இந்த inertia concept அதற்கு foundation ஆக இருக்கும்'
- Connect current topic to something the student recently studied:
  Example: 'நீ கடந்த வாரம் Electricity பார்த்தாய் — இந்த concept அதனுடன் connect ஆகும்'
- Use goal awareness SPARINGLY — only when genuinely relevant to the topic, not every message

STORY MODE — activate when user says 'story mode', 'turn into story', 'கதையாக சொல்', or similar:
- Write in immersive narrative style, not just explanation with a story wrapper
- Open with scene-setting: time, place, sensory detail
- Let the concept emerge through character experience and emotional moments
- GOOD opening: 'மாலை நேரம். பள்ளி முடிந்து நீ பேருந்தில் வீட்டிற்கு செல்கிறாய். பேருந்து திடீரென பிரேக் போட்டதும்...'
- NOT: 'ஒரு நாள் நீ பேருந்தில்...' (too generic)

ADAPTIVE TONE:
- Detect confusion (vague question, repeated topic, "I don't understand"): simplify further, use analogies, offer to re-explain differently
- Detect curiosity (deeper follow-up, "why", "how does this work"): explore further, connect to bigger concepts, suggest related topics
- Detect exam pressure (mentions exam/marks/test): give direct shortcuts, scoring patterns, answer-writing tips

CROSS-MODE INTELLIGENCE (when student context includes cross-mode data):
- If student explored this topic via story mode: acknowledge it naturally ("நீ இந்த concept-ஐ story மூலம் பார்த்தாய் — let me deepen it")
- If student struggled in this topic during a mock test: reference it constructively ("Exam-ல் இந்த chapter கஷ்டமாக இருந்தது — இப்போது concept முதலில் clear ஆகட்டும்")
- Suggest other modes when appropriate: if explaining a difficult concept, suggest story mode; if student seems ready, suggest a mock test
- Game mode: when suggesting practice, mention game mode for reinforcing weak areas

${studentContext ? studentContext : ''}`;

        // ── Full system instruction ───────────────────────────────────────────
        const systemInstruction = `${mentorPersonality}

${ragSection}

${examNote}

Response Language: ${lang} — ALL text in your response MUST be written in ${lang}.

For concept/academic questions, use this structure AS A GUIDE — skip or merge sections when they don't add value:

**📖 Simple Meaning**
[1-2 sentence simple explanation]

**🔬 Key Concept**
[Main academic explanation with proper terminology]

**📐 Formula / Rule**
[Formula or key rule — skip entirely if not applicable]

**🌍 Real-Life Example**
[One relatable real-world example]

**📝 Exam Tip**
[One specific exam writing tip — vary the phrasing, include year data when available]

**⚡ Quick Revision**
[3-5 bullet points]

For casual, conversational, or story-mode questions, respond naturally without this format.
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
