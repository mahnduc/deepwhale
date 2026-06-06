"use client";

import { AgentOrchestrator } from "@/agent/core/orchestrator";
import { AgentSession, ChatMessage, IAgent } from "@/agent/core/types";
import { useState, useCallback, useEffect, useRef } from "react";

interface UseAgentChatProps {
  agent: IAgent;
  initialCollectedData?: Record<string, any>;
}

export function useAgentChat({ agent, initialCollectedData = {} }: UseAgentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const sessionRef = useRef<AgentSession>({
    history: [],
    collectedData: initialCollectedData,
    state: {
      step: 0,
      maxSteps: agent.config.maxSteps || 10,
      isFinished: false,
    },
  });

  useEffect(() => {
    sessionRef.current.collectedData = {
      ...sessionRef.current.collectedData,
      ...initialCollectedData,
    };
    console.log("[useAgentChat] Đồng bộ initialCollectedData mới:", sessionRef.current.collectedData);
  }, [initialCollectedData]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    // console.log("[useAgentChat] BẮT ĐẦU GỬI TIN NHẮN");
    // console.log("[useAgentChat] Tin nhắn User:", text);
    // console.log("[useAgentChat] Dữ liệu hiện tại trong Session (collectedData):", sessionRef.current.collectedData);
    // console.log("[useAgentChat] Độ dài lịch sử chat trước khi chạy (history length):", sessionRef.current.history.length);

    try {
      sessionRef.current.state.isFinished = false;
      sessionRef.current.state.step = 0;

      await AgentOrchestrator.run({
        message: text,
        agent,
        session: sessionRef.current,
      });

      // console.log("[useAgentChat] Lõi điều phối Agent hoàn thành lượt chạy.");
      // console.log("[useAgentChat] Trạng thái Session sau khi chạy:", sessionRef.current.state);
      // console.log("[useAgentChat] Lịch sử chat gốc nhận về từ Core (Full History):", sessionRef.current.history);

      const cleanUIHistory = sessionRef.current.history.filter((msg) => {
        if (msg.role === "tool") return false;
        if (msg.role === "assistant" && !msg.content?.trim() && msg.tool_calls) return false;
        return true;
      });

      console.log("[useAgentChat] Lịch sử chat sau khi lọc sạch hiển thị UI (Clean UI History):", cleanUIHistory);
      setMessages(cleanUIHistory);

    } catch (error) {
      console.error("[useAgentChat] HỆ THỐNG ĐIỀU PHỐI AGENT BỊ LỖI CẤP THẤP!");
      console.error("[useAgentChat] Chi tiết lỗi phát sinh:", error);
      console.error("[useAgentChat] Trạng thái Snapshot của Session tại thời điểm lỗi:", {
        agentConfig: agent.config,
        sessionSnapshot: JSON.parse(JSON.stringify(sessionRef.current))
      });

      setMessages((prevMsgs) => [
        ...prevMsgs,
        { role: "system", content: "Đã xảy ra lỗi trong quá trình Agent xử lý dữ liệu." },
      ]);
    } finally {
      setIsLoading(false);
      console.log("[useAgentChat] === KẾT THÚC LƯỢT XỬ LÝ AGENT ===");
    }
  }, [agent, isLoading]);

  const resetChat = useCallback(() => {
    console.log("[useAgentChat] Tiến hành làm mới toàn bộ cuộc trò chuyện.");
    sessionRef.current.history = [];
    sessionRef.current.state = {
      step: 0,
      maxSteps: agent.config.maxSteps || 10,
      isFinished: false,
    };
    setMessages([]);
    setIsLoading(false);
  }, [agent]);

  return {
    messages,
    isLoading,
    sendMessage,
    resetChat,
    collectedData: sessionRef.current.collectedData,
  };
}