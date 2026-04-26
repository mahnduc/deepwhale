"use client";

import React from "react";
import { 
  Database, 
  FileQuestion, 
  ChevronRight,
  Activity,
  Terminal,
  Box
} from "lucide-react";

export type NavTab = "KNOWLEDGE_BASE" | "QUIZ_GENERATOR";

interface SidebarNavItem {
  id: NavTab;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

interface TaskSidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const TaskSidebar = ({ activeTab, onTabChange }: TaskSidebarProps) => {
  
  const navItems: SidebarNavItem[] = [
    { 
      id: "KNOWLEDGE_BASE", 
      label: "Xây dựng tri thức", 
      subLabel: "Ingestion & Indexing", 
      icon: <Database size={16}/> 
    },
    { 
      id: "QUIZ_GENERATOR", 
      label: "Tạo câu hỏi", 
      subLabel: "AI Quiz Generation", 
      icon: <FileQuestion size={16}/> 
    },
  ];

  const coreLoadPercentage = activeTab === "KNOWLEDGE_BASE" ? "42%" : "88%";

  return (
    <aside className="w-64 shrink-0 h-screen self-start overflow-hidden select-none border-r border-[#262626] p-6 bg-[#050505] flex flex-col z-20">
      <div className="mb-8 px-2 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          {/* <Box size={14} className="text-[#00E5FF]" />
          <h2 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
            
          </h2> */}
        </div>
        <div className="h-[1px] w-full bg-gradient-to-r from-[#00E5FF]/50 to-transparent" />
      </div>
      <nav className="space-y-3 flex-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full relative flex items-center gap-4 p-4 border transition-all duration-300 group outline-none cursor-pointer ${
                isActive 
                ? "border-[#00E5FF] bg-[#00E5FF]/5 shadow-[0_0_20px_rgba(0,229,255,0.05)]" 
                : "border-transparent hover:bg-white/[0.02]" 
              }`}
            >
              <div className={`transition-colors duration-300 ${isActive ? "text-[#00E5FF]" : "text-[#444] group-hover:text-[#717B7A]"}`}>
                {item.icon}
              </div>

              <div className="flex flex-col text-left flex-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isActive ? "text-[#00E5FF]" : "text-[#717B7A]"}`}>
                  {item.label}
                </span>
                <span className="text-[8px] text-[#444] uppercase tracking-tighter mt-1">
                  {item.subLabel}
                </span>
              </div>

              {isActive && (
                <ChevronRight size={12} className="text-[#00E5FF] animate-pulse" />
              )}

              {isActive && (
                <div className="absolute -left-[1px] top-0 h-full w-[2px] bg-[#00E5FF] shadow-[0_0_10px_#00E5FF]" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};