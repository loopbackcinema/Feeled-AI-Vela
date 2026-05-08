import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';

export interface RagParams {
    query:   string;
    subject: string;
    grade:   string;
    medium:  string;
    board:   string;
}

// Returns concatenated textbook passages, or null if unavailable/no match.
// Never throws — callers fall back to general knowledge on null.
export async function fetchRagContext(params: RagParams): Promise<string | null> {
    const { API_KEY, PINECONE_API_KEY, PINECONE_INDEX, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_INDEX) return null;

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const embRes = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: params.query,
            config: { outputDimensionality: 768 },
        });
        const vector: number[] =
            (embRes as any).embedding?.values ??
            (embRes as any).embeddings?.[0]?.values ?? [];

        if (vector.length === 0) return null;

        const pc    = new Pinecone({ apiKey: PINECONE_API_KEY });
        const index = PINECONE_HOST
            ? pc.index(PINECONE_INDEX, PINECONE_HOST)
            : pc.index(PINECONE_INDEX);

        const filter: Record<string, { $eq: string }> = {};
        if (params.subject) filter.subject = { $eq: params.subject };
        if (params.grade)   filter.grade   = { $eq: params.grade };
        if (params.medium)  filter.medium  = { $eq: params.medium };
        if (params.board)   filter.board   = { $eq: params.board };

        const result = await index.query({
            vector,
            topK: 5,
            includeMetadata: true,
            ...(Object.keys(filter).length > 0 ? { filter } : {}),
        });

        const chunks = (result.matches ?? [])
            .filter(m => (m.score ?? 0) > 0.4)
            .map(m => (m.metadata?.text as string | undefined) ?? '')
            .filter(Boolean);

        return chunks.length > 0 ? chunks.join('\n\n') : null;
    } catch (err) {
        console.error('RAG fetch failed (falling back to general knowledge):', err);
        return null;
    }
}

// Maps the language field from client context to the medium stored in Pinecone.
export function languageToMedium(language: string): string {
    return language === 'Tamil' ? 'Tamil' : 'English';
}

// Normalises standard/grade values like "10", "10th", "Class 10" → "10".
export function normaliseGrade(standard: string): string {
    const digits = (standard ?? '').replace(/\D/g, '');
    return digits || standard;
}
