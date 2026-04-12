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
  Search,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkle
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
  { id: "general", name: "Tri thức Tổng hợp", description: "Mô hình đa năng cho mọi tác vụ" },
  { id: "coding", name: "Chuyên gia Lập trình", description: "Tối ưu cho React, Next.js và Python" },
  { id: "finance", name: "Phân tích Tài chính", description: "Dữ liệu thị trường và báo cáo kinh tế" },
  { id: "creative", name: "Sáng tạo Nội dung", description: "Viết lách, Marketing và SEO" },
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
  // Quản lý view: 'menu' hiển thị danh sách chức năng, 'knowledge' hiển thị mã nguồn cũ của bạn
  const [activeView, setActiveView] = useState<'menu' | 'knowledge'>('menu');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedKnowledge, setSelectedKnowledge] = useState(KNOWLEDGE_BASES[0].id);

  if (!isOpen) return null;

  // Logic đồng bộ API Key (Giữ nguyên từ mã của bạn)
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
      alert("Không thể lấy Key từ máy chủ Cloudflare.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Danh sách các chức năng chat
  const CHAT_FUNCTIONS = [
    {
      id: 'knowledge',
      title: 'Tra cứu tài liệu',
      desc: 'Kết nối RAG & Bộ tri thức cá nhân',
      icon: <BookOpen size={18} className="text-blue-500" />,
      action: () => setActiveView('knowledge')
    },
    {
      id: 'course',
      title: 'Tạo mới bài học',
      desc: 'Tạo lộ trình học cho tài liệu của bạn',
      icon: <Sparkle size={18} className="text-emerald-500" />,
      action: () => alert('Tính năng đang phát triển')
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="ui-card w-full max-w-md !p-0 shadow-2xl border-[var(--color-ui-border)] bg-[var(--color-ui-bg)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER ĐỘNG */}
        <div className="p-4 border-b border-[var(--color-ui-border)] flex items-center justify-between bg-[var(--color-ui-bg)]/50">
          <div className="flex items-center gap-2.5">
            {activeView === 'knowledge' && (
              <button 
                onClick={() => setActiveView('menu')}
                className="p-1 hover:bg-[var(--color-ui-border)] rounded-md mr-1"
              >
                <ChevronRight size={18} className="rotate-180" />
              </button>
            )}
            <h6 className="!mb-0 font-bold text-sm">
              {activeView === 'menu' ? 'Chức năng mở rộng' : 'Tra cứu tri thức'}
            </h6>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--color-ui-border)] rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* NỘI DUNG THAY ĐỔI THEO VIEW */}
        <div className="overflow-y-auto custom-scrollbar">
          {activeView === 'menu' ? (
            /* VIEW DANH SÁCH CHỨC NĂNG */
            <div className="p-4 space-y-3">
              {CHAT_FUNCTIONS.map((func) => (
                <button
                  key={func.id}
                  onClick={func.action}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--color-ui-border)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/5 transition-all group text-left"
                >
                  <div className="p-2.5 bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-lg group-hover:scale-110 transition-transform shadow-sm">
                    {func.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[var(--color-ui-text-main)]">{func.title}</div>
                    <div className="text-[10px] text-[var(--color-ui-text-muted)] mt-0.5">{func.desc}</div>
                  </div>
                  <ChevronRight size={14} className="text-[var(--color-icon-muted)]" />
                </button>
              ))}
              
              <div className="pt-4 border-t border-[var(--color-ui-border)] opacity-60">
                <div className="flex items-center gap-2 px-2 text-[10px] font-medium">
                  <ShieldCheck size={12} /> Hệ thống bảo mật DeepWhale
                </div>
              </div>
            </div>
          ) : (
            /* VIEW TRA CỨU TÀI LIỆU (MÃ NGUỒN CỦA BẠN) */
            <div className="p-6 space-y-5 animate-in slide-in-from-right-4 duration-300">
              {/* API KEY SECTION */}
              <div className="space-y-2">
                <h6 className="text-[10px] uppercase tracking-wider font-semibold opacity-60">API Security Key</h6>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-icon-muted)]" size={14} />
                  <input
                    type="password"
                    className="w-full bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-lg pl-9 pr-4 py-2.5 text-xs font-mono outline-none focus:border-[var(--color-brand-primary)] transition-all"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Groq Key..."
                  />
                </div>
              </div>

              {/* KNOWLEDGE BASE SELECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h6 className="text-[10px] uppercase tracking-wider font-semibold opacity-60">Bộ tri thức</h6>
                  <Link href="/knowledge" className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-brand-primary)] hover:opacity-80">
                    <Plus size={10} /> TẠO MỚI
                  </Link>
                </div>
                <div className="relative group">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-icon-muted)]" size={14} />
                  <select
                    value={selectedKnowledge}
                    onChange={(e) => setSelectedKnowledge(e.target.value)}
                    className="w-full bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-lg pl-9 pr-10 py-2.5 text-xs font-medium appearance-none outline-none focus:border-[var(--color-brand-primary)] cursor-pointer transition-all"
                  >
                    {KNOWLEDGE_BASES.map((kb) => (
                      <option key={kb.id} value={kb.id}>{kb.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <ChevronDown size={14} />
                  </div>
                </div>
                <p className="text-[10px] text-[var(--color-ui-text-muted)] italic">
                  {KNOWLEDGE_BASES.find(kb => kb.id === selectedKnowledge)?.description}
                </p>
              </div>

              {/* SYSTEM PERSONA */}
              <div className="space-y-2">
                <h6 className="text-[10px] uppercase tracking-wider font-semibold opacity-60">System Persona</h6>
                <textarea
                  className="w-full h-28 bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-lg p-3 text-[13px] outline-none focus:border-[var(--color-brand-primary)] resize-none"
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  placeholder="Xác định vai trò của trợ lý..."
                />
              </div>
            </div>
          )}
        </div>

        {/* FOOTER (CHỈ HIỂN THỊ KHI Ở VIEW KNOWLEDGE) */}
        {activeView === 'knowledge' && (
          <div className="p-4 border-t border-[var(--color-ui-border)] flex items-center justify-between gap-4 bg-[var(--color-ui-bg)]">
            <button
              onClick={onSave}
              className="flex-1 py-3 bg-[var(--color-ui-text-main)] text-[var(--color-ui-bg)] rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              Lưu cấu hình
            </button>
            <button
              onClick={handleSyncFromWorker}
              disabled={isSyncing}
              className={`p-3 border border-[var(--color-ui-border)] rounded-lg transition-all shadow-sm active:scale-90 flex items-center justify-center ${
                isSyncing ? "bg-gray-100 text-gray-400" : isSuccess ? "bg-green-100 text-green-600" : "bg-[var(--color-ui-card)] text-[var(--color-brand-primary)]"
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