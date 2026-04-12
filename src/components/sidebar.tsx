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

  const checkActive = (href: string) => {
    if (href === "/") return pathname === "/" || pathname === "";
    return pathname.startsWith(href);
  };

  const getItemClass = (isActive: boolean) => {
    const baseClass = `flex items-center gap-3 h-10 px-3 mx-2 transition-all duration-300 rounded-lg group relative overflow-hidden mb-0.5`;
    return isActive
      ? `${baseClass} bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]`
      : `${baseClass} text-[var(--color-ui-text-muted)] hover:bg-[var(--color-ui-border)]/20 hover:text-[var(--color-ui-text-main)]`;
  };

  return (
    <aside
      className={`relative bg-[var(--color-ui-bg)] h-full flex flex-col select-none transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 
        ${isCollapsed ? "w-[68px]" : "w-full lg:w-64"}`}
    >
      {/* NÚT TOGGLE - Tối ưu hóa vị trí và transition */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] items-center justify-center z-50 text-[var(--color-icon-muted)] hover:text-[var(--color-brand-primary)] shadow-sm transition-all duration-300 cursor-pointer active:scale-90"
      >
        <div className={`transition-transform duration-500 ${isCollapsed ? "" : "rotate-180"}`}>
          <ChevronRight size={12} />
        </div>
      </button>

      {/* LOGO AREA - Transition tinh tế */}
      <div className="hidden lg:flex h-20 items-center px-4 shrink-0 overflow-hidden">
        <div className={`flex items-center gap-3 transition-all duration-500 ${isCollapsed ? "translate-x-0.5" : ""}`}>
          <div className="w-9 h-9 bg-[var(--color-brand-primary)] flex items-center justify-center rounded-lg shrink-0 shadow-lg shadow-[var(--color-brand-primary)]/20">
            <span className="text-[var(--color-ui-bg)] font-bold text-sm">DW</span>
          </div>
          <div className={`flex flex-col transition-all duration-500 delay-75 ${isCollapsed ? "opacity-0 invisible -translate-x-4" : "opacity-100 visible translate-x-0"}`}>
            <h5 className="!mb-0 leading-none whitespace-nowrap">DeepWhale</h5>
            <p className="text-[var(--color-ui-text-subtle)] !text-[10px] font-bold uppercase tracking-widest !mb-0 mt-1 opacity-70 whitespace-nowrap">Workspace</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2">
        <div className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkActive(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={getItemClass(isActive)}
                onClick={() => { if (window.innerWidth < 1024) setIsCollapsed(false); }}
              >
                {/* Active Indicator Bar */}
                <div className={`absolute left-0 w-1 bg-[var(--color-brand-primary)] transition-all duration-500 ease-in-out rounded-r-full
                  ${isActive ? "h-5 opacity-100" : "h-0 opacity-0"}`} 
                />

                <div className={`flex items-center shrink-0 transition-transform duration-500 ${isCollapsed ? "w-full justify-center" : ""} ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                  <Icon 
                    size={isActive ? 20 : 18} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-[var(--color-icon-brand)]" : "text-[var(--color-icon-muted)] group-hover:text-[var(--color-icon-main)]"} 
                  />
                </div>
                
                {/* Text Label với hiệu ứng trượt và mờ dần */}
                <span className={`truncate text-[14px] lg:text-[13px] transition-all duration-500 ease-in-out whitespace-nowrap
                  ${isCollapsed ? "opacity-0 invisible -translate-x-4" : "opacity-100 visible translate-x-0"}
                  ${isActive ? "font-bold text-[var(--color-ui-text-main)]" : "font-medium"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* BOTTOM MENU */}
      <div className="pb-6 lg:pb-8 mt-auto border-t border-[var(--color-ui-border)] pt-4 shrink-0 overflow-hidden">
        <div className="space-y-0.5">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkActive(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={getItemClass(isActive)}
                onClick={() => { if (window.innerWidth < 1024) setIsCollapsed(false); }}
              >
                <div className={`flex items-center shrink-0 transition-transform duration-500 ${isCollapsed ? "w-full justify-center" : ""} ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                  <Icon 
                    size={18} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-[var(--color-icon-brand)]" : "text-[var(--color-icon-muted)] group-hover:text-[var(--color-icon-main)]"}
                  />
                </div>
                <span className={`truncate text-[14px] lg:text-[13px] transition-all duration-500 ease-in-out whitespace-nowrap
                  ${isCollapsed ? "opacity-0 invisible -translate-x-4" : "opacity-100 visible translate-x-0"}
                  ${isActive ? "font-bold text-[var(--color-ui-text-main)]" : "font-medium"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}