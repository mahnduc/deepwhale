"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems, bottomMenuItems } from "./sidebar.config";

export default function Sidebar() {
  const pathname = usePathname();

  // Helper function để tạo class cho item
  const getItemClass = (href: string) => {
    const isActive = pathname === href;
    
    // Sử dụng màu nền của DaisyUI: bg-base-200
    // shadow-[...] sử dụng màu từ oklch hoặc rgba dựa trên nội dung theme (base-content)
    const baseClass = "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 mb-4 mx-2 ";
    
    return isActive 
      ? baseClass + "bg-base-200 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-primary font-bold"
      : baseClass + "bg-base-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.5)] hover:shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.3)] text-base-content/70";
  };

  return (
    <aside className="w-72 bg-base-200 h-screen flex flex-col p-4 select-none border-r border-base-content/5">
      {/* LOGO AREA - Sử dụng màu nền của DaisyUI */}
      <div className="mb-10 mt-2 mx-2">
        <div className="p-6 rounded-2xl bg-base-200 shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.5)] flex items-center justify-center">
          <span className="text-xl font-black tracking-widest uppercase text-base-content">
            Deep <span className="text-primary">Whale</span>
          </span>
        </div>
      </div>

      {/* TOP MENU */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <label className="text-[10px] font-black opacity-40 uppercase ml-4 mb-4 block tracking-widest text-base-content">
          Main Menu
        </label>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={getItemClass(item.href)}>
              <div className={`p-2 rounded-lg ${pathname === item.href ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]' : ''}`}>
                <Icon size={18} />
              </div>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM MENU */}
      <div className="pt-6 border-t border-base-content/10">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={getItemClass(item.href)}>
              <div className="p-2">
                <Icon size={18} />
              </div>
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="mt-4 text-center">
            <span className="text-[9px] font-bold opacity-30 tracking-[0.2em] uppercase text-base-content">v0.0.1 System</span>
        </div>
      </div>
    </aside>
  );
}