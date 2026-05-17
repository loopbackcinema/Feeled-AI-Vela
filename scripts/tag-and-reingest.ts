import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import type { PineconeRecord } from '@pinecone-database/pinecone';

function loadEnvLocal(): Record<string, string> {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const env: Record<string, string> = {};
    for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
    return env;
}

interface QuestionChunk {
    questionNumber: number;
    part: string;
    questionType: string;
    marks: number;
    text: string;
}

function parseQuestions(content: string): QuestionChunk[] {
    const chunks: QuestionChunk[] = [];

    let currentPart = 'PART I';
    let currentType = 'MCQ';
    let currentMarks = 1;

    const partMap: Record<string, { type: string; marks: number }> = {
        'PART I':   { type: 'MCQ',              marks: 1 },
        'PART II':  { type: 'Short Answer',      marks: 2 },
        'PART III': { type: 'Long Answer',       marks: 5 },
        'PART IV':  { type: 'Very Long Answer',  marks: 8 },
    };

    const lines = content.split('\n');
    let i = 0;
    let currentQuestionNum = 0;
    let currentQuestionLines: string[] = [];
    let inQuestion = false;

    const saveQuestion = () => {
        if (currentQuestionNum > 0 && currentQuestionLines.length > 0) {
            const text = currentQuestionLines.join('\n').trim();
            if (text.length > 10) {
                chunks.push({
                    questionNumber: currentQuestionNum,
                    part: currentPart,
                    questionType: currentType,
                    marks: currentMarks,
                    text,
                });
            }
        }
        currentQuestionLines = [];
    };

    while (i < lines.length) {
        const line = lines[i].trim();

        const partMatch = line.match(/^(PART\s+[I]+V?)/i);
        if (partMatch) {
            saveQuestion();
            inQuestion = false;
            currentPart = partMatch[1].toUpperCase().replace(/\s+/, ' ');
            const partInfo = partMap[currentPart];
            if (partInfo) {
                currentType = partInfo.type;
                currentMarks = partInfo.marks;
            }
            i++;
            continue;
        }

        const qMatch = line.match(/^Question\s+(\d+)$/i);
        if (qMatch) {
            saveQuestion();
            currentQuestionNum = parseInt(qMatch[1]);
            currentQuestionLines = [`Question ${currentQuestionNum} [${currentPart} | ${currentType} | ${currentMarks} mark(s)]`];
            inQuestion = true;
            i++;
            continue;
        }

        if (line.match(/^={3,}$/) || line.match(/^-{3,}$/)) {
            i++;
            continue;
        }

        if (inQuestion && line !== '') {
            currentQuestionLines.push(line);
        }

        i++;
    }

    saveQuestion();
    return chunks;
}

async function embedText(ai: GoogleGenAI, text: string, retries = 3): Promise<number[]> {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const res = await ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: text,
                config: { outputDimensionality: 768 },
            });
            return (res as any).embedding?.values ?? (res as any).embeddings?.[0]?.values ?? [];
        } catch (err: any) {
            if (attempt < retries - 1 && (err?.status === 429 || err?.code === 429)) {
                await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                continue;
            }
            throw err;
        }
    }
    return [];
}

const CHAPTER_LISTS: Record<string, string> = {
    Science: 'Laws of Motion, Optics, Thermal Physics, Electricity, Acoustics, Nuclear Physics, Plant Anatomy, Plant Physiology, Genetics, Evolution, Cell Biology, Biotechnology, Microbiology, Non-communicable Diseases, Environmental Management',
    Mathematics: 'Relations and Functions, Numbers and Sequences, Algebra, Geometry, Coordinate Geometry, Trigonometry, Mensuration, Statistics and Probability',
    'Social Science': 'French Revolution, Industrial Revolution, World War, Nationalist Movement, World After World War II, India History, India Geography, Tamil Nadu, Economics, Political Science',
};

async function tagChapter(ai: GoogleGenAI, subject: string, questionText: string): Promise<string> {
    const chapterList = CHAPTER_LISTS[subject] ?? '';
    const chapterPrompt = `You are a TN Board Grade 10 ${subject} expert.
Identify which chapter this question belongs to. Reply with ONLY the chapter name, nothing else.

Question: ${questionText.slice(0, 300)}

Common ${subject} chapters for Grade 10 TN Board:
${chapterList}`;

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chapterPrompt,
        config: { responseMimeType: 'text/plain' },
    });
    return result.text?.trim().slice(0, 60) || 'General';
}

