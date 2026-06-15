import { GROQ_DEFAULT_MODEL } from "@/utils/constant";
import { IAgent, AgentSession, ChatMessage, ToolCall, ToolResult } from "./types";
import { GroqGateway } from "./gateway";
import { AgentContextManager } from "./context";

interface OrchestratorInput {
  message: string;
  agent: IAgent;
  session: AgentSession;
}

export class AgentOrchestrator {
  
  public static async run({ message, agent, session }: OrchestratorInput): Promise<string> {
    const { config } = agent;
    
    // 1. Khởi tạo trạng thái vòng lặp
    AgentContextManager.initializeState(config, session);
    session.history.push({ role: "user", content: message });

    // 2. Vòng lặp ReAct (Reasoning + Acting)
    while (!session.state.isFinished && session.state.step < session.state.maxSteps) {
      session.state.step++;

      // Cắt tỉa history an toàn
      const messages = AgentContextManager.buildMessages(config, session);

      // 3. LIFECYCLE HOOKS: Kích hoạt tính toán Dynamic Config nếu Agent đó có cài đặt
      const dynamicConfigs = agent.onBeforeRequest 
        ? agent.onBeforeRequest(session.history, message) 
        : {};

      // Tính toán thông số Runtime tối ưu
      const runtimeModel = config.model || GROQ_DEFAULT_MODEL;
      const runtimeTemperature = dynamicConfigs.temperature ?? config.temperature ?? 0.6;
      const runtimeMaxTokens = dynamicConfigs.maxTokens ?? config.maxTokens ?? 300;

      if (dynamicConfigs.maxSteps && dynamicConfigs.maxSteps > session.state.maxSteps) {
        session.state.maxSteps = dynamicConfigs.maxSteps;
      }

      // 4. Chuẩn bị Payload
      const requestBody: Record<string, any> = {
        model: runtimeModel,
        temperature: runtimeTemperature,
        max_tokens: runtimeMaxTokens,
        messages,
      };

      if (config.tools && config.tools.length > 0) {
        requestBody.tools = config.tools;
        requestBody.tool_choice = "auto";
      }

      // Gọi LLM thông qua Gateway
      const data = await GroqGateway.request(requestBody);
      const assistantMessage = data?.choices?.[0]?.message;

      if (!assistantMessage) {
        throw new Error("Không nhận được phản hồi hợp lệ từ Groq API.");
      }

      // Mapped dữ liệu tin nhắn trả về
      const newAssistantMessage: ChatMessage = {
        role: "assistant",
        content: assistantMessage.content || undefined,
      };

      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        newAssistantMessage.tool_calls = assistantMessage.tool_calls.map((tc: any) => ({
          id: tc.id,
          type: "function",
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        }));
      }

      session.history.push(newAssistantMessage);

      // Kịch bản THOÁT: Nếu không có yêu cầu gọi Tool nào từ LLM
      if (!newAssistantMessage.tool_calls || newAssistantMessage.tool_calls.length === 0) {
        session.state.isFinished = true;
        return newAssistantMessage.content || "";
      }

      // 5. Thực thi Tools song song (Parallel Tool Execution)
      const toolExecutions = newAssistantMessage.tool_calls.map((toolCall) =>
        this.executeToolCall(toolCall, agent, session)
      );

      const toolMessages = await Promise.all(toolExecutions);
      session.history.push(...toolMessages);
    }

    return "Agent stopped: max steps reached.";
  }

  private static async executeToolCall(
    toolCall: ToolCall,
    agent: IAgent,
    session: AgentSession
  ): Promise<ChatMessage> {
    const functionName = toolCall.function.name;
    const args = JSON.parse(toolCall.function.arguments || "{}");
    const executor = agent.config.executors?.find((tool) => tool.name === functionName);

    if (!executor) {
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: functionName,
        content: JSON.stringify({ success: false, error: `Tool "${functionName}" not found` }),
      };
    }

    try {
      const result: ToolResult = await executor.execute(args, session);
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: functionName,
        content: JSON.stringify(result),
      };
    } catch (error: any) {
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: functionName,
        content: JSON.stringify({ success: false, error: error?.message || "Tool execution error" }),
      };
    }
  }
}