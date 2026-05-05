import { Menu, MessageSquare, Sparkles, X } from "lucide-react";
import { useState } from "react";

export default function LeftSidebar() {
  const [leftOpen, setLeftOpen] = useState(false);
  return (
    <>
      {/* Nút Toggle Sidebar Trái */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button 
          onClick={() => setLeftOpen(!leftOpen)}
          className="p-2 bg-white border-2 border-b-4 border-[#E5E5E5] rounded-xl text-[#2D3436] hover:bg-[#F7F7F7] transition-all active:border-b-0 active:translate-y-1"
        >
          {leftOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
        </button>
      </div>

      {/* SIDEBAR TRÁI - Lịch sử */}
      <aside 
        className={`absolute top-0 left-0 h-full z-40 bg-white border-r-2 border-[#E5E5E5] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-72 
        ${leftOpen ? 'translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.05)]' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-6 pt-7">
          <div className="flex items-center gap-2 mb-8 px-2 pl-10">
            <h3 className="font-extrabold text-[#B2BEC3] uppercase text-[13px] tracking-wider">Lịch sử học tập</h3>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="p-4 bg-[#E1F5FE] border-2 border-b-4 border-[#00CEC9] rounded-2xl flex items-center gap-3 transition-all transform active:scale-95 cursor-pointer">
              <div className="w-10 h-10 bg-[#00CEC9] rounded-xl flex items-center justify-center text-white shadow-sm">
                <MessageSquare size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px]">Thiết kế UI</span>
                <span className="text-[11px] font-bold text-[#00A8A3] uppercase tracking-tighter">Đang học tập</span>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t-2 border-[#F0F0F0]">
            <button 
              className="w-full py-4 bg-[#FF3399] text-white font-extrabold rounded-2xl border-b-4 border-[#D12A7E] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              <Sparkles size={18} fill="currentColor" /> Bài học mới
            </button>
          </div>
        </div>
      </aside>

      {(leftOpen) && (
        <div 
          className="absolute inset-0 bg-black/10 z-30 md:hidden backdrop-blur-[2px]" 
          onClick={() => {setLeftOpen(false);}}
        />
      )} 
    </>
  )
}