import { BM25Search } from "@/lib/rag/BM25Search";
import { queryExpand } from "./query-expand.service";

export interface StoredChunk {
  content: string;
  metadata: {
    chunkId: string;
    headings: string[];
    contentType: "text" | "code" | "table" | "list";
  };
  tokenCount: number;
}

export interface SearchResult {
  chunk: StoredChunk;
  score: number;
}

function cleanTextContent(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const LocalKnowledgeSearchService = {
  /**
   * Thực thi tìm kiếm bằng từ khóa BM25 từ bộ nhớ OPFS
   */
  async search(folderName: string, query: string): Promise<SearchResult[]> {
    const chunks = await readJsonFromOPFS<StoredChunk[]>(folderName, "chunks.json");
    const bm25IndexData = await readJsonFromOPFS<any>(folderName, "bm25_index.json");

    if (!chunks || !bm25IndexData) {
      throw new Error("Dữ liệu chỉ mục cục bộ chưa sẵn sàng hoặc bị thiếu cấu trúc.");
    }

    const bm25Engine = new BM25Search();
    bm25Engine.importIndex(bm25IndexData);

    const  bilingualBM25query = await queryExpand(query)
    const bm25Results = bm25Engine.BM25Search(bilingualBM25query, 5);
    
    return bm25Results
      .map((res: any) => ({
        chunk: res.chunk || chunks.find((c) => c.metadata.chunkId === res.chunkId),
        score: res.score,
      }))
      .filter((item): item is SearchResult => item.chunk !== undefined);
  },

  /**
   * Tạo chuỗi Context Markdown cực sạch để tiêm trực tiếp vào LLM Prompt
   */
  formatContextForLLM(results: SearchResult[]): string {
    if (!results || results.length === 0) {
      return "Không tìm thấy dữ liệu liên quan trực tiếp trong bộ tri thức cục bộ.";
    }

    return results
      .map((item, index) => {
        const cleanedContent = cleanTextContent(item.chunk.content);
        const headingPath = item.chunk.metadata.headings?.join(" > ") || "Tổng quan";
        
        return `### [Tài liệu tham khảo #${index + 1}]\n- **Phân loại**: \`${item.chunk.metadata.contentType}\` (Score: ${item.score.toFixed(4)})\n- **Vị trí mục**: *${headingPath}*\n\n\`\`\`markdown\n${cleanedContent}\n\`\`\``;
      })
      .join("\n\n---\n\n");
  },

  generateSystemPrompt(contextMarkdown: string): string {
    return `Bạn là một Trợ lý AI Chuyên gia Tri thức hoạt động ở chế độ Local-first.
Nhiệm vụ của bạn là tổng hợp và trả lời câu hỏi của người dùng một cách tự nhiên, chính xác dựa trên phần tài liệu tham khảo được cung cấp bên dưới.

HỆ THỐNG KIẾN THỨC THAM KHẢO CỤC BỘ (ĐÃ LÀM SẠCH):
${contextMarkdown}

QUY TẮC PHẢN HỒI NHIÊM NGẶT (BẮT BUỘC):
1. **BẢO MẬT DỮ LIỆU TRÍCH XUẤT**: TUYỆT ĐỐI KHÔNG được nhắc đến, tiết lộ hoặc hiển thị các thông tin mang tính kỹ thuật của hệ thống trích xuất trong câu trả lời. 
   - KHÔNG viết các từ như: "Dựa vào Tài liệu tham khảo #1", "Theo chunkId...", "Với điểm số Score...", "Dữ liệu trích xuất cho thấy...", v.v.
   - Hãy trả lời trực tiếp vấn đề như thể bạn tự nhiên biết thông tin đó từ tài liệu. Người dùng không cần và không được biết về cấu trúc trích xuất này.
2. **TÍNH CHÍNH XÁC**: CHỈ sử dụng thông tin từ hệ thống kiến thức tham khảo ở trên để trả lời. Không tự bịa đặt thông tin nằm ngoài tài liệu. Nếu tài liệu không chứa câu trả lời, hãy báo rõ: "Dữ liệu hiện tại trong tài liệu không đủ để trả lời câu hỏi này."
3. **ĐỊNH DẠNG**: BẮT BUỘC định dạng câu trả lời bằng MARKDOWN chuẩn (sử dụng list, bold, code block, h3, h4 nếu cần). Không viết một cục văn bản dài thô kệch.
4. **HIỂN THỊ MÃ/BẢNG**: Nếu tài liệu gốc có chứa mã nguồn hoặc cấu trúc bảng dữ liệu liên quan đến câu trả lời, hãy bọc lại trong block \`\`\` tương ứng để giao diện người dùng hiển thị trực quan.
5. **NGÔN NGỮ**: Trả lời một cách rõ ràng, mạch lạc bằng ngôn ngữ trùng với ngôn ngữ câu hỏi của người dùng.`;
  },

  /**
   * Điều phối API Groq xử lý sinh câu trả lời RAG dựa trên ngữ cảnh được trích xuất
   */
  async generateAnswer(question: string, contextChunks: SearchResult[], apiKey: string): Promise<string> {
    if (!apiKey) {
      throw new Error("Thiếu Groq API Key. Vui lòng cấu hình API Key để nhận câu trả lời tổng hợp.");
    }

    const cleanContextMarkdown = this.formatContextForLLM(contextChunks);
    console.log("[SERVICE]:local-knowledge-searh", contextChunks)
    if (contextChunks.length === 0 || !cleanContextMarkdown.trim()) {
      return "Không tìm thấy dữ liệu phù hợp trong bộ tri thức nội bộ để trả lời.";
    }

    const systemPrompt = this.generateSystemPrompt(cleanContextMarkdown);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        temperature: 0.3,
        max_tokens: 500
    })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Lỗi kết nối Groq API (Mã lỗi: ${response.status})`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Không nhận được phản hồi hợp lệ từ mô hình.";
  }
};

export async function readJsonFromOPFS<T>(folderName: string, fileName: string): Promise<T | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const knowledgeHandle = await root.getDirectoryHandle("knowledge");
    const folderHandle = await knowledgeHandle.getDirectoryHandle(folderName);
    const fileHandle = await folderHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    const content = await file.text();
    return JSON.parse(content) as T;
  } catch (error) {
    return null;
  }
}