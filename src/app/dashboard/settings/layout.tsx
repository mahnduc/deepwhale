"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User, Shield, Key, Bell } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { icon: User, label: "Profile_Info", href: "/dashboard/settings" },
    { icon: Shield, label: "Security", href: "/dashboard/settings/security" },
    { icon: Key, label: "API_Keys", href: "/dashboard/settings/api-key" },
    { icon: Bell, label: "Preferences", href: "/dashboard/settings/preferences" },
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-[1440px] mx-auto px-6 lg:px-8 pt-0 pb-8 space-y-6 bg-[#000000] font-mono text-[#DCE4E5]">
      
      <div className="grid grid-cols-12 gap-8 items-start pt-4"> 
        <aside className="col-span-12 lg:col-span-3 space-y-2 top-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className="block w-full">
                <button
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border ${
                    isActive
                      ? "bg-transparent border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.1)]"
                      : "bg-transparent border-[#262626] text-[#717B7A] hover:border-[#717B7A] hover:text-[#DCE4E5]"
                  }`}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
                  {item.label}
                  {isActive && <span className="ml-auto animate-pulse">_</span>}
                </button>
              </Link>
            );
          })}
        </aside>

        <main className="col-span-12 lg:col-span-9">
          {children}
        </main>
      </div>
    </div>
  );
}