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

  // Hàm kiểm tra trạng thái Active chính xác
  const checkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "";
    }
    return pathname.startsWith(href);
  };

  const getItemClass = (isActive: boolean) => {
    const baseClass = `flex items-center gap-3 h-10 px-3 mx-2 transition-all duration-300 rounded-lg group relative overflow-hidden mb-0.5`;

    return isActive
      ? `${baseClass} bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] shadow-[inset_0_0_12px_rgba(var(--brand-primary-rgb),0.05)]`
      : `${baseClass} text-[var(--color-ui-text-muted)] hover:bg-[var(--color-ui-border)]/20 hover:text-[var(--color-ui-text-main)]`;
  };

  return (
    <aside
      className={`relative bg-[var(--color-ui-bg)] h-full flex flex-col select-none transition-all duration-300 z-50 border-r border-[var(--color-ui-border)]
        ${isCollapsed ? "w-[68px]" : "w-64"}`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[var(--color-ui-bg)] border border-[var(--color-ui-border)] flex items-center justify-center z-50 text-[var(--color-icon-muted)] hover:text-[var(--color-brand-primary)] shadow-sm transition-all cursor-pointer active:scale-90"
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <div className="h-20 flex items-center px-4 shrink-0 mb-2">
        <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "justify-start gap-3"}`}>
          <div className="w-9 h-9 bg-[var(--color-brand-primary)] flex items-center justify-center rounded-lg flex-shrink-0 shadow-lg shadow-[var(--color-brand-primary)]/20">
            <p className="text-[var(--color-ui-bg)] font-bold mb-0 text-sm">DW</p>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <h5 className="!mb-0 leading-none">DeepWhale</h5>
              <p className="text-[var(--color-ui-text-subtle)] !text-[10px] font-bold uppercase tracking-widest !mb-0 mt-1 opacity-70">Workspace</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar py-2">
        {!isCollapsed && (
          <div className="px-5 mb-3 mt-2">
            <h6 className="!text-[10px] opacity-50 uppercase tracking-widest">Hệ thống</h6>
          </div>
        )}
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={getItemClass(isActive)}
              title={isCollapsed ? item.label : ""}
            >
              <div className={`absolute left-0 w-1 bg-[var(--color-brand-primary)] transition-all duration-300 ease-out rounded-r-full
                ${isActive ? "h-5 opacity-100" : "h-0 opacity-0"}`} 
              />

              <div className={`flex items-center shrink-0 transition-transform duration-300 ${isCollapsed ? "w-full justify-center" : ""} ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                <Icon 
                  size={18} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "text-[var(--color-icon-brand)]" : "text-[var(--color-icon-muted)] group-hover:text-[var(--color-icon-main)]"} 
                />
              </div>
              
              {!isCollapsed && (
                <p className={`!mb-0 truncate text-[13px] transition-colors duration-300 ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </p>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pb-8 mt-auto border-t border-[var(--color-ui-border)] pt-4 shrink-0">
        <div className="space-y-0.5">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkActive(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={getItemClass(isActive)}
                title={isCollapsed ? item.label : ""}
              >
                <div className={`absolute left-0 w-1 bg-[var(--color-brand-primary)] transition-all duration-300 ease-out rounded-r-full
                  ${isActive ? "h-5 opacity-100" : "h-0 opacity-0"}`} 
                />

                <div className={`flex items-center shrink-0 transition-transform duration-300 ${isCollapsed ? "w-full justify-center" : ""} ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                  <Icon 
                    size={18} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-[var(--color-icon-brand)]" : "text-[var(--color-icon-muted)] group-hover:text-[var(--color-icon-main)]"}
                  />
                </div>
                {!isCollapsed && (
                  <p className={`!mb-0 truncate text-[13px] transition-colors duration-300 ${isActive ? "font-bold" : "font-medium"}`}>
                    {item.label}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}