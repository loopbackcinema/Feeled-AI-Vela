import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { fetchRagContext, normaliseGrade, effectiveMedium } from './_rag.js';

type Action = 'prep' | 'mock' | 'explain';

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
        ),
    ]);

// ── prep ─────────────────────────────────────────────────────────────────────

const prepSchema = {
    type: Type.OBJECT,
    properties: {
        importantQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        revisionNotes:      { type: Type.ARRAY, items: { type: Type.STRING } },
        predictedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['importantQuestions', 'revisionNotes', 'predictedQuestions'],
};

async function handlePrep(req: VercelRequest, res: VercelResponse) {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const { topic, context } = req.body;
    const medium = effectiveMedium(context.language === 'Tamil' ? 'Tamil' : 'English');
    const grade  = normaliseGrade(context.standard ?? '');

    const { context: ragContext, citations } = await fetchRagContext({
        query:   topic,
        subject: context.subject,
        grade,
        medium,
        board:   context.board ?? 'TN Samacheer',
    });

    const ragSection = ragContext
        ? `TEXTBOOK REFERENCE (TN Samacheer Class ${grade} — ${context.subject}, English Medium):\n${ragContext}\n\nBase your importantQuestions, revisionNotes, and predictedQuestions DIRECTLY on the above textbook content.`
        : 'No textbook excerpt available — generate from general academic knowledge.';

    const prompt = `You are an expert academic tutor preparing a student for an exam tomorrow.
Topic: ${topic}
Context: Board: ${context.board}, Class: ${context.standard}, Subject: ${context.subject}
Response Language: ${context.language} — ALL text in your response MUST be written in ${context.language}.

${ragSection}

CRITICAL RULES:
1. DO NOT use any markdown formatting (no asterisks **, no hashes ###).
2. Keep output concise and scannable.
3. importantQuestions: 5-10 highly probable exam questions from the textbook.
4. revisionNotes: Quick bullet points for last-minute revision — key facts from the textbook.
5. predictedQuestions: 3 tricky or high-value predicted questions aligned to the syllabus.
6. Write every question and note in ${context.language} only.`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema: prepSchema },
    });

    const text = result.text ?? '';
    if (!text) throw new Error('Empty response');
    const data = JSON.parse(text.trim());
    return res.status(200).json({ ...data, ragCitations: citations });
}

// ── mock ─────────────────────────────────────────────────────────────────────

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9஀-௿]/g, '').slice(0, 80);
}

function parseOptions(text: string): { a: string; b: string; c: string; d: string } | null {
    const match = text.match(/\(a\)\s*(.*?)\s*\(b\)\s*(.*?)\s*\(c\)\s*(.*?)\s*\(d\)\s*([\s\S]*?)(?:--|$)/i);
    if (!match) return null;
    return { a: match[1].trim(), b: match[2].trim(), c: match[3].trim(), d: match[4].trim() };
}

function detectPart(text: string): { part: string; questionType: string; marks: number } {
    if (text.includes('PART I') || text.includes('Part I')) return { part: 'PART I', questionType: 'MCQ', marks: 1 };
    if (text.includes('PART II') || text.includes('Part II')) return { part: 'PART II', questionType: 'Short Answer', marks: 2 };
    if (text.includes('PART III') || text.includes('Part III')) return { part: 'PART III', questionType: 'Long Answer', marks: 5 };
    return { part: 'PART I', questionType: 'MCQ', marks: 1 };
}

