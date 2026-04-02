/**
 * THIẾT LẬP DOMAIN GROQ API
 * Đảm bảo các hàm được export đúng để Page có thể nhận diện
 */

export interface GroqModel {
  id: string;
  object?: string;
  owned_by?: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Lấy danh sách model khả dụng từ Groq
 */
export async function fetchGroqModels(apiKey: string): Promise<GroqModel[]> {
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Groq Auth Error:", errorData);
      return [];
    }

    const data = await res.json();

    // Lọc các model phổ biến và ổn định
    // Thêm các model mới như llama-3 nếu cần
    return (data.data || []).filter((m: GroqModel) =>
      m.id.toLowerCase().includes("llama") ||
      m.id.toLowerCase().includes("mixtral") ||
      m.id.toLowerCase().includes("gemma") ||
      m.id.toLowerCase().includes("whisper")
    );
  } catch (error) {
    console.error("Network Error khi lấy models:", error);
    return [];
  }
}

/**
 * Gọi API Chat Completion với cấu trúc tin nhắn chuẩn OpenAI
 */
export async function callGroqAPI({
  apiKey,
  model,
  systemPrompt,
  messages,
  userInput
}: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
  userInput: string;
}) {
  if (!apiKey) throw new Error("Missing API Key");
  if (!model) throw new Error("Chưa chọn Model AI");

  // Xử lý logic tin nhắn để tránh gửi trùng lặp hoặc thiếu context
  const bodyMessages = [
    { role: "system", content: systemPrompt || "You are a helpful AI Assistant." },
    ...messages,
    { role: "user", content: userInput }
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: bodyMessages,
      temperature: 0.7,
      max_tokens: 4096, // Tăng giới hạn cho các câu trả lời dài
      top_p: 1,
      stream: false
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Groq API Error: ${res.status}`);
  }

  const data = await res.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error("AI không trả về kết quả.");
  }

  return data.choices[0].message.content;
}