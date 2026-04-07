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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => onChangeTheme(t)}
          className={`
            flex items-center justify-between px-4 h-10 rounded-lg border transition-all duration-150 cursor-pointer text-sm
            ${currentTheme === t 
              ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/5 text-[var(--color-brand-primary)]" 
              : "border-[var(--color-ui-border)] bg-[var(--color-ui-card)] text-[var(--color-ui-text-muted)] hover:border-[var(--color-ui-text-subtle)]"}
          `}
        >
          <span className="capitalize font-medium">{t}</span>
          {currentTheme === t && <Check size={14} strokeWidth={3} />}
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
    <div className="w-full h-full bg-[var(--color-ui-bg)]">
      {/* Content Container - Căn chỉnh theo Layout Web-Base App */}
      <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10">
        
        {/* HEADER - Theo nguyên tắc cốt lõi không text phụ */}
        <header className="border-b border-[var(--color-ui-border)] pb-6">
          <h1 className="!mt-0">Cài đặt</h1>
        </header>

        <div className="space-y-12">
          
          {/* SECTION: GIAO DIỆN */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2">
              <Palette size={20} className="text-[var(--color-icon-brand)]" />
              Giao diện
            </h2>
            
            <div className="ui-card !p-0">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-[var(--color-ui-text-main)]/[0.02] transition-colors group"
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-[var(--color-ui-text-subtle)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                    <Monitor size={20} />
                  </div>
                  <div>
                    <h4 className="!mb-0">Chủ đề ứng dụng</h4>
                    <p className="!mb-0 text-[var(--color-ui-text-subtle)] text-xs uppercase tracking-wider font-bold mt-1">
                      {theme}
                    </p>
                  </div>
                </div>
                <ChevronRight 
                  size={18} 
                  className={`text-[var(--color-icon-muted)] transition-transform duration-200 ${isSelectorOpen ? "rotate-90" : ""}`} 
                />
              </div>

              {isSelectorOpen && (
                <div className="p-5 pt-0 border-t border-[var(--color-ui-border)] bg-[var(--color-ui-bg)]/30">
                  <ThemeSelector currentTheme={theme} onChangeTheme={handleChangeTheme} />
                </div>
              )}
            </div>
          </section>

          {/* SECTION: HỆ THỐNG */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2">
              <Zap size={20} className="text-[var(--color-icon-brand)]" />
              Hệ thống
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Engine Status Card */}
              <div className="ui-card flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="text-[var(--color-state-success)] mt-1">
                    <Zap size={18} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="!mb-1">DeepWhale Engine</h4>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-state-success)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-state-success)]"></span>
                      </span>
                      <p className="!mb-0 text-xs font-medium text-[var(--color-state-success)]">Vận hành</p>
                    </div>
                  </div>
                </div>
                <h6 className="!mt-0 opacity-60">v0.0.1</h6>
              </div>

              {/* DSG Link Card */}
              <Link 
                href="/settings/dsg" 
                className="ui-card-interactive flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-[var(--color-icon-muted)] group-hover:text-[var(--color-brand-primary)] transition-colors">
                    <LayoutTemplate size={20} />
                  </div>
                  <div>
                    <h4 className="!mb-0">Design System</h4>
                    <p className="!mb-0 text-xs text-[var(--color-ui-text-subtle)]">Tài liệu quy chuẩn</p>
                  </div>
                </div>
                <ExternalLink size={14} className="text-[var(--color-icon-muted)] group-hover:text-[var(--color-brand-primary)]" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}