"use client";

import React from "react";

interface TaskFullViewContentProps {
  isProcessing: boolean;
  children: React.ReactNode;
}

export const TaskMainContent = ({
  isProcessing,
  children,
}: TaskFullViewContentProps) => {
  return (
    <main className="flex-1 flex flex-col p-6 md:p-10 relative overflow-y-auto custom-scrollbar bg-black">
      {/* Background Decor: Số 01 mờ phía sau tạo cảm giác công nghệ */}
      <span className="fixed right-10 bottom-10 text-[20vw] font-black text-white/[0.02] select-none pointer-events-none">
        CORE
      </span>

      <div className="max-w-7xl w-full mx-auto relative z-10">
        {/* NỘI DUNG CHÍNH */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>

        {/* HIỆU ỨNG KHI HỆ THỐNG ĐANG XỬ LÝ TỔNG THỂ */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
            <div className="flex flex-col items-center gap-4 bg-black p-8 border border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              <div className="w-10 h-10 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1 text-center">
                <p className="text-xs font-bold text-[#00E5FF] uppercase tracking-[0.3em]">System_Processing</p>
                <p className="text-[9px] text-[#717B7A] uppercase">Vui lòng đợi trong giây lát...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};