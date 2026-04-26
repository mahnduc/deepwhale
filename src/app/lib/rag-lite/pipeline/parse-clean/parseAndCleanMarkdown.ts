// rag-lite/pipeline/parse/parseAndCleanMarkdown.ts

import { Section } from "../../types/type";

type SectionNode = {
  id: string;
  level: number;
  title: string;
  content: string;
  children: SectionNode[];
};

export interface ParseStats {
  totalSections: number;
  originalCharCount: number;
  cleanedCharCount: number;
  hasCodeBlocks: boolean;
}

export interface ParseResult {
  sections: Section[];
  parseStats: ParseStats;
}

export function parseAndCleanMarkdown(md: string): ParseResult {
  const parseStats: ParseStats = {
    totalSections: 0,
    originalCharCount: md.length,
    cleanedCharCount: 0,
    hasCodeBlocks: /```/.test(md),
  };

  if (!md.trim()) {
    return {
      sections: [],
      parseStats
    };
  }

  const lines = md.split("\n");

  const root: SectionNode = {
    id: "root",
    level: 0,
    title: "Document Root",
    content: "",
    children: []
  };

  const stack: SectionNode[] = [root];
  let currentNode: SectionNode = root;
  let idCounter = 0;

  let inCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // fenced code block tracking
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
    }

    if (!inCodeBlock) {
      const match = line.match(/^(#{1,6})\s+(.*)/);

      if (match) {
        const level = match[1].length;
        const title = match[2].trim();

        if (!title) continue;

        const newNode: SectionNode = {
          id: `sec_${idCounter++}`,
          level,
          title,
          content: "",
          children: []
        };

        while (
          stack.length > 0 &&
          stack[stack.length - 1].level >= level
        ) {
          stack.pop();
        }

        const parent = stack[stack.length - 1] || root;

        parent.children.push(newNode);
        stack.push(newNode);

        currentNode = newNode;
        continue;
      }
    }

    currentNode.content += rawLine + "\n";
  }

  const sections = flattenAndClean(root);

  parseStats.totalSections = sections.length;
  parseStats.cleanedCharCount = sections.reduce(
    (acc, s) => acc + s.content.length,
    0
  );

  return {
    sections,
    parseStats
  };
}

function flattenAndClean(root: SectionNode): Section[] {
  const result: Section[] = [];

  function dfs(node: SectionNode) {
    if (node !== root && node.level > 0) {
      result.push({
        id: node.id,
        level: node.level,
        title: node.title,
        content: cleanTextOptimized(node.content)
      });
    }

    for (const child of node.children) {
      dfs(child);
    }
  }

  dfs(root);

  return result;
}

function cleanTextOptimized(text: string): string {
  if (!text) return "";

  let cleaned = text;

  cleaned = cleaned.replace(/```[\s\S]*?```/g, " [code block] ");

  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, "");
  cleaned = cleaned.replace(/\[(.*?)\]\(.*?\)/g, "$1");

  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  cleaned = cleaned.replace(/^[*\-\+] /gm, " ");
  cleaned = cleaned.replace(/[#*`~]/g, " ");

  cleaned = cleaned.normalize("NFC");

  cleaned = cleaned.replace(
    /[^\p{L}\p{N}\p{P}\p{S}\s]/gu,
    " "
  );

  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}