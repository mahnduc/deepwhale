"use client";

import { useState } from "react";
import { Settings, X, Key, CloudDownload, Loader2, CheckCircle2 } from "lucide-react";

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

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  tempPrompt,
  setTempPrompt,
  onSave,
  onSaveOPFS,
}: Props) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  /**
   * Logic mới: Gọi Cloudflare Worker để lấy Key và nạp vào LocalStorage
   */
  const handleSyncFromWorker = async () => {
    const WORKER_URL = "https://serverless-worker.mduc46024.workers.dev";
    
    setIsSyncing(true);
    setIsSuccess(false);

    try {
      // 1. Gọi đến Cloudflare Worker
      const response = await fetch(WORKER_URL, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Worker trả về lỗi: ${response.status}`);
      }

      // 2. Lấy dữ liệu (Dạng text vì Worker của bạn trả về text/plain)
      const fetchedKey = await response.text();

      if (fetchedKey && fetchedKey.trim().length > 0) {
        // 3. Cập nhật vào State UI
        setApiKey(fetchedKey.trim());

        // 4. Lưu vào LocalStorage
        localStorage.setItem("groq_api_key", fetchedKey.trim());

        // Hiệu ứng thành công
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        
        // Gọi callback onSave của cha để đồng bộ hóa hệ thống (nếu có)
        if (onSave) onSave();
      } else {
        throw new Error("Dữ liệu Key trống");
      }

    } catch (error) {
      console.error("Sync Error:", error);
      alert("Không thể lấy Key từ máy chủ Cloudflare. Vui lòng kiểm tra lại Worker.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="ui-card w-full max-w-md !p-0 shadow-2xl border-[var(--color-ui-border)] animate-in zoom-in-95 duration-200 overflow-hidden bg-[var(--color-ui-bg)]">
        
        {/* HEADER */}
        <div className="p-4 border-b border-[var(--color-ui-border)] flex items-center justify-between bg-[var(--color-ui-bg)]/50">
          <div className="flex items-center gap-2.5">
            <Settings size={16} className="text-[var(--color-brand-primary)]" />
            <h6 className="!mb-0 font-bold text-sm">Cấu hình Hệ thống</h6>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-[var(--color-ui-border)] rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
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

          <div className="space-y-2">
            <h6 className="text-[10px] uppercase tracking-wider font-semibold opacity-60">System Persona</h6>
            <textarea
              className="w-full h-32 bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] rounded-lg p-3 text-[13px] outline-none focus:border-[var(--color-brand-primary)] resize-none transition-all"
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              placeholder="Xác định vai trò của trợ lý..."
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-[var(--color-ui-border)] flex items-center justify-between gap-4">
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
              isSyncing 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : isSuccess
              ? "bg-green-100 text-green-600 border-green-200"
              : "bg-[var(--color-ui-card)] text-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] hover:text-white"
            }`}
            title="Đồng bộ Key từ Cloudflare"
          >
            {isSyncing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 size={18} />
            ) : (
              <CloudDownload size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}