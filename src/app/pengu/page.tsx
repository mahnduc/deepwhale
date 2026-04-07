"use client";

import { useState, useEffect, useRef } from "react";
import { PGlite } from "@electric-sql/pglite";
import Groq from "groq-sdk";
import {
  Trash2,
  Settings,
  Send,
  Plus,
  Bot,
  Key,
  AlertCircle,
  User,
  X,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Cpu,
  Menu,
} from "lucide-react";

// --- Types ---
type Message = { conversation_id: number; role: "user" | "assistant" | "system"; content: string; };
type Conversation = { id: number; title: string; system_prompt: string };

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
];

let dbInstance: PGlite | null = null;
async function getDB() {
  if (!dbInstance) dbInstance = new PGlite("idb://pengu-chat-db");
  return dbInstance;
}

async function initDB() {
  const db = await getDB();
  await db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY, title TEXT, system_prompt TEXT DEFAULT 'You are a helpful assistant.', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY, conversation_id INTEGER, role TEXT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  return db;
}

export default function PenguChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [tempPrompt, setTempPrompt] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const currentConv = conversations.find((c) => c.id === currentConvId);

  useEffect(() => {
    const savedKey = localStorage.getItem("pengu_groq_key") || "";
    setApiKey(savedKey);
    initDB().then(() => loadConversations().then((convs) => {
      if (convs.length > 0) setCurrentConvId(convs[0].id);
    }));
  }, []);

  const loadConversations = async () => {
    const db = await getDB();
    const res = await db.query("SELECT * FROM conversations ORDER BY created_at DESC");
    setConversations(res.rows as Conversation[]);
    return res.rows as Conversation[];
  };

  const handleNewChat = async () => {
    const db = await getDB();
    const res = await db.query("INSERT INTO conversations (title) VALUES ($1) RETURNING *", ["Cuộc trò chuyện mới"]);
    const newConv = (res.rows as Conversation[])[0];
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConvId(newConv.id);
    setMessages([]);
    if (window.innerWidth < 1024) setIsHistoryOpen(false);
  };

  const handleDeleteConv = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const db = await getDB();
    await db.query("DELETE FROM chat_history WHERE conversation_id = $1", [id]);
    await db.query("DELETE FROM conversations WHERE id = $1", [id]);
    const updated = await loadConversations();
    if (currentConvId === id) {
      setCurrentConvId(updated[0]?.id || null);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (currentConvId) {
      getDB().then((db) => db.query("SELECT role, content FROM chat_history WHERE conversation_id = $1 ORDER BY created_at ASC", [currentConvId]))
        .then((res) => setMessages(res.rows as Message[]));
      if (currentConv) setTempPrompt(currentConv.system_prompt);
    }
  }, [currentConvId, conversations]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey) { setIsModalOpen(true); return; }
    const userMsg = input;
    const db = await getDB();
    setInput("");
    setIsLoading(true);
    try {
      const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
      let activeId = currentConvId;
      if (!activeId) {
        const res = await db.query("INSERT INTO conversations (title) VALUES ($1) RETURNING *", ["Chat"]);
        const newConv = (res.rows as Conversation[])[0];
        activeId = newConv.id;
        setCurrentConvId(activeId);
        setConversations((prev) => [newConv, ...prev]);
      }
      await db.query("INSERT INTO chat_history (conversation_id, role, content) VALUES ($1, $2, $3)", [activeId, "user", userMsg]);
      const updatedMessages = [...messages, { conversation_id: activeId, role: "user", content: userMsg } as Message];
      setMessages(updatedMessages);
      const apiMessages = [
        { role: "system", content: currentConv?.system_prompt || "You are a helpful assistant." },
        ...updatedMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      ];
      const completion = await groq.chat.completions.create({ messages: apiMessages as any, model: selectedModel });
      const aiText = completion.choices[0]?.message?.content || "";
      await db.query("INSERT INTO chat_history (conversation_id, role, content) VALUES ($1, $2, $3)", [activeId, "assistant", aiText]);
      setMessages((prev) => [...prev, { conversation_id: activeId!, role: "assistant", content: aiText }]);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const saveSettings = async () => {
    localStorage.setItem("pengu_groq_key", apiKey);
    if (currentConvId) {
      const db = await getDB();
      await db.query("UPDATE conversations SET system_prompt = $1 WHERE id = $2", [tempPrompt, currentConvId]);
      setConversations((prev) => prev.map((c) => (c.id === currentConvId ? { ...c, system_prompt: tempPrompt } : c)));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[var(--color-ui-bg)] overflow-hidden">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 lg:relative bg-[var(--color-ui-bg)] border-r border-[var(--color-ui-border)] transition-all duration-300 flex flex-col z-40 overflow-hidden ${
          isHistoryOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full w-72">
          <div className="p-4 border-b border-[var(--color-ui-border)]">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--color-brand-primary)] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider hover:opacity-90 transition-all active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>Khởi tạo Agent</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
            <h6 className="px-3 mb-3">Lịch sử thực thi</h6>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                    setCurrentConvId(c.id);
                    if (window.innerWidth < 1024) setIsHistoryOpen(false);
                }}
                className={`group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                  c.id === currentConvId ? "bg-[var(--color-ui-card)] border border-[var(--color-ui-border)]" : "hover:bg-[var(--color-ui-border)]/20"
                }`}
              >
                <MessageSquare size={14} className={c.id === currentConvId ? "text-[var(--color-brand-primary)]" : "text-[var(--color-icon-muted)]"} />
                <span className={`flex-1 text-[13px] truncate ${c.id === currentConvId ? 'font-bold' : 'text-[var(--color-ui-text-muted)]'}`}>
                  {c.title}
                </span>
                <button
                  onClick={(e) => handleDeleteConv(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[var(--color-ui-text-subtle)] hover:text-[var(--color-state-error)] transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 lg:hidden" 
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-full relative flex flex-col overflow-hidden">
        
        {/* NAV HEADER */}
        <header className="h-14 px-4 lg:px-6 flex items-center justify-between border-b border-[var(--color-ui-border)] shrink-0 bg-[var(--color-ui-bg)]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 hover:bg-[var(--color-ui-border)]/30 rounded-md text-[var(--color-icon-muted)] transition-all"
            >
              {isHistoryOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            
            <div className="flex flex-col min-w-0">
              <h5 className="!mb-0 truncate text-sm">{currentConv?.title || "Assistant"}</h5>
              <div className="flex items-center gap-1.5 opacity-50">
                <Cpu size={10} className="text-[var(--color-brand-primary)]" />
                <span className="text-[9px] font-bold uppercase tracking-tighter truncate max-w-[100px]">{selectedModel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="hidden sm:block bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] rounded-md px-2 py-1 text-[10px] font-bold outline-none cursor-pointer focus:border-[var(--color-brand-primary)]"
            >
              {MODELS.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 hover:bg-[var(--color-ui-border)]/30 rounded-md text-[var(--color-icon-muted)]"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* VIEWPORT CHÍNH */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--color-ui-bg)] scroll-smooth">
          <div className="max-w-4xl mx-auto p-4 lg:p-8 pb-44 space-y-8">
            
            {!apiKey && (
              <div className="ui-card-outline flex flex-col items-center gap-5 text-center py-16 border-dashed opacity-60">
                <div className="w-12 h-12 rounded-full bg-[var(--color-state-error)]/10 flex items-center justify-center">
                  <AlertCircle className="text-[var(--color-state-error)]" size={24} />
                </div>
                <h6 className="!mb-0">Terminal chưa kích hoạt</h6>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-[var(--color-ui-text-main)] text-[var(--color-ui-bg)] rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all"
                >
                  Cấu hình API Key
                </button>
              </div>
            )}

            {messages.length === 0 && apiKey && (
                <div className="py-20 text-center space-y-4 opacity-20">
                    <Bot size={48} className="mx-auto" strokeWidth={1} />
                    <h6 className="tracking-[0.4em]">DeepWhale Protocol Active</h6>
                </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 lg:gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row animate-in fade-in slide-in-from-bottom-2'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--color-ui-border)] shadow-sm ${
                  m.role === 'user' ? 'bg-[var(--color-ui-text-main)] text-[var(--color-ui-bg)]' : 'bg-[var(--color-ui-card)] text-[var(--color-brand-primary)]'
                }`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`ui-card max-w-[85%] lg:max-w-[75%] !p-3 lg:!p-4 !shadow-none !rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-[var(--color-brand-primary)]/5 !border-[var(--color-brand-primary)]/10 !rounded-tr-none' 
                    : 'bg-[var(--color-ui-card)] !rounded-tl-none'
                }`}>
                  <p className="!mb-0 text-[13px] lg:text-[14px] leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 animate-pulse">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] flex items-center justify-center">
                  <Bot size={14} className="text-[var(--color-icon-muted)]" />
                </div>
                <div className="ui-card !py-3 !px-5 !rounded-2xl !rounded-tl-none bg-[var(--color-ui-card)]/40 flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[var(--color-brand-primary)] rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-[var(--color-brand-primary)] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--color-brand-primary)] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8 bg-gradient-to-t from-[var(--color-ui-bg)] via-[var(--color-ui-bg)]/90 to-transparent z-20">
          <div className="max-w-3xl mx-auto bg-[var(--color-ui-card)] border border-[var(--color-ui-border)] rounded-2xl p-2 shadow-2xl shadow-black/10 focus-within:ring-2 ring-[var(--color-brand-primary)]/10 transition-all flex items-end gap-1">
            <textarea
              className="flex-1 bg-transparent px-4 py-3 text-[14px] outline-none placeholder:text-[var(--color-ui-text-subtle)] resize-none min-h-[44px] max-h-48 custom-scrollbar"
              rows={1}
              placeholder="Gửi yêu cầu tới Agent..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={!apiKey}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !apiKey}
              className="p-3 bg-[var(--color-brand-primary)] text-white rounded-xl hover:opacity-90 disabled:opacity-20 transition-all active:scale-95 flex shrink-0 shadow-lg shadow-[var(--color-brand-primary)]/20"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>
          <p className="text-center text-[9px] tracking-widest text-[var(--color-ui-text-subtle)] mt-2 opacity-40">
            Các phản hỏi có thể chưa chính xác
          </p>
        </div>
      </main>

      {/* SETTINGS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 lg:p-6 animate-in fade-in duration-200">
          <div className="ui-card w-full max-w-md !p-0 shadow-2xl border-[var(--color-ui-border)] animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-4 border-b border-[var(--color-ui-border)] flex items-center justify-between bg-[var(--color-ui-bg)]/50">
              <div className="flex items-center gap-2.5">
                <Settings size={16} className="text-[var(--color-brand-primary)]" />
                <h6 className="!mb-0">Cấu hình Hệ thống</h6>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-[var(--color-ui-border)] rounded-md">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h6 className="!text-[10px]">API Security Key</h6>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-icon-muted)]" size={14} />
                  <input
                    type="password"
                    className="w-full bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-lg pl-9 pr-4 py-2.5 text-xs font-mono outline-none focus:border-[var(--color-brand-primary)]"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Groq Key..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h6 className="!text-[10px]">System Persona</h6>
                <textarea
                  className="w-full h-32 bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-lg p-3 text-[13px] outline-none focus:border-[var(--color-brand-primary)] resize-none"
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  placeholder="Xác định vai trò của trợ lý..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--color-ui-border)]">
              <button
                onClick={saveSettings}
                className="w-full py-3 bg-[var(--color-ui-text-main)] text-[var(--color-ui-bg)] rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}