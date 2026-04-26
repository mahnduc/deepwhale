"use client";

import React, { useState } from "react";
import { 
  Monitor, 
  Languages, 
  Bell, 
  Database, 
  Zap,
  ChevronDown
} from "lucide-react";

export default function PreferencesPage() {
  const [theme, setTheme] = useState("dark_industrial");
  const [language, setLanguage] = useState("en_us");
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 font-mono text-[#DCE4E5]">
      
      {/* SECTION 1: INTERFACE CONFIG */}
      <section className="border border-[#262626] p-8 relative">
        <h2 className="absolute -top-3 left-6 bg-[#000000] px-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">
          Interface_Config
        </h2>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cột trái: Mô tả */}
            <div className="col-span-1">
              <h3 className="text-sm font-bold uppercase text-[#DCE4E5] flex items-center gap-2">
                <Monitor size={14} className="text-[#00E5FF]" /> Visual_Environment
              </h3>
              <p className="text-[10px] text-[#717B7A] uppercase mt-2 leading-relaxed">
                Customize the aesthetic parameters of the neural interface. Changes apply in real-time.
              </p>
            </div>
            
            {/* Cột phải: Input/Controls */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              {/* Theme Selection */}
              <div className="space-y-2">
                <label className="text-[9px] text-[#717B7A] uppercase tracking-widest">Active_Theme</label>
                <div className="relative">
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-black border border-[#262626] px-4 py-3 text-sm focus:border-[#00E5FF] outline-none transition-all appearance-none uppercase"
                  >
                    <option value="dark_industrial">Dark_Industrial_v1</option>
                    <option value="cyber_cyan">Cyber_Cyan_Neon</option>
                    <option value="high_contrast">High_Contrast_Debug</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717B7A] pointer-events-none" />
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-[9px] text-[#717B7A] uppercase tracking-widest">System_Language</label>
                <div className="relative">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-black border border-[#262626] px-4 py-3 text-sm focus:border-[#00E5FF] outline-none transition-all appearance-none uppercase"
                  >
                    <option value="en_us">English_Standard [US]</option>
                    <option value="vi_vn">Vietnamese_Protocol [VN]</option>
                    <option value="jp_os">Japanese_Core [JP]</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#717B7A] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: NEURAL NOTIFICATIONS */}
      <section className="border border-[#262626] p-8 relative">
        <h2 className="absolute -top-3 left-6 bg-[#000000] px-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">
          Signal_Broadcast
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase text-[#DCE4E5] flex items-center gap-2">
              <Bell size={14} className="text-[#00E5FF]" /> Alert_Systems
            </h3>
            <p className="text-[10px] text-[#717B7A] uppercase mt-2 leading-relaxed">
              Manage how the system communicates critical updates and process completions.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border border-[#262626] p-4 hover:border-[#00E5FF]/50 transition-colors cursor-pointer group"
                 onClick={() => setNotifications(!notifications)}>
              <div>
                <p className="text-[10px] font-bold uppercase">Push_Notifications</p>
                <p className="text-[9px] text-[#717B7A] uppercase mt-1">Enable real-time status alerts</p>
              </div>
              <div className={`w-10 h-5 border flex items-center px-1 transition-all ${notifications ? "border-[#00E5FF] bg-[#00E5FF]/10" : "border-[#262626] bg-transparent"}`}>
                <div className={`w-2 h-2 transition-all ${notifications ? "translate-x-5 bg-[#00E5FF]" : "translate-x-0 bg-[#262626]"}`} />
              </div>
            </div>

            <div className="flex items-center justify-between border border-[#262626] p-4 opacity-50">
              <div>
                <p className="text-[10px] font-bold uppercase">Sound_Diagnostics</p>
                <p className="text-[9px] text-[#717B7A] uppercase mt-1">Audio feedback for system events</p>
              </div>
              <span className="text-[8px] border border-[#262626] px-2 py-1 text-[#262626]">UNAVAILABLE</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SYSTEM CORE */}
      <section className="border border-[#262626] p-8 relative">
        <h2 className="absolute -top-3 left-6 bg-[#000000] px-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">
          Data_Integrity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1">
            <h3 className="text-sm font-bold uppercase text-[#DCE4E5] flex items-center gap-2">
              <Database size={14} className="text-[#00E5FF]" /> Memory_Management
            </h3>
            <p className="text-[10px] text-[#717B7A] uppercase mt-2 leading-relaxed">
              Flush local caches and reset interface state to factory defaults.
            </p>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <button className="px-6 py-3 bg-transparent border border-red-900 text-red-900 text-[10px] font-bold uppercase tracking-widest hover:bg-red-900 hover:text-black transition-all flex items-center gap-2">
              <Zap size={12} /> Purge_System_Cache
            </button>
          </div>
        </div>
      </section>

      {/* BOTTOM ACTION */}
      <div className="flex justify-end pt-4">
        <button className="px-10 py-3 bg-[#00E5FF] text-black text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">
          Save_Configuration
        </button>
      </div>
    </div>
  );
}