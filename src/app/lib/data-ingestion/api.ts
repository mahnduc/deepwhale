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
    // 1. Process markdown thành các chunks
    const chunks = await chunker.processMarkdown(filePath);
    const baseFileName = filePath.split('/').pop() || 'unknown-file';

    // 2. Lưu các chunks thô vào OPFS (để hiển thị hoặc xử lý sau này)
    chunker.exportToJSON(chunks, baseFileName)

    // 3. Index chunks với BM25
    const searchEngine = new BM25Search(1.5, 0.75);
    searchEngine.indexChunks(chunks);

    // 4. Export Index BM25 và lưu vào OPFS (để tìm kiếm nhanh lần sau)
    const indexData = searchEngine.exportIndex();
    await saveToOPFS(`${baseFileName}_bm25_index.json`, indexData);

    // 5. Test tìm kiếm thử nghiệm (Optional)
    // const results = searchEngine.search("TCP protocol network", 5);
    // console.log(`Kết quả test cho ${baseFileName}:`);
    // console.log(SearchResultFormatter.formatResults(results));

    return "ok";
  } catch (error) {
    console.error("Lỗi trong runTask:", error);
    throw error;
  }
}

/**
 * Hàm hỗ trợ ghi dữ liệu vào OPFS
 */
async function saveToOPFS(fileName: string, data: any): Promise<void> {
  const root = await navigator.storage.getDirectory();
  const fileHandle = await root.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(data));
  await writable.close();
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