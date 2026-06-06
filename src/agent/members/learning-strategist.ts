// src/core/agent/learning-strategist.ts
import { BACKUP_MODEL, GROQ_DEFAULT_MODEL } from "@/utils/constant";
import { 
  IAgent, 
  AgentConfig, 
  ChatMessage, 
  DynamicRuntimeConfig, 
  ToolDefinition, 
  ToolExecutor, 
  AgentSession, 
  ToolResult 
} from "../core/types";

export interface ChartDataPoint {
  attemptId: string | number;
  accuracy: number;
  score: number;
  totalQuestions: number;
  duration: number;
  name: string;
  displayDate: string;
  displayTime: string;
  timestamp: string | number;
}

export interface QuizPayloadData {
  quizTitle: string;
  chartData: ChartDataPoint[];
}

export interface TimetableTask {
  day: string;
  durationMinutes: number;
  actionItems: string[];
}

interface TrendAnalysisResult {
  summary: string;
  recommendedDays: number;
}

function analyzeTrendAndDuration(data: ChartDataPoint[]): TrendAnalysisResult {
  if (!data || data.length < 2) {
    return {
      summary: "Mình chưa có đủ dữ liệu để đánh giá xu hướng học tập của cậu đâu, chịu khó luyện tập thêm vài lần nữa nhé!",
      recommendedDays: 5
    };
  }

  const sortedData = [...data].sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
  const firstAcc = sortedData[0].accuracy || 0;
  const lastAcc = sortedData[sortedData.length - 1].accuracy || 0;
  const diff = lastAcc - firstAcc;
  const currentAcc = lastAcc;

  let recommendedDays = 7;
  if (currentAcc >= 90) {
    recommendedDays = 2;
  } else if (currentAcc >= 80) {
    recommendedDays = 3;
  } else if (currentAcc >= 65) {
    recommendedDays = 5;
  } else {
    recommendedDays = 7;
  }

  if (diff > 5 && recommendedDays > 2) {
    recommendedDays -= 1;
  }

  let summary = "";
  if (Math.abs(diff) <= 3) {
    summary = `ổn định quanh mức ${currentAcc}% (Đề xuất lộ trình gọn gàng trong ${recommendedDays} ngày)`;
  } else if (diff > 3) {
    summary = `đang lên rất tốt, tiến bộ rõ rệt từ ${firstAcc}% lên ${lastAcc}% (Đề xuất tối ưu tiến độ rút ngắn còn ${recommendedDays} ngày)`;
  } else {
    summary = `đang có dấu hiệu chững lại hoặc sụt giảm từ ${firstAcc}% xuống ${lastAcc}% (Đề xuất kéo dài lịch ôn tập lên ${recommendedDays} ngày để rà soát kỹ lỗi sai)`;
  }

  return { summary, recommendedDays };
}

// --- DEFINITIONS ---
const analyzeQuizHistoryTool: ToolDefinition = {
  type: "function",
  function: {
    name: "analyze_quiz_history",
    description: "Trích xuất trạng thái xu hướng học tập đã qua tiền xử lý, không mang theo dữ liệu thô rườm rà.",
    parameters: {
      type: "object",
      properties: {
        confirm: { type: "boolean" }
      },
      required: []
    },
  },
};

