// rag-lite/pipeline/knowledge/buildKnowledge.ts

import { Chunk, Knowledge } from "../../types/type";

export function buildKnowledge(chunks: Chunk[]): Knowledge[] {
  return chunks.map((chunk) => {
    const words = chunk.text.split(/\s+/);

    // concepts: từ dài (heuristic)
    const concepts = Array.from(
      new Set(words.filter((w) => w.length > 7))
    ).slice(0, 5);

    // facts: câu dài có ý nghĩa
    const facts = chunk.text
      .split(/[.!?]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 30)
      .slice(0, 3);

    return {
      chunkId: chunk.id,
      facts,
      concepts
    };
  });
}