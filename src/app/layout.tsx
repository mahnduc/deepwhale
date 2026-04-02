'use client';

import { useState, useEffect } from "react";
import ThemeProvider from "@/app/settings/_components/ThemeProvider";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import { Menu } from "lucide-react"; 

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

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";

  return (
    <html lang="en">
      <body className="flex h-screen w-full overflow-hidden bg-base-200 transition-colors duration-300 scrollbar-hide text-base-content">
        <ThemeProvider />

        <div className="hidden lg:flex h-full">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>

        <div
          className={`fixed inset-0 z-150 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
        >
          <div
            className="absolute inset-0 bg-base-300/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className={`relative h-full w-70 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}>
            <Sidebar isCollapsed={false} setIsCollapsed={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
        <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 bg-base-200">
          <div className="lg:hidden p-4 flex items-center bg-base-200">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`p-3 rounded-2xl bg-base-200 ${neoFlat} active:scale-95 transition-all`}
            >
              <Menu size={20} className="text-primary" />
            </button>
            <span className="ml-4 text-[10px] font-black uppercase tracking-[0.3em] opacity-40 italic">
              DeepWhale Engine
            </span>
          </div>
          <div className="flex-1 h-full overflow-y-auto scrollbar-hide">
            <div className="w-full h-full p-4 md:p-6 lg:p-0">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}