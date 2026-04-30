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
    { icon: User, label: "Profile Info", href: "/dashboard/settings" },
    { icon: Shield, label: "Security", href: "/dashboard/settings/security" },
    { icon: Key, label: "API Keys", href: "/dashboard/settings/api-key" },
    { icon: Bell, label: "Preferences", href: "/dashboard/settings/preferences" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FB] font-['Nunito',sans-serif]">
      <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto px-4 lg:px-8 py-8 space-y-6">
        
        <div className="grid grid-cols-12 gap-8 items-start"> 
          {/* Sidebar Navigation */}
          <aside className="col-span-12 lg:col-span-3 space-y-3 sticky top-8">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.label} href={item.href} className="block w-full">
                  <button
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-[15px] font-[700] transition-all rounded-[16px] border-[2px] ${
                      isActive
                        ? "bg-[#FFF0F7] border-[#FF3399] text-[#FF3399]"
                        : "bg-white border-[#E0E0E0] text-[#2D3436] hover:bg-[#F7F9FB] border-b-[4px] active:border-b-[2px] active:translate-y-[2px]"
                    }`}
                  >
                    <item.icon 
                      size={20} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={isActive ? "text-[#FF3399]" : "text-[#B2BEC3]"}
                    />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </aside>

          {/* Main Content Area */}
          <main className="col-span-12 lg:col-span-9 bg-white border-[1.5px] border-[#F0F0F0] rounded-[24px] p-8 shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}