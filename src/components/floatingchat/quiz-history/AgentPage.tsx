"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { BotMessageSquare, RefreshCw, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChartDataPoint } from "./QuizDetailChart";
import { useAgentChat } from "./useChat";
import { QuizStrategyCoachAgent } from "@/agent/members/learning-strategist";

interface QuizPayloadData {
  quizTitle: string;
  chartData: ChartDataPoint[];
}

interface AgentPageProps {
  quizPayload?: QuizPayloadData;
  onClose?: () => void;
}

export default function AgentPage({ quizPayload, onClose }: AgentPageProps) {
  const [input, setInput] = useState("");
  const hasTriggeredInitial = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const coachAgentInstance = useMemo(() => new QuizStrategyCoachAgent(), []);

  const { messages, isLoading, sendMessage, resetChat } = useAgentChat({
    agent: coachAgentInstance,
    initialCollectedData: {
      quizRequest: quizPayload,
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (quizPayload && !hasTriggeredInitial.current && messages.length === 0 && !isLoading) {
      hasTriggeredInitial.current = true;
      
      sendMessage(
        "Hệ thống đã nạp dữ liệu bài tập thành công. Hãy kích hoạt công cụ `analyze_quiz_history` ngay lập tức để lấy thông tin xu hướng học tập từ bộ nhớ đệm và tiến hành tư vấn cho mình."
      );
    }
  }, [quizPayload, sendMessage, messages.length, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const textToSend = input;
    setInput("");
    await sendMessage(textToSend);
  };

  const handleReset = () => {
    hasTriggeredInitial.current = false;
    resetChat();
  };

  return (
    <div 
      className="flex flex-col h-screen max-h-screen w-full bg-white text-[#0d0d0d] overflow-hidden relative" 
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Header - Cố định ở trên cùng */}
      <div className="bg-white px-6 py-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cố vấn chiến lược AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Làm mới
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              title="Quay lại biểu đồ"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Khu vực cuộn độc lập */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-white w-full custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && isLoading && (
            <div className="text-center pt-16 space-y-3">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600 mx-auto" />
              <p className="text-sm text-gray-400 font-medium">Agent đang bóc tách số liệu lịch sử...</p>
            </div>
          )}

          {messages.map((msg, index) => {
            if (msg.role === "tool") return null;
            if (msg.role === "user") {
              const isInitialPrompt = msg.content?.includes("analyze_quiz_history");
              return (
                <div key={index} className="flex justify-end">
                  <div className="bg-gray-100 text-[#0d0d0d] px-4 py-2.5 rounded-2xl max-w-[80%] inline-block text-sm font-medium">
                    {isInitialPrompt ? "📊 Yêu cầu phân tích và lập chiến lược học tập tổng thể" : msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="flex justify-start items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 max-w-[85%] space-y-2">
                  <div className="text-[#0d0d0d] px-1 py-1 text-sm md:text-base leading-relaxed break-words">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-800">{children}</p>,
                        h1: ({ children }) => <h1 className="text-xl font-extrabold pb-1 mt-5 mb-2 text-emerald-800">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2 text-emerald-700">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-bold mt-3 mb-1 text-slate-800">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 text-slate-700">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-slate-700">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        code: ({ children }) => <code className="bg-gray-100 rounded px-1.5 py-0.5 text-xs font-mono text-rose-600 font-bold">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-emerald-500 bg-emerald-50/60 pl-4 py-1.5 my-3 italic rounded-r text-slate-700">{children}</blockquote>,
                        table: ({ children }) => <div className="overflow-x-auto my-4"><table className="min-w-full text-sm">{children}</table></div>,
                        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                        th: ({ children }) => <th className="px-3 py-2 font-bold text-left text-slate-700">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 text-slate-600 bg-white">{children}</td>,
                        a: ({ href, children }) => (
                          <a 
                            href={href} 
                            className="inline-flex items-center font-black text-emerald-600 hover:text-emerald-700 underline underline-offset-4 transition-colors mx-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
          
          {messages.length > 0 && isLoading && (
            <div className="flex justify-start items-center space-x-2 pl-11">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Action Bar - Ghim chặt cố định hoàn toàn dưới đáy */}
      <div className="bg-white pb-6 pt-3 px-4 shrink-0 w-full z-10 border-t border-gray-50">
        <div className="max-w-3xl mx-auto relative flex items-center bg-gray-100/80 rounded-3xl transition-all duration-200">
          <input
            type="text"
            placeholder={isLoading ? "Cố vấn đang xử lý biểu mẫu..." : "Trò chuyện thêm với cố vấn..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="w-full bg-transparent py-4 pl-5 pr-14 text-sm outline-none text-[#0d0d0d] placeholder-gray-400 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 p-2 rounded-full transition-all duration-200 ${
              input.trim() && !isLoading ? "bg-[#0d0d0d] text-white hover:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}