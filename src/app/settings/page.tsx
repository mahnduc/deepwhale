"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ChevronRight, 
  Check, 
  Zap, 
  Palette, 
  Monitor, 
  LayoutTemplate, 
  ExternalLink 
} from "lucide-react";
import { Theme, themes } from "@/app/settings/theme";

/* ================= THEME SELECTOR COMPONENT ================= */

function ThemeSelector({
  currentTheme,
  onChangeTheme,
}: {
  currentTheme: Theme;
  onChangeTheme: (theme: Theme) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => onChangeTheme(t)}
          className={`
            flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer
            ${currentTheme === t 
              ? "border-brand-primary bg-brand-primary/5 text-brand-primary" 
              : "border-ui-border bg-ui-card text-ui-text-muted hover:bg-ui-border/10"}
          `}
        >
          <span className="text-xs font-medium capitalize">{t}</span>
          {currentTheme === t && <Check size={14} />}
        </button>
      ))}
    </div>
  );
}

/* ================= SETTINGS PAGE ================= */

export default function Settings() {
  const [theme, setTheme] = useState<Theme>("light");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as Theme) || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const handleChangeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="min-h-screen bg-ui-bg text-ui-text-main font-sans antialiased selection:bg-brand-primary/20">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
        
        {/* HEADER */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-ui-text-main">Cài đặt</h1>
          <p className="text-base text-ui-text-muted">
            Quản lý cấu hình hệ thống và tùy chỉnh trải nghiệm người dùng.
          </p>
        </header>

        <div className="space-y-8">
          
          {/* SECTION: GIAO DIỆN */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-ui-text-main">Giao diện</h2>
            
            <div className="bg-ui-card border border-ui-border rounded-2xl overflow-hidden">
              {/* Item Block: Theme Toggle */}
              <div
                className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-ui-border/10 transition-colors group"
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-ui-bg border border-ui-border text-ui-text-muted group-hover:text-brand-primary transition-colors">
                    <Palette size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-base font-medium">Chủ đề ứng dụng</p>
                    <p className="text-sm text-ui-text-muted capitalize">
                      Chế độ hiện tại: {theme}
                    </p>
                  </div>
                </div>
                <ChevronRight 
                  size={20} 
                  className={`text-ui-text-muted transition-transform duration-300 ${isSelectorOpen ? "rotate-90" : ""}`} 
                />
              </div>

              {/* Expandable Detail: Theme Selector */}
              {isSelectorOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-ui-border bg-ui-bg/50">
                  <ThemeSelector currentTheme={theme} onChangeTheme={handleChangeTheme} />
                </div>
              )}
            </div>
          </section>

          {/* SECTION: HỆ THỐNG */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-ui-text-main">Hệ thống</h2>
            
            <div className="bg-ui-card border border-ui-border rounded-2xl p-6 space-y-6">
              {/* Engine Status */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-ui-bg border border-ui-border text-brand-primary">
                    <Zap size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-base font-medium">DeepWhale Engine</p>
                    <p className="text-xs text-ui-text-muted font-medium uppercase tracking-wider">
                      Trạng thái: <span className="text-state-success">Đang hoạt động</span>
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-ui-border/20 border border-ui-border text-[10px] font-bold text-ui-text-muted tracking-widest uppercase">
                  v0.0.1-beta
                </div>
              </div>

              {/* Web Version Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-ui-border">
                <div className="p-2.5 rounded-xl bg-ui-bg border border-ui-border text-ui-text-muted">
                  <Monitor size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-base font-medium">Phiên bản Web</p>
                  <p className="text-sm text-ui-text-muted">Tối ưu hóa cho trình duyệt nhân Chromium.</p>
                </div>
              </div>

              {/* DESIGN SYSTEM GUIDE LINK (Static Export Friendly) */}
              <Link 
                href="/settings/dsg" 
                className="flex items-center justify-between gap-4 pt-4 border-t border-ui-border group hover:bg-ui-border/10 transition-all -mx-6 px-6"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-ui-bg border border-ui-border text-ui-text-muted group-hover:text-brand-primary group-hover:border-brand-primary/30 transition-colors">
                    <LayoutTemplate size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium group-hover:text-ui-text-main transition-colors">Thiết kế (DSG)</p>
                      <ExternalLink size={12} className="text-ui-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-ui-text-muted">Tài liệu quy chuẩn Design System Guide.</p>
                  </div>
                </div>
                <ChevronRight 
                  size={18} 
                  className="text-ui-text-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" 
                />
              </Link>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}