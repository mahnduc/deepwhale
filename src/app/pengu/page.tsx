"use client";

import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Settings,
  Send,
  Plus,
  Bot,
  User,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import SettingsModal from "./_components/SettingsModal";
import { useChatAgent } from "./_hooks/useChatAgent";

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
];

export default function PenguChat() {
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [tempPrompt, setTempPrompt] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

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

  // --- Logic Khởi tạo & OPFS (Giữ nguyên) ---
  const loadFromOPFS = async () => {
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle("system-key-test");
      const fileHandle = await dirHandle.getFileHandle("test_groq_key.json");
      const file = await fileHandle.getFile();
      const content = await file.text();
      return JSON.parse(content);
    } catch (error) { return null; }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      await init();
      const savedKey = localStorage.getItem("pengu_groq_key");
      if (savedKey) { setApiKey(savedKey); return; }
      const opfsConfig = await loadFromOPFS();
      if (opfsConfig?.apiKey) {
        setApiKey(opfsConfig.apiKey);
        localStorage.setItem("pengu_groq_key", opfsConfig.apiKey);
        if (opfsConfig.lastActiveConv) setCurrentConvId(opfsConfig.lastActiveConv);
      } else { setIsModalOpen(true); }
    };
    initializeAuth();
  }, []);

  useEffect(() => { if (currentConvId) loadMessages(currentConvId); }, [currentConvId]);
  useEffect(() => { if (currentConv) setTempPrompt(currentConv.system_prompt); }, [currentConv]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || !apiKey) {
      if (!apiKey) setIsModalOpen(true);
      return;
    }
    sendMessage(input, currentConv?.system_prompt || "");
    setInput("");
  };

  const saveToOPFS = async () => {
    try {
      const root = await navigator.storage.getDirectory();
      const dirHandle = await root.getDirectoryHandle("system-key-test", { create: true });
      const fileHandle = await dirHandle.getFileHandle("test_groq_key.json", { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify({ apiKey, lastActiveConv: currentConvId, timestamp: new Date().toISOString() }));
      await writable.close();
      alert("Đã đồng bộ OPFS!");
    } catch (error) { alert("Lỗi ghi OPFS"); }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--color-ui-bg)] overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 lg:relative border-r border-[var(--color-ui-border)] transition-all duration-300 flex flex-col z-40 bg-[var(--color-ui-bg)] ${
          isHistoryOpen ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:hidden"
        }`}
      >
        <div className="flex flex-col h-full w-72 p-4 space-y-4">
          <button
            onClick={createConversation}
            className="flex items-center justify-center gap-2 py-3 bg-[var(--color-brand-primary)] text-white rounded-lg text-xs font-bold transition-transform active:scale-95"
          >
            <Plus size={16} />
            <h6>NEW AGENT</h6>
          </button>

          <nav className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setCurrentConvId(c.id)}
                className={`ui-card-interactive flex items-center gap-3 !p-3 ${
                  c.id === currentConvId ? "border-[var(--color-brand-primary)] bg-[var(--color-ui-card)]" : ""
                }`}
              >
                <MessageSquare size={16} className="text-[var(--color-icon-muted)]" />
                <span className="flex-1 text-sm truncate font-medium">{c.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  className="text-[var(--color-ui-text-subtle)] hover:text-[var(--color-state-error)]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-full relative flex flex-col overflow-hidden">
        {/* TOP BAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-ui-border)] bg-[var(--color-ui-card)]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
              className="p-2 hover:bg-[var(--color-ui-bg)] rounded-md text-[var(--color-icon-main)]"
            >
              {isHistoryOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div className="min-w-0">
              <h5>{currentConv?.title || "Assistant"}</h5>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--color-brand-primary)] font-bold tracking-tighter uppercase">
                  {selectedModel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-[11px] bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-md px-2 py-1.5 font-bold outline-none"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-2 text-[var(--color-icon-main)] hover:bg-[var(--color-ui-bg)] rounded-md transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* CHAT VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[var(--color-ui-bg)]">
          {messages.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="ui-card-outline flex flex-col items-center p-12 max-w-sm text-center">
                <Bot size={40} className="text-[var(--color-brand-primary)] mb-4" />
                <h6>DEEPWHALE TERMINAL</h6>
                <p className="text-[var(--color-ui-text-muted)] mt-2">Hệ thống đã sẵn sàng. Hãy bắt đầu một phiên hội thoại mới.</p>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                m.role === "user" ? "bg-[var(--color-brand-primary)] text-white" : "bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] text-[var(--color-brand-primary)]"
              }`}>
                {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`ui-card !py-3 !px-4 max-w-[85%] lg:max-w-[70%] ${
                m.role === "user" ? "bg-[var(--color-brand-primary)] !text-white border-none shadow-md" : ""
              }`}>
                <p className={m.role === "user" ? "text-white" : "text-[var(--color-ui-text-main)]"}>
                  {m.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] flex items-center justify-center animate-pulse">
                <Bot size={18} className="text-[var(--color-icon-muted)]" />
              </div>
              <div className="ui-card-outline !py-3 !px-4 animate-pulse">
                <p className="italic text-[var(--color-ui-text-subtle)] text-xs">Agent đang xử lý...</p>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-6 bg-[var(--color-ui-bg)] border-t border-[var(--color-ui-border)]">
          <div className="max-w-4xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative ui-card !p-0 focus-within:border-[var(--color-brand-primary)] transition-colors">
              <textarea
                className="w-full bg-transparent p-4 text-sm outline-none resize-none min-h-[52px] max-h-40"
                rows={1}
                placeholder="Nhập yêu cầu..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-[52px] w-[52px] flex items-center justify-center bg-[var(--color-brand-primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-20 transition-all active:scale-90 shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        tempPrompt={tempPrompt}
        setTempPrompt={setTempPrompt}
        onSave={() => { localStorage.setItem("pengu_groq_key", apiKey); setIsModalOpen(false); }}
        onSaveOPFS={saveToOPFS}
      />
    </div>
  );
}