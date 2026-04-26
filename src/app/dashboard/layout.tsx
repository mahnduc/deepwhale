'use client';

import { User } from "lucide-react";
import Sidebar from "../../components/sidebar";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden text-[#717B7A]">
      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* HEADER */}
        <header className="h-16 border-b border-[#262626] bg-[#000000] flex justify-between items-center px-8 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <div className="h-4 w-[2px] bg-[#00E5FF]"></div>
            <h1 className="text-lg font-bold tracking-tight uppercase">
              <span className="text-[#00E5FF]">Xin chào</span>
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="flex items-center space-x-8">
              <button className="text-[12px] uppercase tracking-wider text-[#00E5FF] font-bold border-b border-[#00E5FF] pb-1 transition-all">
                Workspace
              </button>
              <Link href="/editor">
              <button className="text-[12px] uppercase tracking-wider text-[#717B7A] hover:text-[#00E5FF] transition-colors pb-1">
                Editor
              </button>
              </Link>
            </nav>
            <Link href="/dashboard/settings">
            <button className="h-9 w-9 rounded-full border border-[#262626] bg-[#000000] flex items-center justify-center text-[#717B7A] hover:border-[#00E5FF] hover:text-[#00E5FF] transition-all">
              <User size={18} strokeWidth={1.5} />
            </button>
            </Link>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#000000] selection:bg-[#00E5FF] selection:text-[#006064]">
          <div className="p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-64px)] flex flex-col">
            <div className="flex-1 text-[#F5F5F5]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}