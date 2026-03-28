"use client";

import { useEffect, useState } from "react";
import { Palette, CheckCircle2, Monitor } from "lucide-react";

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", 
  "garden", "forest", "aqua", "lofi", "pastel", "fantasy", 
  "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", 
  "business", "acid", "lemonade", "night", "coffee", "winter",
];

function Settings() {
  const [theme, setTheme] = useState("coffee");

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  const handleChangeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 text-base-content transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-12">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-base-200 text-primary ${neoFlat}`}>
              <Palette size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Hệ thống Giao diện</h1>
          </div>
        </header>

        <section className={`rounded-[2.5rem] bg-base-200 p-8 ${neoFlat}`}>
          <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest italic opacity-70 text-primary">
                Chọn sắc thái
              </h2>
              <p className="text-[10px] font-medium opacity-40 mt-1">Đồng bộ shadow theo màu nền DaisyUI</p>
            </div>
            <div className={`px-4 py-2 rounded-full bg-base-200 flex items-center gap-2 text-[10px] font-bold ${neoInset}`}>
              <Monitor size={12} className="opacity-50" />
              CURRENT: <span className="uppercase text-primary">{theme}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => handleChangeTheme(t)}
                className={`
                  relative h-24 rounded-3xl p-4 transition-all duration-300 overflow-hidden
                  flex flex-col items-center justify-center gap-2
                  ${theme === t ? `${neoInset} bg-base-200` : `${neoFlat} bg-base-200 hover:scale-[1.02] ${neoPressed}`}
                `}
                data-theme={t} 
              >
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-accent shadow-sm"></div>
                </div>

                <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${theme === t ? 'text-primary' : 'opacity-60'}`}>
                  {t}
                </span>

                {theme === t && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle2 size={14} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Settings;