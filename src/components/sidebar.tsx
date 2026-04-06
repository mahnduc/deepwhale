'use client';

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

  const getItemClass = (href: string) => {
    const isActive = pathname === href;
    const baseClass = `flex items-center gap-3 py-3 px-4 mx-3 transition-all duration-300 rounded-2xl group relative`;

    return isActive
      ? `${baseClass} bg-ui-card text-ui-text-main font-bold shadow-sm shadow-black/5`
      : `${baseClass} text-ui-text-muted hover:bg-ui-card/50 hover:text-ui-text-main`;
  };

  return (
    <aside
      className={`relative bg-ui-bg h-screen flex flex-col select-none transition-all duration-500 z-50
        ${isCollapsed ? "w-24" : "w-72"}`}
    >
      {/* Nút Toggle - Thiết kế Floating, không border */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 w-8 h-8 rounded-xl bg-ui-card flex items-center justify-center z-50 text-ui-text-muted hover:text-ui-text-main shadow-lg shadow-black/5 transition-all cursor-pointer opacity-0 group-hover:opacity-100 lg:opacity-100"
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      {/* LOGO AREA - Tăng khoảng cách để tạo sự thông thoáng */}
      <div className="h-24 flex items-center px-8 mb-4">
        <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "justify-start gap-4"}`}>
          <div className="w-10 h-10 bg-ui-text-main flex items-center justify-center rounded-2xl flex-shrink-0 shadow-lg shadow-ui-text-main/10">
            <span className="text-[10px] font-black text-ui-bg uppercase tracking-tighter">DW</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-ui-text-main uppercase">
                DeepWhale
              </span>
              <span className="text-[9px] font-bold text-ui-text-muted uppercase tracking-[0.3em] opacity-40">OS Terminal</span>
            </div>
          )}
        </div>
      </div>

      {/* TOP MENU */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-2">
        {!isCollapsed && (
          <label className="text-[10px] font-black text-ui-text-muted uppercase px-9 mb-4 block tracking-[0.3em] opacity-30">
            Systems
          </label>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={getItemClass(item.href)}
              title={isCollapsed ? item.label : ""}
            >
              <div className={`flex items-center ${isCollapsed ? "w-full justify-center" : ""}`}>
                <Icon 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 1.5} 
                  className={isActive ? "text-ui-text-main" : "text-ui-text-muted opacity-40 group-hover:opacity-100"} 
                />
              </div>
              
              {!isCollapsed && (
                <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {/* Active Indicator - Một dấu chấm nhỏ thay vì border */}
              {isActive && !isCollapsed && (
                <div className="absolute right-4 w-1 h-1 bg-ui-text-main rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM MENU - Loại bỏ border-t, dùng spacing */}
      <div className="py-8 mt-auto">
        <div className="space-y-2">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={getItemClass(item.href)}
                title={isCollapsed ? item.label : ""}
              >
                <div className={`flex items-center ${isCollapsed ? "w-full justify-center" : ""}`}>
                  <Icon 
                    size={20} 
                    strokeWidth={1.5} 
                    className={isActive ? "text-ui-text-main" : "text-ui-text-muted opacity-40"} 
                  />
                </div>
                
                {!isCollapsed && (
                  <span className="text-sm font-semibold tracking-tight whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}