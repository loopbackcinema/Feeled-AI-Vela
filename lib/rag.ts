// RAG utility — uses fetch only, no SDK imports, to avoid Lambda bundler issues.
// The @pinecone-database/pinecone SDK causes FUNCTION_INVOCATION_FAILED when
// bundled alongside @google/genai in Vercel serverless routes. Raw fetch avoids this.

export interface RagParams {
    query:   string;
    subject: string;
    grade:   string;
    medium:  string;
    board:   string;
}

async function embedQuery(apiKey: string, text: string): Promise<number[]> {
    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: { parts: [{ text }] },
                outputDimensionality: 768,
            }),
        }
    );
    if (!res.ok) return [];
    const data = await res.json() as any;
    return data.embedding?.values ?? [];
}

async function queryPinecone(
    host: string,
    apiKey: string,
    vector: number[],
    filter: Record<string, { $eq: string }>,
): Promise<{ score: number; metadata: Record<string, unknown> }[]> {
    const body: Record<string, unknown> = { vector, topK: 5, includeMetadata: true };
    if (Object.keys(filter).length > 0) body.filter = filter;

    const res = await fetch(`${host}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Api-Key': apiKey,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) return [];
    const data = await res.json() as any;
    return data.matches ?? [];
}

// Returns concatenated textbook passages, or null if unavailable / no match.
// Never throws — callers fall back to general knowledge on null.
export async function fetchRagContext(params: RagParams): Promise<string | null> {
    const { API_KEY, PINECONE_API_KEY, PINECONE_HOST } = process.env;
    if (!API_KEY || !PINECONE_API_KEY || !PINECONE_HOST) return null;

    try {
        const vector = await embedQuery(API_KEY, params.query);
        if (vector.length === 0) return null;

        const filter: Record<string, { $eq: string }> = {};
        if (params.subject) filter.subject = { $eq: params.subject };
        if (params.grade)   filter.grade   = { $eq: params.grade };
        if (params.medium)  filter.medium  = { $eq: params.medium };
        if (params.board)   filter.board   = { $eq: params.board };

        const matches = await queryPinecone(PINECONE_HOST, PINECONE_API_KEY, vector, filter);

        const chunks = matches
            .filter(m => (m.score ?? 0) > 0.4)
            .map(m => m.metadata?.text as string | undefined)
            .filter((t): t is string => Boolean(t));

        return chunks.length > 0 ? chunks.join('\n\n') : null;
    } catch (err) {
        console.error('RAG fetch failed (falling back to general knowledge):', err);
        return null;
    }
}

export function languageToMedium(language: string): string {
    return language === 'Tamil' ? 'Tamil' : 'English';
}

export function normaliseGrade(standard: string): string {
    const digits = (standard ?? '').replace(/\D/g, '');
    return digits || standard;
}
