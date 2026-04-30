"use client";

import React from "react";
import { User, Pencil } from "lucide-react";

export default function UserIdentification() {
  return (
    <section className="bg-white border-[1.5px] border-[#F0F0F0] rounded-[24px] p-8 mb-8 shadow-[0_2px_0_0_rgba(0,0,0,0.08)] relative overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-6">
        
        {/* Avatar Container */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-[1.5px] border-[#F0F0F0] p-1 bg-white">
            <div className="w-full h-full rounded-full bg-[#F7F9FB] flex items-center justify-center text-[#B2BEC3] overflow-hidden relative group">
              <User size={64} />
            </div>
          </div>

          {/* Nút Edit Avatar - Duolingo Style */}
          <button 
            className="absolute bottom-1 right-1 bg-[#FF3399] text-white p-2.5 rounded-full border-b-4 border-[#D12A7E] active:border-b-0 active:translate-y-[2px] transition-all"
            title="Update Avatar"
          >
            <Pencil size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Thông tin User */}
        <div className="text-center space-y-2">
          <h2 className="text-[24px] font-[800] text-[#2D3436] leading-tight">
            Vương Mạnh Đức
          </h2>
          <div className="inline-block bg-[#F0F0F5] px-3 py-1 rounded-full">
            <span className="text-[12px] font-[600] text-[#2D3436] uppercase tracking-wide">
              System Architect
            </span>
          </div>
        </div>

        {/* Bảng thông tin chi tiết */}
        <div className="w-full max-w-sm grid grid-cols-2 gap-4 py-4 border-t border-[#F0F0F0] mt-2">
          <div className="text-right">
            <span className="text-[13px] text-[#B2BEC3] font-[400]">User ID:</span>
          </div>
          <div className="text-left">
            <span className="text-[13px] text-[#2D3436] font-[600]">UID-2026-0425</span>
          </div>
          <div className="text-right">
            <span className="text-[13px] text-[#B2BEC3] font-[400]">Node:</span>
          </div>
          <div className="text-left">
            <span className="text-[13px] text-[#2D3436] font-[600]">Hanoi, VN</span>
          </div>
        </div>

        {/* Progress Bar giả định (Học tập) */}
        <div className="w-full bg-[#E8ECF0] h-[12px] rounded-full overflow-hidden mt-2">
          <div 
            className="bg-[#00CEC9] h-full rounded-full w-[65%]" 
            style={{ transition: 'width 0.3s ease' }}
          />
        </div>
        <p className="text-[12px] text-[#B2BEC3] font-[600]">65% Profile Completed</p>
      </div>
    </section>
  );
}