async function handleMock(req: VercelRequest, res: VercelResponse) {
    const { subject, chapter, grade = '10' } = req.body || {};
    console.log('[exam-unified] handleMock called with:', { subject, chapter, grade });
    console.log('[exam-unified] API_KEY exists:', !!process.env.API_KEY);
    console.log('[exam-unified] PINECONE_KEY exists:', !!process.env.PINECONE_API_KEY);
    if (!subject || !chapter) return res.status(400).json({ error: 'subject and chapter required' });

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const pineconeKey = process.env.PINECONE_API_KEY || '';
    const pineconeIndex = process.env.PINECONE_INDEX || '';
    const pineconeHost = process.env.PINECONE_HOST || '';

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const pc = new Pinecone({ apiKey: pineconeKey });
    const index = pineconeHost ? pc.index(pineconeIndex, pineconeHost) : pc.index(pineconeIndex);

    const queryText = `${subject} ${chapter} exam question TN Board grade ${grade}`;
    const embedRes = await withTimeout(
        ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: queryText,
            config: { outputDimensionality: 768 },
        }),
        8000
    );
    const vector = (embedRes as any).embedding?.values ?? (embedRes as any).embeddings?.[0]?.values ?? [];

    const queryRes = await withTimeout(
        index.query({
            vector,
            topK: 50,
            includeMetadata: true,
            filter: { docType: { $eq: 'question-paper' }, grade: { $eq: grade } },
        }),
        8000
    );

    let matches = queryRes.matches || [];

    let fallbackUsed = false;

    const chapterLower = chapter.toLowerCase().trim();
    let chapterMatches = matches.filter(m => {
        const metaChapter = ((m.metadata?.chapter as string) || '').toLowerCase().trim();
        const metaText = ((m.metadata?.text as string) || '').toLowerCase();

        // Exact chapter metadata match (from tag-and-reingest)
        if (metaChapter && (
            metaChapter === chapterLower ||
            metaChapter.includes(chapterLower) ||
            chapterLower.includes(metaChapter)
        )) return true;

        // Fallback: text contains chapter keyword
        if (metaText.includes(chapterLower)) return true;

        return false;
    });

    // Subject filter
    const subjectLower = subject.toLowerCase();
    chapterMatches = chapterMatches.filter(m =>
        ((m.metadata?.subject as string) || '').toLowerCase().includes(subjectLower) ||
        subjectLower.includes(((m.metadata?.subject as string) || '').toLowerCase())
    );

    // Fallback if < 5 matches
    if (chapterMatches.length < 5) {
        fallbackUsed = true;
        chapterMatches = matches.filter(m =>
            ((m.metadata?.subject as string) || '').toLowerCase().includes(subjectLower)
        );
    }

    const seen = new Set<string>();
    const unique = chapterMatches.filter(m => {
        const key = normalizeText((m.metadata?.text as string) || '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    console.log('[exam-mock] chapterMatches:', chapterMatches.length);
    console.log('[exam-mock] MCQ available:', chapterMatches.filter(m => (m.metadata?.questionType as string) === 'MCQ' || (m.metadata?.part as string) === 'PART I').length);

    interface QuestionItem {
        id: string;
        questionNumber: number;
        part: string;
        questionType: string;
        marks: number;
        question: string;
        options?: { a: string; b: string; c: string; d: string };
        correctAnswer?: string;
        sourceYear: string;
        subject: string;
        chapter: string;
        fallbackUsed: boolean;
    }

    const questions: QuestionItem[] = [];
    let qNum = 1;

    for (const m of unique) {
        if (questions.length >= 30) break;
        const text = (m.metadata?.text as string) || '';
        const partMeta = m.metadata?.part as string || '';
        const marksMeta = m.metadata?.marks as number || 1;
        const typeMeta = m.metadata?.questionType as string || '';

        const partInfo = partMeta
            ? { part: partMeta, questionType: typeMeta || 'MCQ', marks: marksMeta }
            : detectPart(text);

        const lines = text.split('\n').filter(Boolean);
        const questionText = lines.filter(l =>
            !l.startsWith('Question ') && !l.includes('mark(s)') && l.trim().length > 5
        ).join(' ').slice(0, 500);

        if (questionText.length < 10) continue;

        const options = parseOptions(text);

        questions.push({
            id: m.id,
            questionNumber: qNum++,
            part: partInfo.part,
            questionType: options ? 'MCQ' : partInfo.questionType,
            marks: options ? 1 : partInfo.marks,
            question: questionText,
            ...(options ? { options } : {}),
            sourceYear: (m.metadata?.year as string) || '',
            subject: (m.metadata?.subject as string) || subject,
            chapter,
            fallbackUsed,
        });
    }

    // Get all available questions by type
    const allMCQ   = questions.filter(q => q.questionType === 'MCQ');
    const allShort = questions.filter(q => q.questionType === 'Short Answer');
    const allLong  = questions.filter(q => q.questionType === 'Long Answer');

    console.log('[exam-mock] Parsed - MCQ:', allMCQ.length, 'Short:', allShort.length, 'Long:', allLong.length);

    // Select target amounts
    let selected: QuestionItem[] = [];

    // Add up to 7 MCQ
    selected.push(...allMCQ.slice(0, 7));

    // Fill MCQ gap with Short if needed
    const mcqGap = 7 - selected.length;
    if (mcqGap > 0) {
        selected.push(...allShort.slice(0, mcqGap));
    }

    // Add 2 Short Answer (not already selected)
    const usedIds = new Set(selected.map(q => q.id));
    const remainingShort = allShort.filter(q => !usedIds.has(q.id));
    selected.push(...remainingShort.slice(0, 2));

    // Add 1 Long Answer
    const remainingLong = allLong.filter(q => !usedIds.has(q.id));
    selected.push(...remainingLong.slice(0, 1));

    // If still < 10, fill from any remaining
    const allUsedIds = new Set(selected.map(q => q.id));
    const remaining = questions.filter(q => !allUsedIds.has(q.id));
    selected.push(...remaining.slice(0, 10 - selected.length));

    // Cap at 10
    selected = selected.slice(0, 10);

    selected = selected.map((q, i) => ({ ...q, questionNumber: i + 1 }));

    // Resolve correct answers for all selected MCQ questions one at a time
    for (const q of selected) {
        if (q.questionType !== 'MCQ' || !q.options) continue;
        if (q !== selected[0]) await new Promise(r => setTimeout(r, 300));
        try {
            const answerPrompt = `You are a TN Board Grade 10 ${subject} expert teacher.

Question: ${q.question}
(a) ${q.options.a}
(b) ${q.options.b}
(c) ${q.options.c}
(d) ${q.options.d}

Based on TN Samacheer Grade 10 ${subject} syllabus, which option is correct?
Think carefully and reply with ONLY one letter: a, b, c, or d
Do not explain. Just the letter.`;
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: answerPrompt,
                config: { responseMimeType: 'text/plain' },
            });
            const raw = result.text?.trim().toLowerCase() || '';
            const letter = raw.match(/^[abcd]/)?.[0] || '';
            if (['a', 'b', 'c', 'd'].includes(letter)) {
                q.correctAnswer = letter;
            }
            // If no valid letter, leave correctAnswer undefined ("See textbook")
        } catch {
            // Leave correctAnswer undefined on failure
        }
    }

    const totalMarks = selected.reduce((sum, q) => sum + q.marks, 0);

    return res.status(200).json({ questions: selected, totalMarks, timeLimit: 900, fallbackUsed });
}

