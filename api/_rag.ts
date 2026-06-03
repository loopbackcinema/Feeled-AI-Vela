// Shared RAG utility — imported by concept, exam, practice, chat-session.
// All routes use this single source of truth for embedding + Pinecone queries.

export interface RagParams {
    query:   string;
    subject: string;
    grade:   string;
    medium:  string;    // always pass effectiveMedium (Tamil → 'English')
    board:   string;
}

export interface RagCitation {
    subject:   string;
    chapter:   string;   // e.g. "Chapter 3 - Cell Biology"
    chapterNum: number;  // 0 when unknown
    page:      number;
    chunkType: string;   // "definition" | "example" | "formula" | "exercise" | "summary" | "text"
    score:     number;
}

export interface RagResult {
    context:     string | null;
    chunksFound: number;
    citations:   RagCitation[];
    scores:      number[];
}

const SCORE_THRESHOLD = 0.35;  // raised from 0.4 — reduces noise matches
const TOP_K = 4;               // fetch 4, keep up to 3 after threshold

function normalizeBoard(board: string): string {
    return board.includes('Samacheer') ? 'TN Samacheer' : board;
}

// Extract chapter number from a natural-language query, e.g. "chapter 3 photosynthesis" → 3
function extractChapterNum(query: string): number | null {
    const m = query.match(/chapter\s+(\d+)/i);
    return m ? parseInt(m[1], 10) : null;
}

export async function fetchRagContext(params: RagParams): Promise<RagResult> {
    const { API_KEY, PINECONE_API_KEY, PINECONE_HOST } = process.env;
    console.log(`[rag] API_KEY=${!!API_KEY} PINECONE_API_KEY=${!!PINECONE_API_KEY} PINECONE_HOST=${PINECONE_HOST}`);
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_HOST) {
        return { context: null, chunksFound: 0, citations: [], scores: [] };
    }

    try {
        // 1 ── embed the query
        const embRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: { parts: [{ text: params.query }] },
                    outputDimensionality: 768,
                }),
            }
        );
        const embStatus = embRes.status; console.log(`[rag] embed status=${embStatus}`); if (!embRes.ok) return { context: null, chunksFound: 0, citations: [], scores: [] };
        const embData = await embRes.json() as any;
        const vector: number[] = embData.embedding?.values ?? [];
        if (vector.length === 0) return { context: null, chunksFound: 0, citations: [], scores: [] };

        // 2 ── build filter (chapter filter applied when query names a chapter)
        const filter: Record<string, any> = {
            subject: { $eq: params.subject },
            grade:   { $eq: params.grade },
            medium:  { $eq: params.medium },
            board:   { $eq: normalizeBoard(params.board) },
        };
        const chapterNum = extractChapterNum(params.query);
        if (chapterNum !== null) filter.chapterNum = { $eq: chapterNum };

        // 3 ── query Pinecone
        const pinRes = await fetch(`${PINECONE_HOST}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_API_KEY },
            body: JSON.stringify({ vector, topK: TOP_K, includeMetadata: true, filter }),
        });
        if (!pinRes.ok) return { context: null, chunksFound: 0, citations: [], scores: [] };
        const pinData = await pinRes.json() as any;

        // 4 ── filter by threshold, cap at 3 high-quality chunks
        const goodMatches = (pinData.matches ?? [])
            .filter((m: any) => (m.score ?? 0) >= SCORE_THRESHOLD)
            .slice(0, 3);

        const chunks: string[]      = goodMatches.map((m: any) => m.metadata?.text as string).filter(Boolean);
        const citations: RagCitation[] = goodMatches.map((m: any) => ({
            subject:    (m.metadata?.subject    as string) || params.subject,
            chapter:    (m.metadata?.chapter    as string) || '',
            chapterNum: (m.metadata?.chapterNum as number) || 0,
            page:       (m.metadata?.page       as number) || 0,
            chunkType:  (m.metadata?.chunkType  as string) || 'text',
            score:      +(m.score ?? 0).toFixed(3),
        }));
        const scores = citations.map(c => c.score);

        return {
            context:     chunks.length > 0 ? chunks.join('\n\n') : null,
            chunksFound: chunks.length,
            citations,
            scores,
        };
    } catch (err) {
        console.error('[RAG] fetch failed (falling back to general knowledge):', err);
        return { context: null, chunksFound: 0, citations: [], scores: [] };
    }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function languageToMedium(language: string): string {
    return language === 'Tamil' ? 'Tamil' : 'English';
}

export function normaliseGrade(standard: string): string {
    const digits = (standard ?? '').replace(/\D/g, '');
    return digits || standard;
}

// Tamil-medium PDFs have no extractable text (font encoding issue).
// Always query English-medium vectors; the curriculum content is identical.
export function effectiveMedium(medium: string): string {
    return medium === 'Tamil' ? 'English' : medium;
}

// Format citation list into a compact human-readable source string, e.g.:
// "TN Samacheer · Chapter 3 · Page 47 · definition"
export function formatCitations(citations: RagCitation[]): string {
    if (!citations.length) return '';
    const best = citations[0];
    const parts: string[] = ['TN Samacheer'];
    if (best.chapter) parts.push(best.chapter);
    if (best.page > 0) parts.push(`Page ${best.page}`);
    if (best.chunkType && best.chunkType !== 'text') parts.push(best.chunkType);
    return parts.join(' · ');
}

// ── Exam frequency ──────────────────────────────────────────────────────────────
// Queries Pinecone exam-paper docs to find which years a topic appeared.

export interface ExamFrequency {
    years: string[];   // sorted, e.g. ['2021', '2023', '2024']
    count: number;     // total matching exam paper chunks
}

export async function fetchExamFrequency(params: {
    query:   string;
    subject: string;
    grade:   string;
}): Promise<ExamFrequency> {
    const { API_KEY, PINECONE_API_KEY, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_HOST) return { years: [], count: 0 };

    try {
        const embRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: { parts: [{ text: params.query }] },
                    outputDimensionality: 768,
                }),
            }
        );
        if (!embRes.ok) return { years: [], count: 0 };
        const embData = await embRes.json() as any;
        const vector: number[] = embData.embedding?.values ?? [];
        if (!vector.length) return { years: [], count: 0 };

        const pinRes = await fetch(`${PINECONE_HOST}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Api-Key': PINECONE_API_KEY },
            body: JSON.stringify({
                vector,
                topK: 10,
                includeMetadata: true,
                filter: {
                    docType: { $eq: 'question-paper' },
                    grade:   { $eq: params.grade },
                },
            }),
        });
        if (!pinRes.ok) return { years: [], count: 0 };
        const pinData = await pinRes.json() as any;

        const EXAM_SCORE_THRESHOLD = 0.5;
        const good = ((pinData.matches ?? []) as any[]).filter((m: any) => (m.score ?? 0) >= EXAM_SCORE_THRESHOLD);

        const yearSet = new Set<string>();
        for (const m of good) {
            const y = m.metadata?.year as string;
            if (y) yearSet.add(String(y));
        }
        const years = Array.from(yearSet).sort();
        return { years, count: good.length };
    } catch {
        return { years: [], count: 0 };
    }
}
// DEBUG ONLY - remove later
