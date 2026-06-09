// lib/data-ingestion/api.ts

import { MarkdownChunker } from "./markdownChunker";
import { BM25Search } from "./BM25Search";

export interface OPFSResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function getAllKnowledgeBases(): Promise<string[]> {
  try {
    const root = await navigator.storage.getDirectory();
    const knowledgeHandle = await root.getDirectoryHandle('knowledge', { create: true });
    const folders: string[] = [];
    
    // @ts-ignore
    for await (const [name, handle] of knowledgeHandle.entries()) {
      if (handle.kind === 'directory') {
        folders.push(name);
      }
    }
    return folders;
  } catch (error) {
    console.error("Lỗi khi quét danh sách bộ tri thức:", error);
    return [];
  }
}

async function checkIfIngested(filePath: string): Promise<boolean> {
  try {
    const fileName = filePath.split('/').pop() || 'unknown.md';
    const folderName = fileName.replace(/\.[^/.]+$/, ""); 

    const root = await navigator.storage.getDirectory();
    const knowledgeHandle = await root.getDirectoryHandle('knowledge', { create: false });
    const folderHandle = await knowledgeHandle.getDirectoryHandle(folderName, { create: false });

    await folderHandle.getFileHandle(`chunks.json`, { create: false });
    await folderHandle.getFileHandle(`bm25_index.json`, { create: false });
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function runTask(filePath: string): Promise<string> {
  const chunker = new MarkdownChunker(600, 100);

  try {
    const fileName = filePath.split('/').pop() || 'unknown.md';
    const folderName = fileName.replace(/\.[^/.]+$/, "");
    const saveFileName = `chunks.json`;
    const indexFileName = `bm25_index.json`;

    const chunks = await chunker.processMarkdown(filePath);
    const chunkForSave = await chunker.exportToJSON(chunks);

    const root = await navigator.storage.getDirectory();
    const knowledgeHandle = await root.getDirectoryHandle('knowledge', { create: true });
    const folderHandle = await knowledgeHandle.getDirectoryHandle(folderName, { create: true });

    // Lưu chunks text thuần
    const chunkFileHandle = await folderHandle.getFileHandle(saveFileName, { create: true });
    const chunkWritable = await chunkFileHandle.createWritable();
    await chunkWritable.write(chunkForSave);
    await chunkWritable.close();

    // Khởi tạo và lưu BM25 index
    const searchEngine = new BM25Search(1.5, 0.75);
    searchEngine.indexChunks(chunks);
    const indexData = searchEngine.exportIndex();
    
    const indexFileHandle = await folderHandle.getFileHandle(indexFileName, { create: true });
    const indexWritable = await indexFileHandle.createWritable();
    const indexContent = typeof indexData === 'string' ? indexData : JSON.stringify(indexData);
    await indexWritable.write(indexContent);
    await indexWritable.close();

    return "ok";
  } catch (error) {
    console.error("Lỗi trong quá trình Ingestion:", error);
    throw error;
  }
}

async function readFromOPFS(folderName: string, fileName: string): Promise<any> {
  try {
    const root = await navigator.storage.getDirectory();
    const knowledgeHandle = await root.getDirectoryHandle('knowledge');
    const folderHandle = await knowledgeHandle.getDirectoryHandle(folderName);
    const fileHandle = await folderHandle.getFileHandle(fileName);
    
    const file = await fileHandle.getFile();
    const content = await file.text();
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

export async function initializeSearchFromStorage(folderName: string): Promise<BM25Search | null> {
  const indexData = await readFromOPFS(folderName, "bm25_index.json");
  if (!indexData) return null;

  const searchEngine = new BM25Search();
  searchEngine.importIndex(indexData);
  return searchEngine;
}

export async function ingestFromPath(filePath: string): Promise<OPFSResponse> {
  try {
    const lowerPath = filePath.toLowerCase();

    if (!lowerPath.endsWith('.md')) {
      return {
        success: false,
        error: `Định dạng tệp tin không hợp lệ. Chỉ hỗ trợ Markdown (.md).`
      };
    }

    const isAlreadyIngested = await checkIfIngested(filePath);
    if (isAlreadyIngested) {
      return {
        success: true,
        message: `Tài liệu đã được xử lý trước đó. Hệ thống tự động bỏ qua.`
      };
    }

    await runTask(filePath);
    
    return {
      success: true,
      message: `Tài liệu đã được xử lý BM25 Search thành công.`
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error?.message || "Lỗi xử lý dữ liệu." 
    };
  }
}