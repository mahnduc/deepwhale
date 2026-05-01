"use client";

import Link from "next/link";
import { Home, RotateCcw, Lightbulb } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F9FB] p-6 font-['Nunito',sans-serif]">
      <div className="flex w-full max-w-md flex-col items-center text-center"> 
        <div className="relative mb-10 flex flex-col items-center justify-center">
          <span className="select-none text-[120px] font-extrabold leading-none text-[#B2BEC3]/30">
            404
          </span>
        </div>
        <div className="mb-10 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-[#2D3436]">
            Oops!!!
          </h1>
          <p className="mx-auto max-w-125 text-lg leading-relaxed text-[#636E72]">
            Có vẻ như bạn đã đi chệch khỏi lộ trình học tập rồi. Đừng lo, chúng ta cùng quay về nhé!
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:max-w-75">
          <Link 
            href="/" 
            className="group relative flex items-center justify-center gap-2 rounded-2xl border-b-4 border-[#D12A7E] bg-[#FF3399] px-8 py-4 text-lg font-bold text-white transition-all hover:brightness-105 active:translate-y-0.5 active:border-b-0"
          >
            <Home className="h-5 w-5" />
            VỀ TRANG CHỦ
          </Link>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 rounded-2xl px-8 py-3 text-base font-bold text-[#FF3399] transition-colors hover:bg-[#FFF0F7]"
          >
            <RotateCcw className="h-5 w-5" />
            Thử tải lại trang
          </button>
        </div>
      </div>
    </div>
  );
}