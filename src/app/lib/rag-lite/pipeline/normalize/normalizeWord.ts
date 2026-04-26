// rag-lite/pipeline/normalize/normalizeWord.ts

const SYNONYMS: Record<string, string> = {
  tcp: "transmission control protocol",
  ip: "internet protocol",
  ai: "artificial intelligence"
};

export function normalizeWord(word: string): string {
  const w = word.toLowerCase().trim();
  return SYNONYMS[w] || w;
}