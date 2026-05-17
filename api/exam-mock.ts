import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
        ),
    ]);

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9\u0B80-\u0BFF]/g, '').slice(0, 80);
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { subject, chapter, grade = '10' } = req.body || {};
    if (!subject || !chapter) return res.status(400).json({ error: 'subject and chapter required' });

    const apiKey = process.env.API_KEY || '';
    const pineconeKey = process.env.PINECONE_API_KEY || '';
    const pineconeIndex = process.env.PINECONE_INDEX || '';
    const pineconeHost = process.env.PINECONE_HOST || '';

    try {
        const ai = new GoogleGenAI({ apiKey });
        const pc = new Pinecone({ apiKey: pineconeKey });
        const index = pineconeHost ? pc.index(pineconeIndex, pineconeHost) : pc.index(pineconeIndex);

        // Embed query
        const queryText = `${chapter} ${subject} TN Samacheer exam questions grade ${grade}`;
        const embedRes = await withTimeout(
            ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: queryText,
                config: { outputDimensionality: 768 },
            }),
            8000
        );
        const vector = (embedRes as any).embedding?.values ?? (embedRes as any).embeddings?.[0]?.values ?? [];

        // Query Pinecone with chapter-specific filter
        let queryRes = await withTimeout(
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

        // Filter by chapter keyword in text
        const chapterLower = chapter.toLowerCase();
        let chapterMatches = matches.filter(m =>
            (m.metadata?.text as string || '').toLowerCase().includes(chapterLower)
        );

        // Fallback: if < 10 chapter matches, use all subject matches
        if (chapterMatches.length < 10) {
            fallbackUsed = true;
            chapterMatches = matches;
        }

        // Deduplicate by normalized text
        const seen = new Set<string>();
        const unique = chapterMatches.filter(m => {
            const key = normalizeText((m.metadata?.text as string) || '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Build question objects
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

            // Extract question text (remove header line)
            const lines = text.split('\n').filter(Boolean);
            const questionText = lines.filter(l =>
                !l.startsWith('Question ') && !l.includes('mark(s)') && l.trim().length > 5
            ).join(' ').slice(0, 500);

            if (questionText.length < 10) continue;

            // Parse options via regex
            let options = parseOptions(text);

            questions.push({
                id: m.id,
                questionNumber: qNum++,
                part: partInfo.part,
                questionType: options ? 'MCQ' : partInfo.questionType,
                marks: options ? 1 : partInfo.marks,
                question: questionText,
                ...(options ? { options, correctAnswer: '' } : {}),
                sourceYear: (m.metadata?.year as string) || '',
                subject: (m.metadata?.subject as string) || subject,
                chapter,
                fallbackUsed,
            });
        }

        // Select: 7 MCQ + 2 Short + 1 Long
        const mcq = questions.filter(q => q.questionType === 'MCQ').slice(0, 7);
        const short = questions.filter(q => q.questionType === 'Short Answer').slice(0, 2);
        const long = questions.filter(q => q.questionType === 'Long Answer').slice(0, 1);

        // Fill gaps from remaining pool
        let selected = [...mcq, ...short, ...long];
        if (selected.length < 10) {
            const usedIds = new Set(selected.map(q => q.id));
            const remaining = questions.filter(q => !usedIds.has(q.id));
            selected = [...selected, ...remaining.slice(0, 10 - selected.length)];
        }

        // Renumber
        selected = selected.map((q, i) => ({ ...q, questionNumber: i + 1 }));

        const totalMarks = selected.reduce((sum, q) => sum + q.marks, 0);

        return res.status(200).json({
            questions: selected,
            totalMarks,
            timeLimit: 900,
            fallbackUsed,
        });

    } catch (err: any) {
        console.error('exam-mock error:', err);
        return res.status(500).json({ error: err.message || 'Internal server error' });
    }
}