// ── explain ───────────────────────────────────────────────────────────────────

async function handleExplain(req: VercelRequest, res: VercelResponse) {
    const { question, userAnswer, correctAnswer, subject, questionType } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question required' });

    console.log('[exam-explain] Starting, apiKey exists:', !!process.env.API_KEY);

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const isOpenEnded = questionType === 'Short Answer' || questionType === 'Long Answer';

    const prompt = isOpenEnded
        ? `You are a helpful tutor for Grade 10 TN Samacheer students.

Question: ${question}
Subject: ${subject || 'General'}
Student answered: "${userAnswer || '(no answer)'}"

Provide a model answer for this question in 3-5 sentences. Then in 1-2 sentences, give encouraging feedback on the student's attempt.
Keep it clear, accurate, and easy for a 10th grade student to understand.`
        : `You are a helpful tutor for Grade 10 TN Samacheer students.

Question: ${question}
Subject: ${subject || 'General'}
Student answered: "${userAnswer || '(no answer)'}"
Correct answer: "${correctAnswer || 'See explanation'}"

Explain in 2-3 simple encouraging sentences:
1. Why the correct answer is right
2. The key concept to remember

Keep it simple, positive, and easy for a 10th grade student to understand.`;

    let explanation: string;
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'text/plain' },
        });
        explanation = result.text ?? 'Keep practicing this concept!';
    } catch (geminiErr: any) {
        console.error('[exam-explain] Gemini error:', geminiErr?.message, geminiErr?.status);
        return res.status(500).json({ error: 'Failed to generate explanation', details: geminiErr?.message });
    }

    return res.status(200).json({ explanation });
}

// ── router ────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const action: Action = req.body?.action;
    if (!action || !['prep', 'mock', 'explain'].includes(action)) {
        return res.status(400).json({ error: 'action must be one of: prep, mock, explain' });
    }

    try {
        if (action === 'prep')    return await handlePrep(req, res);
        if (action === 'mock')    return await handleMock(req, res);
        if (action === 'explain') return await handleExplain(req, res);
    } catch (err: any) {
        console.error('[exam-unified] Error:', err?.message, err?.status, JSON.stringify(err));
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
