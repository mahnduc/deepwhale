import { keyApi } from "@/app/dashboard/settings/api-key/_api/key.api";
import { GROQ_API_URL } from "@/utils/constant";

export class GroqGateway {
  static async request(body: object): Promise<any> {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await keyApi.getKey(2)}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "error",
      mode: "cors",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`[CORE:GATEWAY]Groq API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }
}