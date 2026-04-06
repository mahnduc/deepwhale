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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { 
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <html lang="vi" className={`${inter.variable}`}>
      <head>
        <script src="/deepwhale/coi-serviceworker.js" async></script>
      </head>
      <body className="flex h-screen w-full overflow-hidden bg-ui-bg text-ui-text-main antialiased selection:bg-brand-primary/20 font-sans">
        <ThemeProvider />

        {/* DESKTOP SIDEBAR - Cố định độ rộng bên trái */}
        <aside 
          className={`
            hidden lg:flex h-full shrink-0 transition-all duration-300 ease-in-out bg-ui-bg border-r border-ui-border
            ${isCollapsed ? "w-20" : "w-72"}
          `}
        >
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </aside>

        {/* MOBILE SIDEBAR OVERLAY - Giữ nguyên logic cũ */}
        <div
          className={`fixed inset-0 z-[100] lg:hidden transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          <div
            className="absolute inset-0 bg-ui-text-main/10 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className={`
            relative h-full w-72 bg-ui-bg border-r border-ui-border transition-transform duration-300 ease-out flex flex-col
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          `}>
            <div className="h-20 px-8 flex items-center justify-between border-b border-ui-border">
              <span className="text-xs font-bold uppercase tracking-widest text-ui-text-muted">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-ui-text-muted hover:text-ui-text-main rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar isCollapsed={false} setIsCollapsed={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA - Cấu hình Full-width tuyệt đối */}
        <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          
          {/* MOBILE TOP BAR - Chỉ hiển thị trên thiết bị nhỏ */}
          <header className="lg:hidden h-20 px-8 shrink-0 flex items-center justify-between bg-ui-bg/80 backdrop-blur-xl border-b border-ui-border sticky top-0 z-50">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-ui-text-main hover:bg-ui-border/10 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="text-xs font-bold uppercase tracking-[0.4em] text-ui-text-main">
              DeepWhale
            </div>
            <div className="w-8" />
          </header>

          {/* VIEWPORT - Nơi chứa children */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth no-scrollbar">
            {/* Lớp bọc children:
              - h-full để con có thể dùng min-h-full
              - w-full để đảm bảo chiếm hết chiều ngang 
            */}
            <div className="w-full min-h-full flex flex-col">
              {children}
            </div>
          </div>
          
        </main>
      </body>
    </html>
  );
}