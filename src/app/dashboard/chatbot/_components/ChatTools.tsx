"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  X,
  Key,
  CloudDownload,
  Loader2,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  Plus,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Database,
  Cpu,
  Binary
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (v: string) => void;
  tempPrompt: string;
  setTempPrompt: (v: string) => void;
  onSave: () => void;
  onSaveOPFS: () => void;
}

const KNOWLEDGE_BASES = [
  { id: "general", name: "GENERAL_INTELLIGENCE", description: "Mô hình đa năng cho mọi tác vụ" },
  { id: "coding", name: "DEVOPS_SPECIALIST", description: "Tối ưu cho React, Next.js và Python" },
  { id: "finance", name: "QUANT_ANALYTICS", description: "Dữ liệu thị trường và báo cáo kinh tế" },
  { id: "creative", name: "CONTENT_SYNTHESIZER", description: "Viết lách, Marketing và SEO" },
];

export default function ChatTools({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  tempPrompt,
  setTempPrompt,
  onSave,
  onSaveOPFS,
}: Props) {
  const [activeView, setActiveView] = useState<'menu' | 'knowledge'>('menu');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState(KNOWLEDGE_BASES[0].id);

  if (!isOpen) return null;

  const handleSyncFromWorker = async () => {
    const WORKER_URL = "https://serverless-worker.mduc46024.workers.dev";
    setIsSyncing(true);
    setIsSuccess(false);
    try {
      const response = await fetch(WORKER_URL);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const fetchedKey = await response.text();
      if (fetchedKey && fetchedKey.trim().length > 0) {
        setApiKey(fetchedKey.trim());
        localStorage.setItem("groq_api_key", fetchedKey.trim());
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (error) {
      alert("CRITICAL_ERROR: Cloudflare sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const CHAT_FUNCTIONS = [
    {
      id: 'knowledge',
      title: 'KNOWLEDGE_RETRIEVAL',
      desc: 'Kết nối RAG & Bộ tri thức cá nhân',
      icon: <Database size={18} />,
      action: () => setActiveView('knowledge')
    },
    {
      id: 'course',
      title: 'CURRICULUM_GEN',
      desc: 'Tạo lộ trình học từ tài liệu',
      icon: <Binary size={18} />,
      action: () => alert('PROTOCOL_UNAVAILABLE: Under construction.')
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-mono text-[#DCE4E5]">
      {/* Container chính: Góc cạnh, viền dày */}
      <div className="w-full max-w-md border-2 border-[#262626] bg-[#050505] shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative">
        
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />

        {/* HEADER: Terminal Style */}
        <div className="p-3 border-b border-[#262626] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-3">
            {activeView === 'knowledge' && (
              <button 
                onClick={() => setActiveView('menu')}
                className="text-[#00E5FF] hover:bg-[#00E5FF]/10 p-1"
              >
                <ChevronRight size={18} className="rotate-180" />
              </button>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#00E5FF] tracking-[0.2em] uppercase">
                {activeView === 'menu' ? 'System_Sub_Modules' : 'Knowledge_Config'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-[#717B7A] hover:text-[#00E5FF] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* NỘI DUNG */}
        <div className="overflow-y-auto custom-scrollbar bg-black">
          {activeView === 'menu' ? (
            /* VIEW DANH SÁCH CHỨC NĂNG: Terminal Menu Style */
            <div className="p-4 space-y-2">
              {CHAT_FUNCTIONS.map((func) => (
                <button
                  key={func.id}
                  onClick={func.action}
                  className="w-full flex items-center gap-4 p-4 border border-[#262626] hover:border-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all group text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[#00E5FF] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">
                    {func.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-black tracking-widest text-[#DCE4E5] uppercase">{func.title}</div>
                    <div className="text-[9px] text-[#717B7A] uppercase mt-1 tracking-tighter">{func.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-[#262626] group-hover:text-[#00E5FF]" />
                </button>
              ))}
              
              <div className="pt-6 mt-4 border-t border-[#262626] flex items-center gap-2 text-[9px] text-[#262626] font-bold uppercase tracking-[0.3em]">
                <ShieldCheck size={12} /> Encrypted_DeepWhale_Environment
              </div>
            </div>
          ) : (
            /* VIEW TRA CỨU TÀI LIỆU */
            <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* API KEY SECTION */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#717B7A]">/ Auth_Token</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00E5FF]">
                    <Key size={14} />
                  </div>
                  <input
                    type="password"
                    className="w-full bg-[#050505] border border-[#262626] rounded-none pl-10 pr-4 py-3 text-xs font-mono outline-none focus:border-[#00E5FF] text-[#00E5FF] placeholder:text-[#1A1A1A] transition-all"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="ENTER_SECURE_TOKEN..."
                  />
                </div>
              </div>

              {/* KNOWLEDGE BASE SELECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#717B7A]">/ Knowledge_Node</label>
                  <Link href="/knowledge" className="text-[9px] font-black text-[#00E5FF] hover:underline flex items-center gap-1">
                    <Plus size={10} /> INITIALIZE_NEW
                  </Link>
                </div>
                <div className="relative">
                  <select
                    value={selectedKnowledge}
                    onChange={(e) => setSelectedKnowledge(e.target.value)}
                    className="w-full bg-[#050505] border border-[#262626] rounded-none pl-4 pr-10 py-3 text-[10px] font-bold tracking-widest appearance-none outline-none focus:border-[#00E5FF] cursor-pointer text-[#DCE4E5] uppercase"
                  >
                    {KNOWLEDGE_BASES.map((kb) => (
                      <option key={kb.id} value={kb.id} className="bg-black">{kb.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#717B7A] pointer-events-none" />
                </div>
              </div>

              {/* SYSTEM PERSONA */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#717B7A]">/ Persona_Injection</label>
                <textarea
                  className="w-full h-32 bg-[#050505] border border-[#262626] rounded-none p-4 text-[11px] outline-none focus:border-[#00E5FF] resize-none text-[#DCE4E5] placeholder:text-[#1A1A1A] uppercase leading-relaxed"
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  placeholder="DEFINE_ASSISTANT_ROLE_PARAMETERS..."
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER: Giao diện nút bấm kiểu Command */}
        {activeView === 'knowledge' && (
          <div className="p-4 border-t border-[#262626] flex gap-2 bg-[#111]">
            <button
              onClick={onSave}
              className="flex-1 py-3 bg-[#00E5FF] text-black rounded-none text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white active:scale-95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]"
            >
              Commit_Changes
            </button>
            <button
              onClick={handleSyncFromWorker}
              disabled={isSyncing}
              className={`p-3 border-2 border-[#262626] rounded-none transition-all flex items-center justify-center ${
                isSyncing ? "text-[#717B7A]" : isSuccess ? "bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]" : "text-[#00E5FF] hover:border-[#00E5FF]"
              }`}
            >
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : isSuccess ? <CheckCircle2 size={18} /> : <CloudDownload size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}