async function tagAndReingest(opts: {
    txtPath: string;
    subject: string;
    medium?: string;
    grade?: string;
    year?: string;
    env?: Record<string, string>;
}) {
    const {
        txtPath, subject,
        medium  = 'English',
        grade   = '10',
        year    = '2024',
        env     = {},
    } = opts;

    const apiKey        = env.API_KEY         ?? process.env.API_KEY         ?? '';
    const pineconeKey   = env.PINECONE_API_KEY ?? process.env.PINECONE_API_KEY ?? '';
    const pineconeIndex = env.PINECONE_INDEX   ?? process.env.PINECONE_INDEX   ?? '';
    const pineconeHost  = env.PINECONE_HOST    ?? process.env.PINECONE_HOST    ?? '';

    const content   = fs.readFileSync(txtPath, 'utf-8');
    const questions = parseQuestions(content);

    console.log(`  Questions parsed: ${questions.length}`);

    const ai    = new GoogleGenAI({ apiKey });
    const pc    = new Pinecone({ apiKey: pineconeKey });
    const index = pineconeHost
        ? pc.index(pineconeIndex, pineconeHost)
        : pc.index(pineconeIndex);

    const baseDocId = `tn-samacheer-10-${subject}-${medium}-question-paper-${year}`
        .toLowerCase().replace(/\s+/g, '-');

    // Tag all questions with Gemini (1 second delay between calls)
    console.log('\n  Tagging chapters with Gemini...');
    const chapters: string[] = [];
    for (let i = 0; i < questions.length; i++) {
        if (i > 0) await new Promise(r => setTimeout(r, 1000));
        const chapter = await tagChapter(ai, subject, questions[i].text);
        chapters.push(chapter);
        console.log(`  Question ${i + 1}/${questions.length}: "${chapter}"`);
    }

    // Embed and upsert in batches of 3
    console.log('\n  Embedding and upserting to Pinecone...');
    const BATCH  = 3;
    let upserted = 0;

    for (let i = 0; i < questions.length; i += BATCH) {
        const batch = questions.slice(i, i + BATCH);
        const records: PineconeRecord[] = await Promise.all(
            batch.map(async (q, offset) => ({
                id: `${baseDocId}-${q.questionNumber}`,
                values: await embedText(ai, q.text),
                metadata: {
                    board:          'TN Samacheer',
                    grade,
                    subject,
                    medium,
                    year,
                    docType:        'question-paper',
                    part:           q.part,
                    questionNumber: q.questionNumber,
                    questionType:   q.questionType,
                    marks:          q.marks,
                    chapter:        chapters[i + offset],
                    text:           q.text.slice(0, 1500),
                },
            }))
        );
        await index.upsert({ records });
        upserted += records.length;
        process.stdout.write(`\r  Uploaded: ${upserted}/${questions.length}`);
        if (i + BATCH < questions.length) await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n  Done! ${upserted} questions re-ingested with chapter tags.`);
    return { upserted };
}

const __filename = fileURLToPath(import.meta.url);
if (path.resolve(process.argv[1] ?? '') === path.resolve(__filename)) {
    const [,, txtPath, subject, medium = 'English', grade = '10', year = '2024'] = process.argv;

    if (!txtPath || !subject) {
        console.error('Usage: npx tsx scripts/tag-and-reingest.ts <txtPath> <subject> [medium] [grade] [year]');
        console.error('Example: npx tsx scripts/tag-and-reingest.ts ./science-2023.txt Science English 10 2023');
        process.exit(1);
    }

    const env = loadEnvLocal();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FeelEd AI — Chapter-Tagging Re-Ingest Script');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  File    : ${path.basename(txtPath)}`);
    console.log(`  Subject : ${subject}`);
    console.log(`  Grade   : ${grade}`);
    console.log(`  Year    : ${year}`);
    console.log(`  Medium  : ${medium}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    tagAndReingest({
        txtPath: path.resolve(txtPath),
        subject, medium, grade, year, env,
    }).catch((err: any) => {
        console.error('Error:', err.message);
        process.exit(1);
    });
}
