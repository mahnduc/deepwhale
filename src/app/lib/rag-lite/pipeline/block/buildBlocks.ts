// rag-lite/pipeline/block/buildBlocks.ts

import { cleanText } from "pdf-lib";
import { Section, Block } from "../../types/type";

export function buildBlocks(sections: Section[]): Block[] {
  return sections.map((s) => ({
    id: `block_${s.id}`,
    title: s.title,
    content: cleanText(s.content),
    level: s.level
  }));
}