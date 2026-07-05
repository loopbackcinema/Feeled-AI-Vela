// FeelEd XR Lab — Explanation chunking (V1.1 S4, Commit 1)
// Display-only chunking.
// Original explanation text is preserved for AI context (easier/previousExplanation)
// and TTS (lastExplanation.current) — this output is for UI rendering ONLY.

const MIN_CHUNK_CHARS = 40; // இதை விட சின்ன piece தனி chunk ஆகாது — அடுத்ததோட merge
const PARAGRAPH_BREAK = /\n{2,}/;
const SENTENCE_END = /(?<=[.!?…।])\s+/; // … — LLMs சில நேரம் Unicode ellipsis emit பண்ணும்

/** Sentence split — decimals safe: "1.5" dot-க்கு பின் space இல்லை, split ஆகாது */
function splitSentences(text: string): string[] {
  return text
    .split(SENTENCE_END)
    .map(s => s.trim())
    .filter(Boolean);
}

/** Sentences-ஐ இரண்டு இரண்டா group பண்ணு; கடைசி single-ஆ மிஞ்சினா அப்படியே */
function pairSentences(sentences: string[]): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join(' '));
  }
  return chunks;
}

/** சின்ன chunks-ஐ அடுத்ததோட merge (fragments தவிர்க்க — sub-40-char paragraphs உட்பட) */
function mergeSmall(chunks: string[]): string[] {
  const out: string[] = [];
  for (const c of chunks) {
    const chunk = c.trim();
    if (!chunk) continue;
    if (out.length > 0 && chunk.length < MIN_CHUNK_CHARS) {
      out[out.length - 1] += ' ' + chunk;
    } else {
      out.push(chunk);
    }
  }
  // முதல் chunk-ஏ சின்னதா இருந்தா அடுத்ததோட merge
  if (out.length > 1 && out[0].length < MIN_CHUNK_CHARS) {
    out[1] = out[0] + ' ' + out[1];
    out.shift();
  }
  return out;
}

/**
 * Explanation → display chunks.
 *
 * Strategy:
 * 1. Prefer author-provided paragraphs (\n\n).
 * 2. Normalize very small fragments by merging them.
 * 3. If no paragraphs exist, create sentence-pair chunks.
 *
 * Output is optimized for reading, not for preserving exact formatting.
 * - Empty/whitespace → []
 * - Split ஆகலைனா → [full text] (single chunk — UI degrade ஆகாது)
 */
export function chunkExplanation(text: string): string[] {
  const trimmed = text?.trim();
  if (!trimmed) return [];

  const paragraphs = trimmed
    .split(PARAGRAPH_BREAK)
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length > 1) return mergeSmall(paragraphs);

  const sentences = splitSentences(trimmed);
  if (sentences.length <= 2) return [trimmed]; // சின்ன explanation — chunk தேவையே இல்லை

  return mergeSmall(pairSentences(sentences));
}
