"use client";

import { useState } from "react";
import { Palette, Monitor, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { Theme } from "@/app/settings/theme";

type Props = {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
};

export default function ThemeSettingsUI({ theme, onChangeTheme }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 text-base-content transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-12">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-base-200 text-primary ${neoFlat}`}>
              <Palette size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              CHỦ ĐỀ ỨNG DỤNG
            </h1>
          </div>
        </header>

        <section className={`rounded-[2.5rem] bg-base-200 p-6 md:p-8 transition-all duration-500 ${neoFlat}`}>
          
          <div 
            className={`flex items-center justify-between p-4 rounded-[1.8rem] cursor-pointer transition-all ${isExpanded ? 'mb-8' : ''} ${neoFlat} ${neoPressed}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full bg-base-200 flex items-center justify-center text-primary ${neoInset}`}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Giao diện hiện tại</h2>
                <p className="text-sm font-black uppercase tracking-widest text-primary italic">
                  {theme}
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-xl bg-base-200 text-primary/50 ${neoFlat}`}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>

          <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className={`p-6 rounded-4xl bg-base-200 mb-4 ${neoInset}`}>
              
              
              <ThemeSelector 
                theme={theme} 
                onChangeTheme={(newTheme) => {
                    onChangeTheme(newTheme);
                    setIsExpanded(false);  // tự động đóng sau khi chọn
                }} 
              />
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}