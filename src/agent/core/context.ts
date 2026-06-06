import { AgentConfig, AgentSession, ChatMessage } from "./types";

const MAX_HISTORY = 20;

export class AgentContextManager {
  static initializeState(config: AgentConfig, session: AgentSession): void {
    if (!session.state) {
      session.state = {
        step: 0,
        maxSteps: config.maxSteps || 10,
        isFinished: false,
      };
    }
  }

  static buildMessages(config: AgentConfig, session: AgentSession): ChatMessage[] {
    const history = session.history || [];

    if (history.length <= MAX_HISTORY) {
      return [{ role: "system", content: config.systemPrompt }, ...history];
    }

    let startIndex = history.length - MAX_HISTORY;

    // Thuật toán quét ngược bảo toàn chuỗi Tool Call (Giữ nguyên logic thông minh của bạn)
    while (startIndex > 0) {
      const currentMsg = history[startIndex];
      const prevMsg = history[startIndex - 1];

      if (currentMsg.role === "tool") {
        startIndex--;
        continue;
      }

      if (
        prevMsg &&
        prevMsg.role === "assistant" &&
        prevMsg.tool_calls &&
        prevMsg.tool_calls.length > 0
      ) {
        startIndex--;
        continue;
      }

      break;
    }

    return [
      { role: "system", content: config.systemPrompt },
      ...history.slice(startIndex),
    ];
  }
}