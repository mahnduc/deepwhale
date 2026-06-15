import stopwordsIso from "stopwords-iso";
import { ProcessedChunk } from "./markdownChunker";

interface SearchResult {
  chunk: ProcessedChunk;
  score: number;
}

interface IndexedDocument {
  id: string;
  chunk: ProcessedChunk;
  tokens: string[];
  tokenFrequency: Map<string, number>;
}

class BM25Search {
  private documents: IndexedDocument[] = [];
  private idf: Map<string, number> = new Map();
  private avgDocLength: number = 0;
  private readonly k1: number;
  private readonly b: number;
  private stopWords: Set<string>;

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.stopWords = this.getStopWords();
  }

  private getStopWords(): Set<string> {
    const enStopWords = stopwordsIso.en || [];
    const viStopWords = stopwordsIso.vi || [];
    
    return new Set([...enStopWords, ...viStopWords]);
  }

  private removeAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  }

  private tokenize(text: string): string[] {
    const lowerText = text.toLowerCase();
    const combinedText = `${lowerText} ${this.removeAccents(lowerText)}`;

    return combinedText
      .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, " ") // loại bỏ dấu
      .split(/\s+/)
      .filter((token) => token.length > 1 && !this.stopWords.has(token));
  }

  private calculateTermFrequency(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    tokens.forEach((token) => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });
    return tf;
  }

  private calculateIDF(): void {
    const N = this.documents.length;
    const documentFrequency = new Map<string, number>();

    this.documents.forEach((doc) => {
      const uniqueTokens = new Set(doc.tokens);
      uniqueTokens.forEach((token) => {
        documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
      });
    });

    documentFrequency.forEach((df, term) => {
      const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
      this.idf.set(term, idf);
    });
  }

  private calculateAvgDocLength(): void {
    const totalLength = this.documents.reduce(
      (sum, doc) => sum + doc.tokens.length,
      0
    );
    this.avgDocLength = totalLength / this.documents.length || 1;
  }

  indexChunks(chunks: ProcessedChunk[]): void {
    this.documents = chunks.map((chunk) => {
      const tokens = this.tokenize(chunk.content);
      const tokenFrequency = this.calculateTermFrequency(tokens);

      return {
        id: chunk.metadata.chunkId,
        chunk: chunk,
        tokens: tokens,
        tokenFrequency: tokenFrequency,
      };
    });

    this.calculateIDF();
    this.calculateAvgDocLength();
  }

  private calculateBM25Score(
    doc: IndexedDocument,
    queryTokens: string[]
  ): number {
    let score = 0;
    const docLength = doc.tokens.length;

    queryTokens.forEach((term) => {
      const termFreq = doc.tokenFrequency.get(term) || 0;
      const idf = this.idf.get(term) || 0;

      const numerator = termFreq * (this.k1 + 1);
      const denominator =
        termFreq +
        this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength));

      score += idf * (numerator / denominator);
    });

    return score;
  }

  BM25Search(query: string, topK: number = 5): SearchResult[] {
    if (this.documents.length === 0) return [];

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const scores = this.documents.map((doc) => ({
      doc: doc,
      score: this.calculateBM25Score(doc, queryTokens),
    }));

    scores.sort((a, b) => b.score - a.score);

    const topResults = scores.slice(0, topK).filter((item) => item.score > 0);

    return topResults.map((item) => ({
      chunk: item.doc.chunk,
      score: item.score,
    }));
  }

  getStats() {
    return {
      totalDocuments: this.documents.length,
      totalUniqueTerms: this.idf.size,
      avgDocLength: this.avgDocLength,
      k1: this.k1,
      b: this.b,
    };
  }

  exportIndex() {
    return {
      documents: this.documents.map((doc) => ({
        id: doc.id,
        chunk: doc.chunk,
        tokens: doc.tokens,
        tokenFrequency: Array.from(doc.tokenFrequency.entries()),
      })),
      idf: Array.from(this.idf.entries()),
      avgDocLength: this.avgDocLength,
      stats: this.getStats(),
    };
  }

  importIndex(indexData: any): void {
    this.documents = indexData.documents.map((doc: any) => ({
      id: doc.id,
      chunk: doc.chunk,
      tokens: doc.tokens,
      tokenFrequency: new Map(doc.tokenFrequency),
    }));

    this.idf = new Map(indexData.idf);
    this.avgDocLength = indexData.avgDocLength;
  }
}

export { BM25Search };
export type { SearchResult, IndexedDocument };