// rag-lite/pipeline/chunk/chunkBlocks.ts

import { Block, Chunk } from "../../types/type";

export function chunkBlocks(
  blocks: Block[],
  size = 300,
  overlap = 50
): Chunk[] {
  const chunks: Chunk[] = [];
  let globalId = 0;

  // đảm bảo overlap hợp lệ
  const step = Math.max(1, size - overlap);

  for (const block of blocks) {
    if (!block.content) continue;

    const words = block.content.trim().split(/\s+/);
    if (words.length === 0) continue;

    let position = 0;

    for (let i = 0; i < words.length; i += step) {
      const slice = words.slice(i, i + size);
      if (slice.length === 0) continue;

      const text = slice.join(" ");

      chunks.push({
        id: `chunk_${globalId++}`,
        blockId: block.id,
        text,

        tokens: slice.length,

        metadata: {
          title: block.title,
          level: block.level,

          sectionId: block.sectionId,
          source: block.source,

          position // thứ tự trong block
        }
      });

      position++;

      if (i + size >= words.length) break;
    }
  }

  return chunks;
}