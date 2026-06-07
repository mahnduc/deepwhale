import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; 
import { Document } from "@langchain/core/documents";
import { opfsApi } from "../opfs/opfsApis";

interface ChunkMetadata {
  source: string;
  chunkId: string;
  position: number;
  totalChunks?: number;
  headings: string[];
  contentType: "text" | "code" | "table" | "list";
  startLine?: number;
  endLine?: number;
}

/**
 * Interface cho chunk output
 */
interface ProcessedChunk {
  content: string;
  metadata: ChunkMetadata;
  tokenCount: number;
}

/**
 * Interface cho heading info
 */
interface HeadingInfo {
  level: number;
  text: string;
  line: number;
}

/**
 * Class chính để xử lý Markdown chunking
 */
class MarkdownChunker {
  private textSplitter: RecursiveCharacterTextSplitter;
  private readonly chunkSize: number;
  private readonly chunkOverlap: number;
  private readonly minChunkSize: number;

  constructor(
    chunkSize: number = 600,
    chunkOverlap: number = 100,
    minChunkSize: number = 100
  ) {
    this.chunkSize = chunkSize;
    this.chunkOverlap = chunkOverlap;
    this.minChunkSize = minChunkSize;

    // Khởi tạo splitter với separators tôn trọng cấu trúc Markdown
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap,
      separators: [
        "\n# ",
        "\n## ",      
        "\n### ",
        "\n#### ",
        "\n##### ",
        "\n\n",       // Paragraphs
        "\n",         // Lines
        ". ",         // Sentences
        " ",          // Words
        ""            // Characters
      ],
    });
  }

  /**
   * Parse tất cả headings trong document với line numbers
   */
  private parseAllHeadings(content: string): HeadingInfo[] {
    const lines = content.split(/\r?\n/);
    const headings: HeadingInfo[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].trim(),
          line: index,
        });
      }
    });

    return headings;
  }

  /**
   * Tìm line number của chunk trong document
   */
  private findChunkLineNumber(chunkContent: string, fullDocument: string): number {
    const lines = fullDocument.split(/\r?\n/);
    const chunkFirstLine = chunkContent.split(/\r?\n/)[0].trim();

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === chunkFirstLine) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Trích xuất heading hierarchy CHÍNH XÁC cho chunk
   */
  private extractHeadings(
    chunkContent: string,
    fullDocument: string,
    allHeadings: HeadingInfo[]
  ): string[] {
    const chunkLine = this.findChunkLineNumber(chunkContent, fullDocument);

    const relevantHeadings = allHeadings.filter((h) => h.line <= chunkLine);

    if (relevantHeadings.length === 0) return [];

    // Xây dựng hierarchy từ dưới lên
    const hierarchy: string[] = [];
    const lastHeading = relevantHeadings[relevantHeadings.length - 1];

    // Tìm parent headings theo level
    let currentLevel = lastHeading.level;
    for (let i = relevantHeadings.length - 1; i >= 0; i--) {
      const heading = relevantHeadings[i];
      if (heading.level < currentLevel) {
        hierarchy.unshift(heading.text);
        currentLevel = heading.level;
      } else if (heading.level === currentLevel && i === relevantHeadings.length - 1) {
        hierarchy.push(heading.text);
      }
    }

    return hierarchy;
  }

  /**
   * Xác định loại nội dung của chunk
   */
  private detectContentType(content: string): "text" | "code" | "table" | "list" {
    const trimmed = content.trim();

    if (trimmed.includes("```") || /^\s{4,}/m.test(content)) {
      return "code";
    }

    if (
      trimmed.includes("|") &&
      /\|[\s-]+\|/.test(trimmed) &&
      trimmed.split("\n").filter((line) => line.includes("|")).length >= 2
    ) {
      return "table";
    }

    // Check list (ordered hoặc unordered)
    const listPattern = /^[\s]*[-*+]\s+.+$/m;
    const orderedListPattern = /^[\s]*\d+\.\s+.+$/m;
    if (listPattern.test(trimmed) || orderedListPattern.test(trimmed)) {
      return "list";
    }

    return "text";
  }

  /**
   * Ước lượng số token (xấp xỉ)
   */
  private estimateTokens(text: string): number {
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    const divisor = hasVietnamese ? 3 : 3.8;
    return Math.ceil(text.length / divisor);
  }

  /**
   * Gộp chunk nhỏ với chunk kế tiếp
   */
  private mergeSmallChunks(chunks: ProcessedChunk[]): ProcessedChunk[] {
    const merged: ProcessedChunk[] = [];
    let i = 0;

    while (i < chunks.length) {
      const currentChunk = chunks[i];

      if (
        currentChunk.tokenCount < this.minChunkSize &&
        i < chunks.length - 1
      ) {
        const nextChunk = chunks[i + 1];
        const mergedContent = currentChunk.content + "\n\n" + nextChunk.content;
        const mergedTokens = this.estimateTokens(mergedContent);

        merged.push({
          content: mergedContent,
          metadata: {
            ...currentChunk.metadata,
            chunkId: `${currentChunk.metadata.source}_chunk_${merged.length + 1}`,
            position: merged.length,
            contentType: this.detectContentType(mergedContent),
            endLine: nextChunk.metadata.endLine,
          },
          tokenCount: mergedTokens,
        });

        i += 2;
      } else {
        merged.push({
          ...currentChunk,
          metadata: {
            ...currentChunk.metadata,
            chunkId: `${currentChunk.metadata.source}_chunk_${merged.length + 1}`,
            position: merged.length,
          },
        });
        i++;
      }
    }

    return merged;
  }

  /**
   * Xử lý Markdown thành chunks
   */
  async processMarkdown(filePath: string): Promise<ProcessedChunk[]> {
    const content = await opfsApi.readAsText(filePath);
    const fileName = filePath.split('/').pop() || 'unknown-file';

    const allHeadings = this.parseAllHeadings(content);

    const doc = new Document({
      pageContent: content,
      metadata: { source: fileName },
    });

    const chunks = await this.textSplitter.splitDocuments([doc]);

    const processedChunks: ProcessedChunk[] = chunks.map((chunk, index) => {
      const headings = this.extractHeadings(
        chunk.pageContent,
        content,
        allHeadings
      );
      const contentType = this.detectContentType(chunk.pageContent);
      const tokenCount = this.estimateTokens(chunk.pageContent);
      const startLine = this.findChunkLineNumber(chunk.pageContent, content);
      const endLine = startLine + chunk.pageContent.split(/\r?\n/).length - 1;

      return {
        content: chunk.pageContent,
        metadata: {
          source: fileName,
          chunkId: `${fileName}_chunk_${index + 1}`,
          position: index,
          totalChunks: chunks.length,
          headings: headings,
          contentType: contentType,
          startLine: startLine,
          endLine: endLine,
        },
        tokenCount: tokenCount,
      };
    });

    const mergedChunks = this.mergeSmallChunks(processedChunks);

    mergedChunks.forEach((chunk) => {
      chunk.metadata.totalChunks = mergedChunks.length;
    });

    return mergedChunks;
  }

  /**
   * Xuất chunks ra file JSON
   */
  async exportToJSON(chunks: ProcessedChunk[]): Promise<string> {
    const output = {
      totalChunks: chunks.length,
      averageTokens: chunks.length > 0 
        ? Math.round(chunks.reduce((sum, c) => sum + c.tokenCount, 0) / chunks.length)
        : 0,
      minTokens: chunks.length > 0 ? Math.min(...chunks.map((c) => c.tokenCount)) : 0,
      maxTokens: chunks.length > 0 ? Math.max(...chunks.map((c) => c.tokenCount)) : 0,
      chunks: chunks,
      generatedAt: new Date().toISOString(),
      config: {
        chunkSize: this.chunkSize,
        chunkOverlap: this.chunkOverlap,
        minChunkSize: this.minChunkSize,
      },
    };
    return JSON.stringify(output, null, 2);
  }
}

export { MarkdownChunker };
export type { ProcessedChunk, ChunkMetadata };