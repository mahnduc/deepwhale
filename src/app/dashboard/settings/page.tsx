"use client";

import React from "react";
import { User, Pencil } from "lucide-react";

export default function UserIdentification() {
  return (
    <section className="border border-[#262626] p-8 relative overflow-hidden">

      <div className="flex flex-col items-center justify-center gap-6 mb-10 pt-12">
        <div className="relative flex flex-col items-center w-full">
          
          {/* Rectangular Cover Banner (Ảnh bìa chữ nhật dài) */}
          <div className="absolute -top-12 w-full h-32 z-0">
            {/* Lớp nền chữ nhật với hiệu ứng Scanline/Grid */}
            <div className="w-full h-full bg-[#050505] border border-[#262626] relative overflow-hidden">
              {/* Hiệu ứng Gradient mờ dần sang hai bên và phía dưới */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#00E5FF]/10 to-transparent" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Nút bấm để chỉnh sửa ảnh bìa riêng (nếu muốn) */}
              <button className="absolute top-2 right-2 p-1.5 border border-[#262626] text-[#262626] hover:text-[#00E5FF] hover:border-[#00E5FF] transition-all bg-black/50">
                <Pencil size={10} />
              </button>
            </div>
          </div>

          {/* Main Avatar Container */}
          <div className="relative z-10 mt-6">
            {/* Vòng đệm sáng phía sau Avatar để tách biệt với ảnh bìa */}
            <div className="absolute inset-0 rounded-full bg-black blur-md -z-10 scale-110" />
            
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-[#00E5FF] p-1 flex items-center justify-center overflow-visible bg-[#000000]">
              {/* Mockup Avatar Content */}
              <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center text-[#262626] hover:text-[#00E5FF] transition-colors overflow-hidden relative">
                <User size={64} strokeWidth={1} />
              </div>

              {/* Nút Pencil chính (Upload Avatar) */}
              <button 
                className="absolute bottom-1 right-1 bg-[#00E5FF] text-black p-2 rounded-full hover:bg-white transition-all shadow-[0_0_10px_rgba(0,229,255,0.3)] group z-20"
                title="Update_Avatar"
              >
                <Pencil size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Badge chỉ số trang trí */}
          <div className="absolute -top-16 flex justify-between w-full max-w-[500px] px-4 opacity-50">
            <span className="text-[8px] text-[#00E5FF] font-mono tracking-[0.2em] border-l border-[#00E5FF] pl-2">SYS_ID: 992-AD</span>
            <span className="text-[8px] text-[#00E5FF] font-mono tracking-[0.2em] border-r border-[#00E5FF] pr-2">SEC_AUTH: VERIFIED</span>
          </div>
        </div>

        {/* Thông tin phụ dưới Avatar */}
        <div className="text-center space-y-3 z-10">
          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase tracking-tighter text-[#00E5FF]">
              Vương Mạnh Đức
            </h2>
            <div className="flex items-center justify-center gap-2 text-[#717B7A]">
              <span className="h-[1px] w-8 bg-[#262626]"></span>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                System_Architect
              </span>
              <span className="h-[1px] w-8 bg-[#262626]"></span>
            </div>
          </div>

          {/* Bảng thông tin chi tiết */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-2 border-t border-[#262626]/50 max-w-xs mx-auto">
            <div className="text-right">
              <span className="text-[9px] text-[#717B7A] uppercase tracking-widest">User_ID:</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#DCE4E5] font-mono">UID-2026-0425</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#717B7A] uppercase tracking-widest">Access_Level:</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#00E5FF] font-bold uppercase">Root_Admin</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#717B7A] uppercase tracking-widest">Node_Location:</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#DCE4E5] uppercase">Hanoi_VN</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#717B7A] uppercase tracking-widest">Last_Sync:</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#DCE4E5] font-mono uppercase">22:26:09_UTC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}