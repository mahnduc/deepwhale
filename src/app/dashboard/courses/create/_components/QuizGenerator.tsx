"use client";

import React, { useState } from "react";
import { BrainCircuit, Sparkles, Settings2, Zap } from "lucide-react";

export default function QuizGenerator() {
  const [config, setConfig] = useState({
    amount: 10,
    difficulty: "Medium",
    type: "Multiple Choice"
  });

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#111] pb-6">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tighter text-[#00E5FF] flex items-center gap-2">
            <BrainCircuit size={20} /> Quiz_Generation_Protocol
          </h2>
          <p className="text-[10px] text-[#444] uppercase mt-1">Sử dụng AI để chuyển đổi tri thức thành bộ câu hỏi trắc nghiệm</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#00E5FF]/5 border border-[#00E5FF]/20">
          <Sparkles size={12} className="text-[#00E5FF]" />
          <span className="text-[9px] font-bold text-[#00E5FF]">AI_READY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cấu hình bên trái */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-6 border border-[#111] bg-[#050505] space-y-6">
            <div className="flex items-center gap-2 text-[#717B7A]">
              <Settings2 size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Configuration</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] text-[#444] uppercase mb-2 block">Số lượng câu hỏi</label>
                <input 
                  type="number" 
                  value={config.amount}
                  onChange={(e) => setConfig({...config, amount: parseInt(e.target.value)})}
                  className="w-full bg-black border border-[#1a1a1a] p-2 text-xs text-[#DCE4E5] focus:border-[#00E5FF] outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[9px] text-[#444] uppercase mb-2 block">Độ khó hệ thống</label>
                <select className="w-full bg-black border border-[#1a1a1a] p-2 text-xs text-[#DCE4E5] focus:border-[#00E5FF] outline-none">
                  <option>Easy_Level</option>
                  <option>Medium_Level</option>
                  <option>Hard_Protocol</option>
                </select>
              </div>
            </div>

            <button className="w-full py-4 bg-transparent border border-[#00E5FF] text-[#00E5FF] font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#00E5FF] hover:text-black transition-all group flex items-center justify-center gap-2">
              <Zap size={14} className="group-hover:fill-current" />
              Generate_Quiz
            </button>
          </div>
        </div>

        {/* Preview bên phải */}
        <div className="lg:col-span-2 border border-[#111] bg-[#050505] relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/20 to-transparent" />
          <div className="text-center space-y-3 opacity-20">
             <BrainCircuit size={48} className="mx-auto" />
             <p className="text-[10px] uppercase tracking-[0.2em]">Chưa có dữ liệu Preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}