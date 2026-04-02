// chat.schema.ts

export interface AgentData {
  agent_id: string;
  name: string;
  description: string;
  avatarUrl: string;
  style: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}