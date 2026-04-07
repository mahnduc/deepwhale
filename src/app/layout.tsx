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
        <div className="flex h-full w-full">
          {/* --- DESKTOP SIDEBAR --- */}
          <aside 
            className={`
              hidden lg:flex h-full shrink-0 transition-all duration-300 ease-in-out bg-[var(--color-ui-bg)] border-r border-[var(--color-ui-border)]
              ${isCollapsed ? "w-[68px]" : "w-64"} 
            `}
          >
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </aside>
          {/* --- MOBILE SIDEBAR SYSTEM --- */}
          <div
            className={`
              fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] lg:hidden transition-opacity duration-300
              ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
            `}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside
            className={`
              fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--color-ui-bg)] z-[70] lg:hidden border-r border-[var(--color-ui-border)] transition-transform duration-300 ease-out flex flex-col
              ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--color-ui-border)]">
              <div className="flex items-center gap-2">
                 <div className="w-7 h-7 bg-[var(--color-brand-primary)] rounded-lg flex items-center justify-center text-[var(--color-ui-bg)]">
                   <p className="font-bold text-[10px] mb-0">DW</p>
                 </div>
                 <h5 className="mb-0">DeepWhale</h5>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-[var(--color-icon-muted)]">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar isCollapsed={false} setIsCollapsed={() => setIsMobileMenuOpen(false)} />
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA: FULL VIEWPORT --- */}
          <main className="flex-1 min-w-0 h-full relative flex flex-col">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-[var(--color-brand-primary)] text-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform"
            >
              <Menu size={24} />
            </button>

            {/* Viewport chính chiếm 100% diện tích còn lại */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[var(--color-ui-bg)]">
              <div className="w-full h-full min-h-full">
                {children}
              </div>
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}