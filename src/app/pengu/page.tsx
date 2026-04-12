"use client";

import { useState, useEffect, useRef } from "react";
import {
  Settings,
  Send,
  Plus,
  Bot,
  User,
  MessageSquare,
  History,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import ChatTools from "./_components/ChatTools";
import { useChatAgent } from "./_hooks/useChatAgent";

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
];

export default function PenguChat() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [tempPrompt, setTempPrompt] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    conversations,
    currentConvId,
    setCurrentConvId,
    isLoading,
    init,
    loadMessages,
    createConversation,
    deleteConversation,
    sendMessage,
  } = useChatAgent(apiKey, selectedModel);

  const currentConv = conversations.find((c) => c.id === currentConvId);

  // Xử lý đóng menu lịch sử khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Khởi tạo Auth
  useEffect(() => {
    const initializeAuth = async () => {
      await init();
      const savedKey = localStorage.getItem("pengu_groq_key");
      if (savedKey) {
        setApiKey(savedKey);
        return;
      }
      setIsModalOpen(true);
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (currentConvId) loadMessages(currentConvId);
  }, [currentConvId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || !apiKey) {
      if (!apiKey) setIsModalOpen(true);
      return;
    }
    sendMessage(input, currentConv?.system_prompt || "");
    setInput("");
  };

  return (
    <div className="flex-1 min-w-0 h-full relative flex flex-col bg-[var(--color-ui-bg)] overflow-hidden">
      {/* VÙNG HIỂN THỊ TIN NHẮN */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500 py-20">
              <div className="w-12 h-12 bg-[var(--color-brand-primary)] rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <Bot size={24} className="text-white" />
              </div>
              <h1 className="!mt-0 !mb-2 font-bold text-2xl">Pengu Assistant</h1>
              <p className="text-[var(--color-ui-text-muted)] text-center max-w-sm">
                Bắt đầu một cuộc hội thoại mới bằng cách nhập tin nhắn phía dưới.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-4 ${
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                } animate-in fade-in slide-in-from-bottom-2`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                    m.role === "user"
                      ? "bg-[var(--color-ui-text-main)] text-[var(--color-ui-bg)]"
                      : "bg-[var(--color-brand-primary)] text-white"
                  }`}
                >
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div
                  className={`ui-card !p-3.5 max-w-[85%] md:max-w-[75%] ${
                    m.role === "user"
                      ? "!bg-[var(--color-ui-card)]"
                      : "!bg-transparent border-none !shadow-none !p-1 flex-1"
                  }`}
                >
                  <p className="!mb-0 leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)] text-white flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="ui-card-outline !p-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-primary)] animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} className="h-4" />
          </div>
        </div>

        {/* VÙNG NHẬP LIỆU (STICKY & CENTERED) */}
        <div className="sticky bottom-0 w-full z-30">
          {/* Lớp phủ gradient để nội dung chat biến mất mượt mà khi cuộn */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--color-ui-bg)] via-[var(--color-ui-bg)] to-transparent pointer-events-none" />

          <div className="max-w-3xl mx-auto w-full px-4 pb-8 relative">
            {/* History Popover */}
            {isHistoryOpen && (
              <div
                ref={historyRef}
                className="absolute bottom-full mb-3 left-4 w-64 ui-card !p-0 shadow-2xl z-50 animate-in slide-in-from-bottom-2 transition-all"
              >
                <div className="p-2.5 border-b border-[var(--color-ui-border)] flex items-center justify-between bg-[var(--color-ui-bg)] rounded-t-xl">
                  <h6 className="!mb-0 text-xs font-bold uppercase tracking-wider opacity-70">
                    Lịch sử
                  </h6>
                  <button
                    onClick={createConversation}
                    className="p-1 hover:bg-[var(--color-ui-card)] rounded text-[var(--color-brand-primary)] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCurrentConvId(c.id);
                        setIsHistoryOpen(false);
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-md cursor-pointer mb-0.5 transition-all text-xs ${
                        c.id === currentConvId
                          ? "bg-[var(--color-brand-primary)] text-white shadow-md shadow-[var(--color-brand-primary)]/20"
                          : "hover:bg-[var(--color-ui-card)]"
                      }`}
                    >
                      <MessageSquare size={13} className="shrink-0 opacity-60" />
                      <span className="flex-1 truncate">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* THANH INPUT DẠNG CAPSULE */}
            <div className="ui-card !p-1.5 shadow-2xl flex items-center gap-1 bg-[var(--color-ui-card)] border-[var(--color-ui-border)] rounded-full backdrop-blur-xl relative z-10">
              {/* Model Selector */}
              <div className="relative shrink-0 ml-1">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="appearance-none bg-transparent text-[10px] font-bold uppercase tracking-wider pl-2 pr-5 py-1.5 cursor-pointer outline-none text-[var(--color-ui-text-muted)] hover:text-[var(--color-ui-text-main)] transition-colors"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name.split(" ")[0]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={10}
                  className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"
                />
              </div>

              <div className="h-4 w-[1px] bg-[var(--color-ui-border)] shrink-0 mx-1" />

              <textarea
                className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none resize-none max-h-32 min-h-[36px] custom-scrollbar"
                rows={1}
                placeholder="Hỏi Pengu..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <div className="flex items-center gap-0.5 shrink-0 px-1">
                <button
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                  className={`p-2 rounded-full transition-colors ${
                    isHistoryOpen
                      ? "text-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10"
                      : "text-[var(--color-icon-muted)] hover:text-[var(--color-icon-main)] hover:bg-[var(--color-ui-bg)]"
                  }`}
                >
                  <History size={18} />
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 rounded-full text-[var(--color-icon-muted)] hover:text-[var(--color-icon-main)] hover:bg-[var(--color-ui-bg)] transition-colors"
                >
                  <Settings size={18} />
                </button>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="ml-1 h-9 w-9 flex items-center justify-center bg-[var(--color-ui-text-main)] text-[var(--color-ui-bg)] rounded-full hover:opacity-90 disabled:opacity-20 transition-all active:scale-95 shrink-0 shadow-sm"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatTools
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        tempPrompt={tempPrompt}
        setTempPrompt={setTempPrompt}
        onSave={() => {
          localStorage.setItem("pengu_groq_key", apiKey);
          setIsModalOpen(false);
        }}
        onSaveOPFS={() => {}}
      />
    </div>
  );
}