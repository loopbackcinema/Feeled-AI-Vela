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
            // Student mentor context (optional — injected by ChatPage when available)
            studentName,
            studiedTopics,
            weakTopics,
            examTarget,
        } = req.body;

        const lang    = context?.language || 'English';
        const medium  = effectiveMedium(lang === 'Tamil' ? 'Tamil' : 'English');
        const grade   = normaliseGrade((context?.grade ?? context?.standard ?? '10').toString());
        const subject = context?.subject || 'General';
        const board   = context?.board   || 'TN Samacheer';

        // Run textbook RAG and exam frequency lookup in parallel
        const [ragResult, examFreq] = await Promise.all([
            fetchRagContext({ query: message, subject, grade, medium, board }),
            fetchExamFrequency({ query: message, subject, grade }),
        ]);

        const { context: ragContext, chunksFound, citations } = ragResult;
        const { scores } = ragResult;

        if (process.env.NODE_ENV !== 'production') {
            console.log(`[chat-session] grade="${grade}" subject="${subject}" medium="${medium}" RAG=${chunksFound} examYears=[${examFreq.years.join(',')}] scores=[${scores.join(',')}]`);
        }

        // ── RAG section ────────────────────────────────────────────────────────
        const ragSection = ragContext
            ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${subject}):\n${ragContext}\n\nUse the above textbook content as your PRIMARY source when answering.`
            : 'No textbook excerpt — answer from general academic knowledge.';

        // ── Exam frequency note ─────────────────────────────────────────────────
        const examNote = examFreq.years.length > 0
            ? `EXAM INTELLIGENCE: This topic has appeared in TN Board question papers from: ${examFreq.years.join(', ')}. Mention this naturally in your response when relevant — e.g. "This concept appeared in the ${examFreq.years.join(' and ')} TN Board exams."  In Tamil responses use: "இந்த கேள்வி ${examFreq.years.join(', ')} தேர்வில் கேட்கப்பட்டது."`
            : '';

        // ── Student context section ─────────────────────────────────────────────
        const studentContextParts: string[] = [];
        if (studentName)                           studentContextParts.push(`- Student name: ${studentName}`);
        if (studiedTopics?.length)                 studentContextParts.push(`- Recently studied: ${(studiedTopics as string[]).slice(-5).join(', ')}`);
        if (weakTopics?.length)                    studentContextParts.push(`- Topics needing more practice: ${(weakTopics as string[]).join(', ')}`);
        if (examTarget && examTarget !== 'null')   studentContextParts.push(`- Exam goal: ${examTarget}`);

        const studentSection = studentContextParts.length > 0
            ? `STUDENT CONTEXT (use naturally — never list this back to them):\n${studentContextParts.join('\n')}`
            : '';

        // ── System instruction ──────────────────────────────────────────────────
        const systemInstruction = `You are FeelEd AI, a warm and knowledgeable learning mentor for Tamil Nadu Samacheer students (Grade ${grade}, ${subject}).

MENTOR PERSONALITY:
- You are a calm, supportive teacher — NOT a hype machine or motivational speaker.
- Address the student by name occasionally when it feels natural (not every reply).
- Give SPECIFIC encouragement based on their actual progress:
  GOOD: "You're building solid understanding of ${subject} fundamentals"
  AVOID: "You're amazing!" or "I believe in you more than anyone!"
- Never use therapy-style language or fake emotional bonding.
- Connect learning to their exam goal when it adds genuine value.
- Be knowledgeable and direct — students trust depth, not cheerleading.

${studentSection}

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
[One specific tip for exam writing — include exam frequency info here if examNote is present]

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
                role: msg.role === 'user' ? 'user' : 'model',
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
            done: true,
            ragUsed: chunksFound > 0,
            suggestions,
            ragCitations: citations,
            examYears: examFreq.years,
        }) + '\n\n');
        res.end();

    } catch (error) {
        console.error('Chat Session Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
}
