"use client";

import { CheckCircle2 } from "lucide-react";
import { themes, Theme } from "@/app/settings/theme";

type Props = {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
};

export default function ThemeSelector({ theme, onChangeTheme }: Props) {
  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => onChangeTheme(t)}
          data-theme={t}
          className={`
            relative h-24 rounded-3xl p-4 transition-all duration-300 overflow-hidden
            flex flex-col items-center justify-center gap-2
            ${theme === t 
              ? `${neoInset} bg-base-200` 
              : `${neoFlat} bg-base-200 hover:scale-[1.02] ${neoPressed}`
            }
          `}
        >
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <div className="w-3 h-3 rounded-full bg-accent"></div>
          </div>

          <span className={`text-[10px] font-black uppercase tracking-tighter ${
            theme === t ? "text-primary" : "opacity-60"
          }`}>
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
  );
}