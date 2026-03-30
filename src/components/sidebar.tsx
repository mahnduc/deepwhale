"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, bottomMenuItems } from "./sidebar.config";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  const getItemClass = (href: string) => {
    const isActive = pathname === href;
    const baseClass = `flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 mb-4 mx-2 overflow-hidden ${neoPressed} `;
    
    return isActive 
      ? baseClass + `bg-base-200 ${neoInset} text-primary font-bold`
      : baseClass + `bg-base-200 ${neoFlat} text-base-content/70 hover:scale-[1.02]`;
  };

  return (
    <aside 
      className={`relative bg-base-200 h-screen flex flex-col p-4 select-none border-r border-base-content/5 transition-all duration-300 z-50
        ${isCollapsed ? "w-24" : "w-72"}`}
    >
      {/* Nút Toggle Neumorphism */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute -right-4 top-10 w-8 h-8 rounded-full bg-base-200 border border-base-content/5 flex items-center justify-center z-50 text-base-content transition-all ${neoFlat} ${neoPressed}`}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* LOGO AREA */}
      <div className="mb-10 mt-2 mx-1">
        <div className={`h-16 rounded-2xl bg-base-200 flex items-center justify-center overflow-hidden transition-all ${neoFlat}`}>
          {isCollapsed ? (
             <span className="text-xl font-black text-primary">D<span className="text-base-content">W</span></span>
          ) : (
            <span className="text-sm font-black tracking-widest uppercase text-base-content whitespace-nowrap">
              Deep <span className="text-primary">Whale</span>
            </span>
          )}
        </div>
      </div>

      {/* TOP MENU */}
      <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden no-scrollbar scrollbar-hide">
        {!isCollapsed && (
          <label className="text-[10px] font-black opacity-30 uppercase ml-4 mb-6 block tracking-[0.3em] text-base-content whitespace-nowrap">
            Main Menu
          </label>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={getItemClass(item.href)} title={isCollapsed ? item.label : ""}>
              <div className={`p-2 min-w-8 flex justify-center rounded-xl transition-all ${isActive ? neoInset : ""}`}>
                <Icon size={18} />
              </div>
              {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM MENU */}
      <div className="pt-6 border-t border-base-content/10">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={getItemClass(item.href)} title={isCollapsed ? item.label : ""}>
              <div className="p-2 min-w-8 flex justify-center">
                <Icon size={18} />
              </div>
              {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-wider whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
        
        {!isCollapsed && (
          <div className="mt-4 text-center">
            <span className="text-[8px] font-bold opacity-20 tracking-[0.2em] uppercase text-base-content">v0.0.1 Protocol</span>
          </div>
        )}
      </div>
    </aside>
  );
}