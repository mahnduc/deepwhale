"use client";

import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-6 bg-black">
      <div className="max-w-md w-full flex flex-col items-center">
        
        {/* Visual Element: Con số 404 lớn và mỏng theo phong cách Editorial */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] font-black leading-none tracking-tighter text-[#111] select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-[1px] w-full bg-[#262626] absolute top-1/2 -translate-y-1/2"></div>
             <span className="bg-black px-4 text-[#FFC5B3] font-epilogue uppercase tracking-[0.5em] text-xs font-bold z-10">
               Lost in Latent Space
             </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 mb-12 text-center">
          <h2 className="text-2xl font-bold font-epilogue text-[#F3F4F6] uppercase tracking-tight">
            Nút giao tri thức bị ngắt kết nối
          </h2>
          <p className="text-[#8B8B8B] font-body-md max-w-[320px] mx-auto leading-relaxed text-sm">
            Tài liệu bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang một phân vùng dữ liệu khác.
          </p>
        </div>

        {/* Action Buttons: Tối giản với outline và màu Peach */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 py-3 px-8 border border-[#FFC5B3] text-[#FFC5B3] hover:bg-[#FFC5B3] hover:text-black transition-all duration-300 text-[11px] uppercase tracking-widest font-bold font-epilogue"
          >
            <Compass size={14} />
            Quay lại trang chủ
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 py-3 px-8 border border-[#262626] text-[#8B8B8B] hover:text-[#F3F4F6] hover:border-[#F3F4F6] transition-all duration-300 text-[11px] uppercase tracking-widest font-bold font-epilogue"
          >
            <ArrowLeft size={14} />
            Quay lại
          </button>
        </div>

        {/* Footer decoration */}
        <div className="mt-20 flex items-center gap-4 opacity-20">
          <div className="w-12 h-[1px] bg-[#262626]"></div>
          <span className="text-[9px] uppercase tracking-[0.3em]">DeepWhale Intelligence System</span>
          <div className="w-12 h-[1px] bg-[#262626]"></div>
        </div>

      </div>
    </div>
  );
}