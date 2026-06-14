export interface FileItem {
  name: string;
  cleanName: string;
}

export interface NoteMetadata {
  title: string;
  sourceContext: string;
  content: string;
  updatedAt: string;
  characterCount: number;
  tags?: string[];
  wordCount?: number;
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  type: 'file' | 'concept' | 'tag';
  level: number;
  degree?: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type ViewMode = 'edit' | 'graph';

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function extractWikiLinks(content: string): string[] {
  const regex = /\[\[(.*?)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawLink = match[1].trim();
    if (rawLink) {
      const cleanLink = rawLink.split('|')[0].trim();
      if (cleanLink) links.push(cleanLink);
    }
  }
  return [...new Set(links)];
}

export function extractTags(content: string): string[] {
  const regex = /#([a-zA-Z0-9_\-\u00C0-\u024F\u1EA0-\u1EF9/]+)/g;
  const tags: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  return [...new Set(tags)];
}