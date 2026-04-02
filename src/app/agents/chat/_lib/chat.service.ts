// chat.service.ts
import type { AgentData } from "./chat.schema";

export async function getAgentFromOPFS(
  agentId: string
): Promise<AgentData | null> {
  try {
    const root = await navigator.storage.getDirectory();
    const agentsDir = await root.getDirectoryHandle("system-agents", { create: false });
    const membersDir = await agentsDir.getDirectoryHandle("members", { create: false });
    const fileHandle = await membersDir.getFileHandle("agent_members.json", { create: false });

    const file = await fileHandle.getFile();
    const text = await file.text();

    if (!text) return null;

    const allAgents: AgentData[] = JSON.parse(text);

    return allAgents.find((a) => a.agent_id === agentId) || null;
  } catch (err) {
    return null;
  }
}