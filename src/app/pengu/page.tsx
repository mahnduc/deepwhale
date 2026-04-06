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
  ChevronRight,
  User,
  X,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

// Types
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
    <div className="h-screen w-full bg-ui-bg flex text-ui-text-main font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR */}
      <aside 
        className={`bg-ui-bg border-r border-ui-border transition-all duration-300 flex flex-col z-20 ${
          isHistoryOpen ? 'w-72' : 'w-0 border-none'
        }`}
      >
        <div className={`flex flex-col h-full w-72 transition-opacity duration-200 ${!isHistoryOpen && 'opacity-0 pointer-events-none'}`}>
          <div className="p-6 space-y-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New Session</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 space-y-1">
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold text-ui-text-muted uppercase tracking-widest opacity-50">Lịch sử hội thoại</span>
            </div>
            {conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setCurrentConvId(c.id)}
                className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                  c.id === currentConvId ? "bg-ui-card" : "hover:bg-ui-border/10"
                }`}
              >
                <MessageSquare size={16} className={c.id === currentConvId ? 'text-ui-text-main' : 'text-ui-text-muted'} />
                <span className={`flex-1 text-sm font-medium truncate ${c.id === currentConvId ? 'text-ui-text-main' : 'text-ui-text-muted'}`}>
                  {c.title}
                </span>
                <button
                  onClick={(e) => handleDeleteConv(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-ui-text-muted hover:text-state-error transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 bg-ui-bg relative">
        
        {/* TOP NAVBAR */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-ui-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 hover:bg-ui-border/10 rounded-xl text-ui-text-muted transition-all"
              title="Toggle Sidebar"
            >
              {isHistoryOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold truncate max-w-[200px]">{currentConv?.title || "DeepWhale Terminal"}</h2>
              <span className="text-[10px] font-medium text-ui-text-muted uppercase tracking-tight">{selectedModel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-ui-card border border-ui-border rounded-xl px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer"
            >
              {MODELS.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 hover:bg-ui-border/10 rounded-xl text-ui-text-muted transition-all"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* MESSAGES FEED */}
        <div className="flex-1 overflow-y-auto pt-6 pb-32">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            {!apiKey && (
              <div className="bg-ui-card rounded-2xl p-8 border border-ui-border text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-state-error/10 text-state-error rounded-full flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">API Key Required</h3>
                  <p className="text-sm text-ui-text-muted">Vui lòng cấu hình Groq API Key trong cài đặt.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-ui-text-main text-ui-bg rounded-xl text-xs font-bold uppercase hover:opacity-90 transition-all"
                >
                  Configure System
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  m.role === 'user' ? 'bg-ui-text-main text-ui-bg' : 'bg-ui-card border border-ui-border text-ui-text-main'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[85%] p-4 rounded-2xl text-base ${
                  m.role === 'user' 
                    ? 'bg-brand-primary/10 text-ui-text-main rounded-tr-none' 
                    : 'bg-ui-card border border-ui-border text-ui-text-main rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-ui-card border border-ui-border flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-ui-card border border-ui-border p-4 rounded-2xl rounded-tl-none animate-pulse">
                   <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-ui-text-muted rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-ui-text-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-ui-text-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-ui-bg via-ui-bg to-transparent">
          <div className="max-w-3xl mx-auto flex items-end gap-3 bg-ui-card border border-ui-border rounded-2xl p-2 shadow-sm focus-within:border-ui-text-muted transition-all">
            <textarea
              className="flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-ui-text-muted/40 resize-none min-h-[44px] max-h-40 font-normal"
              rows={1}
              placeholder={apiKey ? "Nhập tin nhắn..." : "Hệ thống đang khóa..."}
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
              className="p-3 bg-ui-text-main text-ui-bg rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-20"
            >
              <Send size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>

      {/* SETTINGS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ui-bg/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-ui-card w-full max-w-lg rounded-2xl border border-ui-border shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-ui-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-ui-text-muted" />
                <h2 className="text-lg font-bold">Cấu hình hệ thống</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-ui-border/10 rounded-lg transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Key size={14} /> Groq API Key
                </label>
                <input
                  type="password"
                  className="w-full bg-ui-bg border border-ui-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-ui-text-muted transition-all"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-ui-text-muted uppercase tracking-wider flex items-center gap-2">
                  <Bot size={14} /> Persona Prompt (System)
                </label>
                <textarea
                  className="w-full h-32 bg-ui-bg border border-ui-border rounded-xl p-4 text-sm outline-none focus:border-ui-text-muted transition-all resize-none font-normal"
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  placeholder="Ví dụ: Bạn là một chuyên gia lập trình..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-ui-border">
              <button
                onClick={saveSettings}
                className="w-full py-3 bg-ui-text-main text-ui-bg rounded-xl text-sm font-bold uppercase hover:opacity-90 transition-all active:scale-[0.98]"
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