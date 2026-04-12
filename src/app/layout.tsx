'use client';

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import ThemeProvider from "@/app/settings/_components/ThemeProvider";
import Sidebar from "@/components/sidebar";
import { Menu, X } from "lucide-react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang="vi" className={`${inter.variable}`}>
      <body className="h-screen w-full overflow-hidden bg-[var(--color-ui-bg)] text-[var(--color-ui-text-main)] antialiased font-sans text-sm">
        <ThemeProvider />
        <div className="flex h-full w-full overflow-hidden">

          <aside
            className={`
              hidden lg:flex h-full shrink-0 border-r border-[var(--color-ui-border)] bg-[var(--color-ui-bg)]
              transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${isCollapsed ? "w-[68px]" : "w-64"} 
            `}
          >
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </aside>

          <div
            className={`
              fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] lg:hidden 
              transition-opacity duration-500 ease-in-out
              ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
            `}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside
            className={`
              fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--color-ui-bg)] z-[70] lg:hidden 
              border-r border-[var(--color-ui-border)] flex flex-col
              transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--color-ui-border)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[var(--color-brand-primary)] rounded-lg flex items-center justify-center text-[var(--color-ui-bg)]">
                  <p className="font-bold text-[10px] mb-0">DW</p>
                </div>
                <h5 className="mb-0 font-bold tracking-tight">DeepWhale</h5>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2 text-[var(--color-icon-muted)] hover:bg-[var(--color-ui-hover)] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Sidebar isCollapsed={false} setIsCollapsed={() => setIsMobileMenuOpen(false)} />
            </div>
          </aside>

          <main className="flex-1 min-w-0 h-full relative flex flex-col overflow-hidden bg-[var(--color-ui-bg)]">

            {/* mobile top bar */}
            <header className="lg:hidden h-14 w-full flex items-center justify-between px-4 bg-[var(--color-ui-bg)] border-b border-[var(--color-ui-border)] shrink-0 z-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[var(--color-brand-primary)] rounded-lg flex items-center justify-center text-[var(--color-ui-bg)]">
                  <span className="font-bold text-[11px]">DW</span>
                </div>
                <span className="font-bold text-base tracking-tight text-[var(--color-ui-text-main)]">DeepWhale</span>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -mr-2 text-[var(--color-ui-text-main)] hover:bg-[var(--color-ui-hover)] rounded-lg transition-colors active:scale-90"
              >
                <Menu size={22} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col items-center">
              <div className="w-full max-w-7xl min-h-full flex flex-col">
                <div className="flex-1 w-full mx-auto shadow-sm">
                  {children}
                </div>
              </div>
            </div>

          </main>

        </div>
      </body>
    </html>
  );
}