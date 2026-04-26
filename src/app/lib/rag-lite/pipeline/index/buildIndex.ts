// rag-lite/pipeline/index/buildIndex.ts

import { Chunk, Index } from "../../types/type";
import { normalizeWord } from "../normalize/normalizeWord";

const STOPWORDS = new Set([
  "the","is","a","an","and","or","to","of","in","on","for","with",
  "là","của","và","trong","cho","với","có","một"
]);

export function buildIndex(chunks: Chunk[]): Index {
  const index: Index = {};

  for (const chunk of chunks) {
    const uniqueWords = new Set(
      chunk.text
        .split(/\s+/)
        .map(normalizeWord)
        .filter(w => w.length > 2 && !STOPWORDS.has(w))
    );

    for (const word of uniqueWords) {
      if (!index[word]) index[word] = [];
      index[word].push(chunk.id);
    }
  }

  return index;
}