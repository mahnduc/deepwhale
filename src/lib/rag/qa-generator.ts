import { keyApi } from "@/app/dashboard/settings/api-key/_api/key.api";
import { readJsonFromOPFS } from "@/services/local-knowledge-search.service";

export interface MCQQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: "A" | "B" | "C" | "D";
  chunkId: string;
}

export interface SavedQuizData {
  knowledgeBase: string;
  createdAt: string;
  totalQuestions: number;
  questions: MCQQuestion[];
}

async function saveQuizToOPFSDirectory(
  folderName: string,
  fileName: string,
  data: SavedQuizData
): Promise<string> {
  try {
    const root = await navigator.storage.getDirectory();
    const quizDirHandle = await root.getDirectoryHandle(folderName, { create: true });
    const fileHandle = await quizDirHandle.getFileHandle(fileName, { create: true });

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();

    return `/${folderName}/${fileName}`;
  } catch (error) {
    console.error("Lỗi trong quá trình ghi file Quiz vào OPFS:", error);
    throw new Error("Không thể sao lưu bộ đề trắc nghiệm vào hệ thống lưu trữ cục bộ.");
  }
}

/**
 * @param folderName Tên bộ tri thức/thư mục chứa chunks gốc trong OPFS
 * @param requestedQuestions Số lượng câu hỏi người dùng muốn sinh (Giới hạn từ 1 - 20)
 * @returns Trả về mảng câu hỏi trắc nghiệm đã sinh và lưu trữ thành công
 */
