import type { GroqModel } from "./api-key.schema";

export async function fetchGroqModels(apiKey: string): Promise<GroqModel[]> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!data.data) {
      throw new Error("Không thể lấy danh sách model.");
    }

    return data.data;
  } catch {
    throw new Error("Lỗi kết nối đến API Groq.");
  }
}