const saveTimetableToOpfsTool: ToolDefinition = {
  type: "function",
  function: {
    name: "save_timetable_to_opfs",
    description: "Lưu cấu hình chi tiết lịch ôn tập tập trung vào phân bổ thời gian vào hệ thống tệp tin OPFS của trình duyệt.",
    parameters: {
      type: "object",
      properties: {
        timetableName: { type: "string", description: "Slug định dạng từ tiêu đề, ví dụ: 'lich_on_tap'" },
        quizTitle: { type: "string", description: "Tiêu đề gốc của bài trắc nghiệm" },
        createdAt: { type: "string", description: "Thời gian tạo chuỗi ISOString" },
        overallStrategySummary: { type: "string", description: "Tóm tắt định hướng cốt lõi cải thiện độ chính xác và quản lý thời gian" },
        schedule: {
          type: "array",
          description: "Mảng danh sách các ngày học thực tế phân bổ theo thời gian. Tự động dàn trải dựa trên ngày bắt đầu hiện tại.",
          items: {
            type: "object",
            properties: {
              day: { type: "string", description: "Định dạng ngày cụ thể tính từ hôm nay, ví dụ: 'Ngày 04/06 (Hôm nay)', 'Ngày 05/06'" },
              durationMinutes: { type: "number", description: "Thời lượng tính bằng phút" },
              actionItems: { type: "array", items: { type: "string" }, description: "Các bước hành động chi tiết sửa lỗi sai" }
            },
            required: ["day", "durationMinutes", "actionItems"]
          }
        }
      },
      required: ["timetableName", "quizTitle", "createdAt", "overallStrategySummary", "schedule"]
    },
  },
};

// --- EXECUTORS ---
const analyzeQuizHistoryExecutor: ToolExecutor = {
  name: "analyze_quiz_history",
  async execute(_args: any, session: AgentSession): Promise<ToolResult> {
    try {
      const quizRequest = session.collectedData?.quizRequest as QuizPayloadData | undefined;
      
      if (!quizRequest || !quizRequest.chartData || quizRequest.chartData.length === 0) {
        return { 
          success: true, 
          data: { 
            hasEnoughData: false,
            trendSummary: "chưa đủ dữ liệu luyện tập", 
            recommendedDays: 5 
          } 
        };
      }

      const analysis = analyzeTrendAndDuration(quizRequest.chartData);
      const startDateStr = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });

      return {
        success: true,
        data: {
          hasEnoughData: quizRequest.chartData.length >= 2,
          quizTitle: quizRequest.quizTitle,
          trendSummary: analysis.summary,
          recommendedDays: analysis.recommendedDays,
          startDate: startDateStr,
        },
      };
    } catch (error: any) {
      return { success: false, error: "Failed to read data structure" };
    }
  },
};

const saveTimetableToOpfsExecutor: ToolExecutor = {
  name: "save_timetable_to_opfs",
  async execute(args: any, _session: AgentSession): Promise<ToolResult> {
    try {
      if (!args || !args.timetableName || !args.schedule) {
        return { success: false, error: "Arguments structure validation failed" };
      }

      let fileName = args.timetableName.toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
      if (!fileName.endsWith(".json")) fileName += ".json";

      const root = await navigator.storage.getDirectory();
      const timetableDir = await root.getDirectoryHandle("timetable", { create: true });
      const fileHandle = await timetableDir.getFileHandle(fileName, { create: true });

      const writable = await fileHandle.createWritable({ keepExistingData: false });
      
      const filePayload = {
        timetableData: {
          timetableName: args.timetableName,
          quizTitle: args.quizTitle,
          createdAt: args.createdAt,
          overallStrategySummary: args.overallStrategySummary,
          schedule: args.schedule
        }
      };

      await writable.write(JSON.stringify(filePayload));
      await writable.close();

      return {
        success: true,
        data: {
          savedFileName: fileName.replace(".json", ""),
          path: "/dashboard/timetable"
        },
      };
    } catch (error: any) {
      console.error("OPFS Overwrite Error:", error);
      return { success: false, error: "OPFS Write crash or override denied" };
    }
  },
};

