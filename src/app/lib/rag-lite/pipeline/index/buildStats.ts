// rag-lite/pipeline/index/buildStats.ts

import { Chunk, Index, Stats } from "../../types/type";

export function buildStats(chunks: Chunk[], index: Index): Stats {
  const docLengths: Record<string, number> = {};
  let totalLen = 0;

  for (const chunk of chunks) {
    const len = chunk.text.split(/\s+/).length;
    docLengths[chunk.id] = len;
    totalLen += len;
  }

  const df: Record<string, number> = {};

  for (const term in index) {
    df[term] = index[term].length;
  }

  return {
    totalDocs: chunks.length,
    avgDocLen: chunks.length ? totalLen / chunks.length : 0,
    docLengths,
    df
  };
}