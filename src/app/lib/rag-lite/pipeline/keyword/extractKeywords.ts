// rag-lite/pipeline/keyword/extractKeywords.ts

import { Chunk } from "../../types/type";
import { normalizeWord } from "../normalize/normalizeWord";

const STOPWORDS = new Set([
  "the","is","a","an","and","or","to","of","in","on","for","with",
  "là","của","và","trong","cho","với","có","một"
]);

export function extractKeywords(chunks: Chunk[]) {
  const freq: Record<string, number> = {};

  for (const chunk of chunks) {
    const words = chunk.text.split(/\s+/);

    for (let w of words) {
      if (!w || w.length < 3) continue;

      w = normalizeWord(w);

      if (STOPWORDS.has(w)) continue;

      freq[w] = (freq[w] || 0) + 1;
    }
  }

  return freq;
}