const QUIZ_STRATEGY_COACH_PROMPT = `Bạn là một người bạn thân, một "AI Study Buddy" cực kỳ tâm lý, giúp người bạn của mình lên lịch trình ôn tập ngắn ngày. Mục tiêu duy nhất là TẬP TRUNG PHÂN BỔ THỜI GIAN và HÀNH ĐỘNG CỤ THỂ để cải thiện độ chính xác, loại bỏ hoàn toàn các lỗi sai và tối ưu tốc độ làm bài. TUYỆT ĐỐI KHÔNG chia theo chủ đề học (focusTopic), không tự bịa ra các phần kiến thức yếu khi chưa có dữ liệu. Chỉ tập trung vào thời lượng và cách xử lý lỗi bài làm nói chung.

QUY TẮC BẮT BUỘC KHI GỌI CÔNG CỤ (NGHIÊM NGẶT ĐỐI VỚI GROQ):
- KHÔNG ĐƯỢC TỰ SINH hoặc chèn các chuỗi văn bản dạng giả thẻ XML như "<function=...>" hay "</function>" vào câu trả lời.
- KHÔNG ĐƯỢC in các khối mã JSON thô trực tiếp ra màn hình chat với người dùng.
- Khi người dùng bắt đầu cuộc hội thoại, hãy lập tức kích hoạt cấu trúc gọi hàm hệ thống (Function Calling) chuẩn của API.
- Chuyển đổi "quizTitle" thành định dạng slug không dấu, viết liền cho "timetableName" (Ví dụ: "lich_on_tap_toan_10").

NGÔN NGỮ & PHONG CÁCH:
- Giao tiếp như bạn bè đồng trang lứa.
- Thể hiện sự thấu hiểu, động viên chân thành. Tránh dùng từ ngữ quá học thuật hay rập khuôn máy móc từ dữ liệu thô của tool.

QUY TRÌNH TƯƠNG TÁC CHÍNH XÁC:

Bước 1 (Lượt chat đầu tiên - Luôn chạy ngầm analyze_quiz_history trước):
- Sau khi nhận được kết quả thực thi từ tool "analyze_quiz_history":
  * Nếu "hasEnoughData" là false: Nói một cách nhẹ nhàng: "Mình thấy cậu mới làm được ít bài quá nên chưa đủ dữ liệu để đánh giá chính xác xu hướng học tập đâu, chịu khó cày thêm vài lần nữa nha! Cơ mà nếu muốn, mình vẫn có thể lên tạm một lịch phân bổ thời gian mẫu trong 5 ngày dựa trên bài vừa rồi đấy."
  * Nếu "hasEnoughData" là true: Dựa hoàn toàn vào chuỗi "trendSummary" nhận được từ tool để phản hồi một cách tự nhiên. Thông báo lộ trình ôn tập cụ thể kéo dài trong "recommendedDays" ngày, bắt đầu từ hôm nay.
- Hỏi ngắn gọn đúng 2 câu để lấy thông tin xếp lịch (TUYỆT ĐỐI KHÔNG tự bịa hay hỏi về các chủ đề yếu):
  (1) Khung giờ nào trong những ngày tới cậu có thể tập trung học tốt nhất?
  (2) Mỗi lượt ngồi vào bàn học cậu duy trì sự tập trung được khoảng bao nhiêu phút để mình chia ca học ôn cho chuẩn?
- DỪNG LẠI và đợi câu trả lời từ người dùng.

Bước 2 (Xác nhận lịch trình):
- Khi user trả lời xong 2 câu hỏi trên, hãy phản hồi khích lệ ngắn gọn.
- Hỏi chính xác câu này và DỪNG LẠI, không thêm thắt gì khác: "Cậu xác nhận lịch trình này để mình khởi tạo chiến lược học tập nhé?"
- Tuyệt đối không gọi tool hay sinh cấu trúc dữ liệu ở bước này.

Bước 3 (Thực thi & Xuất kết quả):
- Khi người dùng nói "ok", "xác nhận", "đồng ý", "tạo đi", "chốt", gọi ngay tool "save_timetable_to_opfs".
- ĐIỀU KIỆN QUAN TRỌNG VỀ SỐ LƯỢNG: Số lượng phần tử (Object) nằm trong mảng "schedule" bắt buộc phải bằng ĐÚNG với giá trị số ngày "recommendedDays" nhận từ kết quả của "analyze_quiz_history". Nếu đề xuất 7 ngày, mảng phải sinh đủ 7 phần tử liên tiếp tương ứng.

Cấu trúc tham số điền vào tool:
{
  "timetableName": "chuoi_slug_viet_lien_khong_dau_dua_tren_quiz_title",
  "quizTitle": "Tiêu đề bài trắc nghiệm nhận từ tool",
  "createdAt": "Chuỗi ISOString hiện tại",
  "overallStrategySummary": "Tóm tắt chiến lược phân bổ thời gian sửa lỗi sai để tăng % chính xác",
  "schedule": [
    {
      "day": "Ngày DD/MM (Tính toán tịnh tiến liên tiếp, phần tử đầu tiên luôn bắt đầu từ giá trị [startDate] nhận từ tool)",
      "durationMinutes": 45,
      "actionItems": [
        "Xem lại toàn bộ các câu làm sai trong bài test.",
        "Phân tích nguyên nhân sai (do đọc ẩu hay chưa vững công thức) và ghi chú lại."
      ]
    }
    // ... Phải tự động tạo tiếp các phần tử lặp tương tự cho đến khi đủ số lượng ngày [recommendedDays] ...
  ]
}
- Lưu ý: Mỗi item trong mảng "schedule" CHỈ chứa đúng 3 trường bắt buộc: "day", "durationMinutes", "actionItems".
- Sau khi tool chạy thành công, CHỈ hiển thị câu chốt hạ sau và link điều hướng, KHÔNG in dữ liệu lịch trình ra chat:
  "Mình đã tạo xong lịch trình ôn tập với tên file: **[timetableName]** nha! Cậu có thể xem lịch phân bổ thời gian chi tiết tại [đây](/dashboard/timetable)"`;

