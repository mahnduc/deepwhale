"use client";

import { useState, useEffect, useRef } from "react";
import { PGlite } from "@electric-sql/pglite";
import Groq from "groq-sdk";
import {
  Trash2,
  MessageSquare,
  Settings,
  Send,
  Cpu,
  ChevronDown,
  Plus,
  Bot,
  Key,
  AlertCircle
} from "lucide-react";

// Config & Types
const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
];

type Message = {
  conversation_id: number;
  role: "user" | "assistant" | "system";
  content: string;
};
type Conversation = { id: number; title: string; system_prompt: string };

// Neumorphism Styles
const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // States cho API Key & System Prompt
  const [apiKey, setApiKey] = useState("");
  const [tempPrompt, setTempPrompt] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const currentConv = conversations.find((c) => c.id === currentConvId);

  // Khởi tạo và load dữ liệu
  useEffect(() => {
    // Load API Key từ Local Storage
    const savedKey = localStorage.getItem("pengu_groq_key") || "";
    setApiKey(savedKey);

    initDB().then(() =>
      loadConversations().then((convs) => {
        if (convs.length > 0) setCurrentConvId(convs[0].id);
      })
    );
  }, []);

  const loadConversations = async () => {
    const db = await getDB();
    const res = await db.query("SELECT * FROM conversations ORDER BY created_at DESC");
    setConversations(res.rows as Conversation[]);
    return res.rows as Conversation[];
  };

  const handleNewChat = async () => {
    const db = await getDB();
    const res = await db.query("INSERT INTO conversations (title) VALUES ($1) RETURNING *", ["Cuộc hội thoại mới"]);
    const newConv = (res.rows as Conversation[])[0];
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConvId(newConv.id);
    setMessages([]);
    setIsHistoryOpen(false);
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
      getDB()
        .then((db) =>
          db.query(
            "SELECT role, content FROM chat_history WHERE conversation_id = $1 ORDER BY created_at ASC",
            [currentConvId]
          )
        )
        .then((res) => setMessages(res.rows as Message[]));
      if (currentConv) setTempPrompt(currentConv.system_prompt);
    } else {
      setMessages([]);
    }
  }, [currentConvId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey) {
      setIsModalOpen(true);
      return;
    }

    const userMsg = input;
    const db = await getDB();
    setInput("");
    setIsLoading(true);

    try {
      const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
      let activeId = currentConvId;
      
      if (!activeId) {
        const res = await db.query("INSERT INTO conversations (title) VALUES ($1) RETURNING *", ["New Chat"]);
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

      if (messages.length === 0) {
        const titleGen = await groq.chat.completions.create({
          messages: [{ role: "user", content: `Tạo tiêu đề 2-3 từ cho: "${userMsg}"` }],
          model: "llama-3.1-8b-instant",
        });
        const newTitle = titleGen.choices[0]?.message?.content?.replace(/["'.]/g, "") || "Session";
        await db.query("UPDATE conversations SET title = $1 WHERE id = $2", [newTitle, activeId]);
        setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, title: newTitle } : c)));
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối Groq. Vui lòng kiểm tra lại API Key.");
    } finally {
      setIsLoading(false);
    }
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
    <div className="h-screen w-full bg-base-200 text-base-content/80 font-sans overflow-hidden flex flex-col">
      {/* --- HEADER --- */}
      <header className="z-[60] p-6 flex flex-wrap items-center justify-between gap-4 border-b border-base-content/5">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl bg-base-200 ${neoFlat} text-primary`}>
            <Bot size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-base-content">
              Pengu <span className="text-primary">Intelligence</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-xl bg-base-200 text-[10px] font-black uppercase tracking-widest transition-all ${neoFlat} ${neoPressed}`}
            >
              <MessageSquare size={14} className="text-primary" />
              <span className="max-w-[100px] truncate">{currentConv?.title || "Registry"}</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${isHistoryOpen ? "rotate-180" : ""}`} />
            </button>

            {isHistoryOpen && (
              <div className={`absolute top-full right-0 mt-4 w-72 max-h-[400px] overflow-y-auto bg-base-200 rounded-2xl p-3 z-[100] ${neoFlat} animate-in fade-in zoom-in-95 duration-200`}>
                <button
                  onClick={handleNewChat}
                  className={`w-full flex items-center justify-center gap-2 p-3 mb-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-tighter shadow-lg active:scale-95 transition-all`}
                >
                  <Plus size={14} /> Cuộc hội thoại mới
                </button>
                <div className="space-y-2">
                  {conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => { setCurrentConvId(c.id); setIsHistoryOpen(false); }}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        c.id === currentConvId ? `${neoInset} text-primary font-bold` : "hover:bg-base-300/50"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase truncate">{c.title}</span>
                      <button onClick={(e) => handleDeleteConv(e, c.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-error transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={`bg-base-200 text-[10px] font-black uppercase tracking-widest border-none rounded-xl px-4 py-2.5 outline-none cursor-pointer ${neoFlat}`}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className={`p-2.5 rounded-xl bg-base-200 transition-all ${neoFlat} ${neoPressed} ${!apiKey ? "text-error animate-pulse" : "text-base-content/60 hover:text-primary"}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* --- CHAT AREA --- */}
      <main className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
          {!apiKey && (
            <div className={`p-8 rounded-[2rem] bg-base-200 ${neoFlat} border border-error/20 flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-20 animate-bounce`}>
              <AlertCircle size={40} className="text-error" />
              <h2 className="text-sm font-black uppercase tracking-widest">Thiếu API Key</h2>
              <p className="text-xs opacity-60 italic">Vui lòng vào cài đặt để nhập Groq API Key của bạn trước khi bắt đầu.</p>
              <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 rounded-xl bg-primary text-primary-content text-[10px] font-black uppercase tracking-widest">
                Mở cài đặt
              </button>
            </div>
          )}

          {messages.length === 0 && apiKey && !isLoading && (
            <div className="h-[60vh] flex flex-col items-center justify-center opacity-10 select-none">
              <Bot size={100} className="mb-6 animate-pulse text-primary" />
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Pengu</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.8em]">Deep Whale Protocol</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-5 rounded-[2rem] text-[13px] font-medium leading-relaxed transition-all ${
                  m.role === "user"
                    ? `bg-primary text-primary-content ${neoFlat} rounded-tr-md`
                    : `bg-base-200 ${neoInset} text-base-content/80 rounded-tl-md`
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center p-6">
              {[0, 200, 400].map((delay) => (
                <div key={delay} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </main>

      {/* --- INPUT AREA --- */}
      <footer className="p-8">
        <div className={`max-w-4xl mx-auto flex items-center gap-4 p-2 rounded-[2.5rem] bg-base-200 ${neoInset}`}>
          <input
            className="flex-1 bg-transparent px-6 py-3 text-sm outline-none placeholder:text-base-content/20 tracking-wider text-base-content"
            placeholder={apiKey ? "Nhập tin nhắn..." : "Hãy nhập API Key trước..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={!apiKey}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !apiKey}
            className={`p-4 rounded-full bg-base-200 text-primary transition-all ${neoFlat} ${neoPressed} ${
              isLoading || !apiKey ? "opacity-30" : "hover:scale-105 active:scale-95"
            }`}
          >
            <Send size={20} fill="currentColor" />
          </button>
        </div>
      </footer>

      {/* --- SETTINGS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-base-200/60 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className={`bg-base-200 w-full max-w-lg rounded-[2.5rem] p-10 ${neoFlat} max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center gap-3 mb-8">
              <Settings className="text-primary" size={20} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-base-content">Kernel Configuration</h3>
            </div>
            
            {/* API KEY SECTION */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 ml-2">
                <Key size={10} /> Groq API Key
              </label>
              <input
                type="password"
                className={`w-full bg-base-200 rounded-xl px-6 py-4 text-xs font-bold outline-none transition-all ${neoInset} text-primary`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-[8px] mt-2 ml-2 opacity-30 uppercase font-bold">* Được lưu cục bộ tại trình duyệt</p>
            </div>

            {/* SYSTEM PROMPT SECTION */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40 mb-3 ml-2">
                <Cpu size={10} /> System Prompt
              </label>
              <textarea
                className={`w-full h-40 bg-base-200 rounded-[1.5rem] p-6 text-[12px] font-bold outline-none transition-all ${neoInset} focus:ring-1 focus:ring-primary/20 leading-relaxed text-base-content/70`}
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                placeholder="Override agent logic..."
              />
            </div>

            <div className="flex justify-end gap-6 items-center">
              <button onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase opacity-40 hover:opacity-100 transition-all tracking-widest">
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className={`px-8 py-3.5 rounded-xl bg-primary text-primary-content text-[10px] font-black uppercase tracking-widest ${neoFlat} active:scale-95 transition-all`}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}