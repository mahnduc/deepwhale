export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  role: ChatRole;
  content?: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ToolExecutor {
  name: string;
  execute: (args: any, session: AgentSession) => Promise<ToolResult>;
}

export interface AgentState {
  step: number;
  maxSteps: number;
  isFinished: boolean;
}

export interface AgentSession<TData = any> {
  history: ChatMessage[];
  collectedData: TData;
  state: AgentState;
}

// Cấu hình Runtime dynamic trả về từ Hook
export interface DynamicRuntimeConfig {
  temperature?: number;
  maxTokens?: number;
  maxSteps?: number;
}

export interface IAgent {
  readonly config: AgentConfig;
  
  /**
   * Lifecycle Hook: Cho phép từng Agent tự định nghĩa cách tính thông số dynamic
   * dựa trên lịch sử chat riêng của nó mà không can thiệp vào Core Orchestrator.
   */
  onBeforeRequest?(history: ChatMessage[], latestMessage: string): DynamicRuntimeConfig;
}

export interface AgentConfig {
  id: string;
  systemPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  maxSteps?: number;
  tools?: ToolDefinition[];
  executors?: ToolExecutor[];
}