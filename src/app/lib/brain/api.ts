// lib/data-ingestion/api.ts

import { MarkdownChunker, ProcessedChunk } from "./markdownChunker";
import { BM25Search, SearchResultFormatter } from "./search/BM25Search";

export interface OPFSResponse {
  success: boolean;
  message?: string;
  error?: string;
}

async function runTask(filePath: string): Promise<string> {
  const chunker = new MarkdownChunker(600, 100);

  try {
    // 1. Phân tách đường dẫn
    const pathParts = filePath.split('/');
    const fileName = pathParts.pop() || 'unknown.md';
    const folderName = fileName; 
    
    // Tên file lưu trữ bên trong folder đó
    const saveFileName = `chunks.json`; // Bạn có thể đặt tên ngắn gọn vì nó đã nằm trong folder riêng
    const indexFileName = `bm25_index.json`;

    console.log(`Đang xử lý file: ${fileName} vào thư mục: knowledge/${folderName}`);

    // 2. Process markdown thành chunks
    const chunks = await chunker.processMarkdown(filePath);
    const chunkForSave = await chunker.exportToJSON(chunks);

    // 3. Truy cập OPFS (Cấu trúc: knowledge > fileName > các file)
    const root = await navigator.storage.getDirectory();
    const knowledgeHandle = await root.getDirectoryHandle('knowledge', { create: true });
    
    // folderHandle lúc này sẽ có tên trùng với file gốc
    const folderHandle = await knowledgeHandle.getDirectoryHandle(folderName, { create: true });

    // --- LƯU FILE CHUNKS ---
    const chunkFileHandle = await folderHandle.getFileHandle(saveFileName, { create: true });
    const chunkWritable = await chunkFileHandle.createWritable();
    await chunkWritable.write(chunkForSave);
    await chunkWritable.close();

    // 4. Index chunks với BM25
    const searchEngine = new BM25Search(1.5, 0.75);
    searchEngine.indexChunks(chunks);

    // 5. Export Index BM25
    const indexData = searchEngine.exportIndex();
    
    // --- LƯU FILE INDEX BM25 ---
    const indexFileHandle = await folderHandle.getFileHandle(indexFileName, { create: true });
    const indexWritable = await indexFileHandle.createWritable();
    const indexContent = typeof indexData === 'string' ? indexData : JSON.stringify(indexData, null, 2);
    await indexWritable.write(indexContent);
    await indexWritable.close();

    return "ok";
  } catch (error) {
    console.error("Lỗi trong runTask:", error);
    throw error;
  }
}

/**
 * Hàm hỗ trợ đọc dữ liệu từ OPFS
 */
async function readFromOPFS(fileName: string): Promise<any> {
  try {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    const content = await file.text();
    return JSON.parse(content);
  } catch (error) {
    console.error(`Không thể đọc file ${fileName} từ OPFS:`, error);
    return null;
  }
}

/**
 * Hàm khởi tạo Search Engine từ dữ liệu đã lưu
 */
export async function initializeSearchFromStorage(baseFileName: string): Promise<BM25Search | null> {
  const indexData = await readFromOPFS(`${baseFileName}_bm25_index.json`);
  
  if (!indexData) {
    console.warn("Không tìm thấy dữ liệu index lưu trữ.");
    return null;
  }

  const searchEngine = new BM25Search();
  searchEngine.importIndex(indexData);
  
  console.log(`Đã khôi phục Search Engine cho: ${baseFileName}`);
  return searchEngine;
}

export async function ingestFromPath(filePath: string): Promise<OPFSResponse> {
  try {
    await runTask(filePath);

    return {
      success: true,
      message: `Dữ liệu và Index của "${filePath.split('/').pop()}" đã được lưu trữ vào OPFS.`
    };
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi xử lý dữ liệu."
    };
  }
}