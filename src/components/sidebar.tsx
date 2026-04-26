'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  GraduationCap, 
  BookOpen, 
  BrainCircuit, 
  Layers, 
  Settings, 
  LayoutDashboard,
  BotMessageSquare
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Trang chủ", href: "/dashboard" },
    { icon: BookOpen, label: "Học tập", href: "/dashboard/courses" },
    { icon: BotMessageSquare, label: "Trò chuyện", href: "/dashboard/chatbot" },
  ];

  return (
    <aside className="w-16 border-r border-[#262626] h-full bg-[#000000] flex flex-col items-center py-8 z-[60] shrink-0">
      <div className="mb-12">
        <GraduationCap size={28} className="text-[#00E5FF]" strokeWidth={2} />
      </div>

      <nav className="flex flex-col items-center space-y-10 w-full flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-center w-full transition-all
                ${isActive ? "text-[#00E5FF]" : "text-[#717B7A] hover:text-[#00E5FF]"}`}
            >
              {isActive && (
                <div className="absolute left-0 w-[2px] h-6 bg-[#00E5FF]" />
              )}
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <div className="absolute left-14 px-3 py-1 bg-[#00E5FF] text-black text-[10px] font-bold uppercase tracking-widest hidden group-hover:block whitespace-nowrap z-50 pointer-events-none rounded-none">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-start pl-6 space-y-6 w-full mt-auto">
        <Link 
          href="/dashboard/settings" 
          className={`group relative transition-colors ${pathname === '/dashboard/settings' ? "text-[#00E5FF]" : "text-[#717B7A] hover:text-[#00E5FF]"}`}
        >
          <Settings size={20} strokeWidth={1.5} />
          <div className="absolute left-10 px-3 py-1 bg-[#00E5FF] text-black text-[10px] font-bold uppercase tracking-widest hidden group-hover:block whitespace-nowrap z-50">
            Cài đặt
          </div>
        </Link>
      </div>
    </aside>
  );
}