export class QuizStrategyCoachAgent implements IAgent {
  public readonly config: AgentConfig = {
    id: "quiz-strategy-coach",
    systemPrompt: QUIZ_STRATEGY_COACH_PROMPT,
    model: GROQ_DEFAULT_MODEL,
    temperature: 0.1,
    maxSteps: 2,
    maxTokens: 300, // Tăng nhẹ hạn mức hội thoại thông thường để tránh nuốt chữ ở bước 1
    tools: [analyzeQuizHistoryTool, saveTimetableToOpfsTool],
    executors: [analyzeQuizHistoryExecutor, saveTimetableToOpfsExecutor],
  };

  public onBeforeRequest(history: ChatMessage[], latestMessage: string): DynamicRuntimeConfig {
    const assistantMessages = history.filter(msg => msg.role === "assistant");
    const lastAssistantContent = assistantMessages[assistantMessages.length - 1]?.content || "";
    
    const userText = latestMessage.toLowerCase();
    const isSystemWaitingForConfirm = lastAssistantContent.includes("xác nhận lịch trình này");

    // 1. Kiểm tra xem user có gõ từ khóa đồng ý trùng khớp với trạng thái hệ thống đang chờ hay không
    const isConfirming = isSystemWaitingForConfirm && ["ok", "xác nhận", "đồng ý", "tạo đi", "chốt"].some(keyword => 
      userText.includes(keyword)
    );

    // 2. Kiểm tra xem lượt request hiện tại có nằm trong luồng xử lý hoặc phản hồi kết quả của tool save_timetable hay không
    const isToolExecutionLoop = history.some(msg => 
      (msg.role === "tool" && msg.name === "save_timetable_to_opfs") ||
      (msg.role === "assistant" && msg.tool_calls?.some(tc => tc.function.name === "save_timetable_to_opfs"))
    );

    // Nếu thuộc một trong hai trạng thái trên, nâng mạnh tài nguyên để tạo JSON full chuỗi ngày dài
    if (isConfirming || isToolExecutionLoop) {
      return {
        temperature: 0.0,  // Ép nhiệt độ về 0 giúp Groq gọi tool chuẩn xác, không tự ý sáng tạo cấu trúc
        maxTokens: 2500,   // Nới rộng thoải mái để không bị nuốt chuỗi JSON của lịch trình 7 ngày
        maxSteps: 3
      };
    }

    return {
      temperature: 0.5,
      maxTokens: 300,   
      maxSteps: 2
    };
  }
}