export async function generateMCQBankFromOPFS(
  folderName: string,
  requestedQuestions: number = 10
): Promise<MCQQuestion[]> {
  const targetCount = Math.min(Math.max(requestedQuestions, 1), 20);

  const apiKey = await keyApi.getKey(1);
  if (!apiKey) {
    throw new Error("Không thể khởi tạo tiến trình: Không tìm thấy Groq API Key hợp lệ.");
  }

  let allChunksData = await readJsonFromOPFS<any>(folderName, "chunks.json");
  if (!allChunksData) throw new Error("Không thể đọc tệp chunks.json hoặc tệp trống.");

  if (typeof allChunksData === "string") {
    allChunksData = JSON.parse(allChunksData);
  }

  const chunksArray: any[] = Array.isArray(allChunksData)
    ? allChunksData
    : (allChunksData.chunks || allChunksData.data || []);

  if (chunksArray.length === 0) {
    throw new Error("Không tìm thấy dữ liệu chunk hợp lệ trong tệp chunks.json");
  }

  const validChunks = chunksArray
    .map(item => item.chunk || item)
    .filter(chunk => chunk && chunk.content && chunk.content.length > 100)
    .sort(() => 0.5 - Math.random());

  if (validChunks.length === 0) {
    throw new Error("Không có đoạn dữ liệu nào đủ điều kiện để tiến hành sinh câu hỏi.");
  }

  const mcqBank: MCQQuestion[] = [];
  let chunkIndex = 0;

  while (mcqBank.length < targetCount && chunkIndex < validChunks.length) {
    const remainingToGenerate = targetCount - mcqBank.length;
    const questionsToAskFromThisChunk = remainingToGenerate >= 2 ? 2 : 1;

    const chunk = validChunks[chunkIndex];
    chunkIndex++;

    try {
      const isLanguageLearningChunk = /\b(vocab|vocabulary|grammar|phrase|idiom|tense|pronunciation|spelling|synonym|antonym|definition|means|translate|translation|flashcard|word|phát âm|ngữ pháp|từ vựng|thành ngữ|cụm từ|dịch nghĩa|nghĩa là|có nghĩa)\b/i.test(chunk.content);

      const languageRules = `LOẠI NGỮ LIỆU: Học tiếng Anh
Ngôn ngữ: Viết CÂU HỎI và CÁC ĐÁP ÁN bằng TIẾNG VIỆT (giữ nguyên từ/cụm tiếng Anh khi cần trích dẫn).

CHỌN ĐÚNG MỘT DẠNG PHÙ HỢP
• Từ vựng    → "Từ '[word]' trong tiếng Anh nghĩa là gì?"
• Cụm từ     → "Cụm từ '[phrase]' có nghĩa là gì?"
• Ngữ pháp   → Mô tả tình huống cụ thể → "Cần dùng cấu trúc/thì nào?"
• Dịch thuật → "Câu '[EN sentence]' nghĩa là gì bằng tiếng Việt?"

TIÊU CHUẨN CHẤT LƯỢNG CÂU HỎI
Câu hỏi hoàn chỉnh: đọc xong biết ngay cần trả lời điều gì
Có duy nhất 1 đáp án đúng; 3 đáp án còn lại SAI nhưng ĐỦ gây nhầm lẫn
4 đáp án cùng từ loại, cùng cấu trúc, độ dài tương đương nhau (±30% ký tự)
Đáp án nhiễu dựa trên: đồng âm, nghĩa gần, lỗi học viên hay mắc

TUYỆT ĐỐI KHÔNG làm:
  - Câu hỏi mơ hồ kiểu "Điều nào sau đây ĐÚNG?" mà không nêu rõ chủ thể
  - Lặp nguyên xi từ khóa trọng tâm vào đáp án đúng
  - Đáp án nhiễu quá khác loại (A: động từ, B: tính từ, C: danh từ, D: trạng từ)
  - Dùng "Tất cả đáp án trên" hoặc "Không có đáp án nào"

VÍ DỤ MẪU (ĐÚNG CHUẨN)
{"question":"Từ 'eloquent' trong tiếng Anh nghĩa là gì?","options":{"A":"Nói năng lưu loát, hùng hồn","B":"Nói chuyện nhỏ nhẹ, thì thầm","C":"Trình bày ngắn gọn, súc tích","D":"Ăn nói lúng túng, vấp váp"},"answer":"A"}`;

      const generalRules = `LOẠI NGỮ LIỆU: Kiến thức chung
Ngôn ngữ: Toàn bộ câu hỏi và đáp án bằng TIẾNG VIỆT.

CÁCH SỬ DỤNG NGỮ LIỆU
Ngữ liệu CHỈ dùng để xác định CHỦ ĐỀ / KHÁI NIỆM cần hỏi.
Sau khi xác định được chủ đề, hãy hỏi về ĐỊNH NGHĨA / ĐẶC ĐIỂM PHỔ QUÁT của chủ đề đó
dựa trên kiến thức thực tế — KHÔNG hỏi về nội dung, chi tiết hay sự kiện cụ thể trong đoạn văn.

Đúng hướng: Ngữ liệu đề cập "REST API" → hỏi "REST API là gì?" hoặc "REST API hoạt động theo nguyên tắc nào?"
Sai hướng:  Ngữ liệu đề cập "REST API" → hỏi "Đoạn văn trên sử dụng REST API để làm gì?"

CÁC DẠNG CÂU HỎI ĐƯỢC PHÉP
• Định nghĩa  → "[Khái niệm X] là gì?" / "[Khái niệm X] được hiểu như thế nào?"
• Đặc điểm    → "[X] có đặc điểm nổi bật nào?" / "[X] khác [Y] ở điểm gì?"
• Nguyên lý   → "[X] hoạt động theo nguyên tắc nào?" / "Mục đích chính của [X] là gì?"
• Phân loại   → "[X] thuộc nhóm/loại nào?" / "[X] và [Y] có điểm gì chung?"

TIÊU CHUẨN CHẤT LƯỢNG CÂU HỎI
Câu hỏi TỰ THÂN ĐỦ NGHĨA: người chưa đọc ngữ liệu vẫn hiểu rõ đang hỏi về điều gì
Hỏi về 1 khái niệm CỤ THỂ có tên rõ ràng, tránh câu hỏi mơ hồ hoặc quá rộng
Đáp án đúng chính xác theo kiến thức phổ quát, không phụ thuộc ngữ liệu
4 đáp án song song về cấu trúc ngữ pháp và độ dài (±30% ký tự)
Đáp án nhiễu: sai về mặt kiến thức nhưng đủ hợp lý để gây nhầm

TUYỆT ĐỐI KHÔNG làm:
  - Nhắc đến ngữ liệu: "Theo đoạn văn...", "Dựa vào nội dung...", "Đoạn văn đề cập..."
  - Hỏi dạng: "Câu nào sau đây ĐÚNG/SAI?" mà không nêu rõ tên khái niệm cụ thể
  - Hỏi về chi tiết/số liệu/sự kiện chỉ xuất hiện trong ngữ liệu
  - Đáp án nhiễu quá dễ loại trừ hoặc vô lý
  - Dùng "Tất cả đáp án trên" hoặc "Không có đáp án đúng"

VÍ DỤ MẪU (ĐÚNG CHUẨN)
{"question":"REST API sử dụng giao thức nào để giao tiếp giữa client và server?","options":{"A":"HTTP","B":"FTP","C":"SMTP","D":"WebSocket"},"answer":"A"}

VÍ DỤ MẪU (SAI — CẦN TRÁNH)
{"question":"Trong đoạn code trên, REST API được gọi đến endpoint nào?","options":{"A":"api.groq.com","B":"api.openai.com","C":"api.anthropic.com","D":"api.google.com"},"answer":"A"}`;

      const activeRules = isLanguageLearningChunk ? languageRules : generalRules;

      const prompt = `Bạn là chuyên gia biên soạn đề thi chuyên nghiệp.
Bước 1 — Đọc NGỮ LIỆU bên dưới, xác định ${questionsToAskFromThisChunk} khái niệm/chủ đề chính được đề cập.
Bước 2 — Với mỗi khái niệm, tạo 1 câu hỏi trắc nghiệm hỏi về ĐỊNH NGHĨA hoặc ĐẶC ĐIỂM PHỔ QUÁT của khái niệm đó theo kiến thức thực tế.

${activeRules}

QUY TẮC OUTPUT
- Chỉ xuất JSON thuần túy, không markdown, không giải thích, không dấu backtick
- Schema bắt buộc: {"mcq_pairs":[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"X"}]}
- "answer" chỉ nhận một trong: "A", "B", "C", "D"

TỰ KIỂM TRA TRƯỚC KHI XUẤT
Với mỗi câu, tự hỏi và sửa nếu cần:
1. Đọc câu hỏi — tôi biết rõ cần trả lời điều gì không? → Nếu không: viết lại
2. Đáp án đúng có rõ ràng hơn 3 đáp án kia không? → Nếu không: sửa đáp án nhiễu
3. 4 đáp án có cùng cấu trúc và độ dài không? → Nếu không: cân chỉnh lại

NGỮ LIỆU
${chunk.content}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Groq Error! Status: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices[0]?.message?.content?.trim();
      if (!rawText) continue;

      const parsedOutput = JSON.parse(rawText);
      const questions = parsedOutput.mcq_pairs || parsedOutput.questions || (Array.isArray(parsedOutput) ? parsedOutput : []);

      if (Array.isArray(questions)) {
        for (const q of questions) {
          if (q.question && q.options && q.options.A && q.answer && mcqBank.length < targetCount) {
            mcqBank.push({
              question: q.question.trim(),
              options: {
                A: q.options.A.trim(),
                B: q.options.B?.trim() || "",
                C: q.options.C?.trim() || "",
                D: q.options.D?.trim() || ""
              },
              answer: q.answer.trim().toUpperCase() as "A" | "B" | "C" | "D",
              chunkId: chunk.metadata?.chunkId || "unknown_chunk"
            });
          }
        }
      }
    } catch (err) {
      console.error(`Bỏ qua lỗi xử lý tại chunk ${chunk.metadata?.chunkId || "N/A"}:`, err);
    }
  }

  if (mcqBank.length > 0) {
    const quizPayload: SavedQuizData = {
      knowledgeBase: folderName,
      createdAt: new Date().toISOString(),
      totalQuestions: mcqBank.length,
      questions: mcqBank
    };

    const fileName = `${folderName}_quiz.json`;
    const savedPath = await saveQuizToOPFSDirectory("quiz", fileName, quizPayload);
    console.log(`[OPFS Storage] Đã đồng bộ bộ đề trắc nghiệm thành công tại: ${savedPath}`);
  } else {
    throw new Error("Quá trình trích xuất hoàn tất nhưng không có câu hỏi hợp lệ nào được sinh ra.");
  }

  return mcqBank;
}

/**
 * Hàm xử lý lấy ra bộ câu hỏi trắc nghiệm đã được lưu trong OPFS
 * @param folderName Tên bộ tri thức / tên thư mục gốc của quiz
 * @returns Trả về dữ liệu toàn bộ cấu trúc Quiz đã lưu hoặc null nếu không tìm thấy
 */
export async function getSavedQuizFromOPFS(
  folderName: string
): Promise<SavedQuizData | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const quizDirHandle = await root.getDirectoryHandle("quiz");
    const fileName = `${folderName}_quiz.json`;

    const fileHandle = await quizDirHandle.getFileHandle(fileName);

    const file = await fileHandle.getFile();
    const fileContent = await file.text();

    if (!fileContent) return null;

    const quizData: SavedQuizData = JSON.parse(fileContent);
    return quizData;
  } catch (error: any) {
    if (error.name === "NotFoundError") {
      console.warn(`[OPFS Storage] Không tìm thấy bộ đề trắc nghiệm nào cho: ${folderName}`);
      return null;
    }

    console.error("Lỗi trong quá trình lấy dữ liệu Quiz từ OPFS:", error);
    throw new Error("Không thể truy xuất bộ đề trắc nghiệm từ hệ thống lưu trữ cục bộ.");
  }
}