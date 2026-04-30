'use client';

import React from 'react';
import { 
  Search, 
  Compass, 
  Cpu, 
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function UpdatedLandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] font-['Nunito',sans-serif] text-[#2D3436] antialiased">
      
      {/* 1. HEADER / NAVIGATION - Tinh gọn chiều cao */}
      <nav className="h-16 flex items-center justify-between px-8 md:px-16 bg-white border-b-2 border-[#E5E5E5] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FF3399] rounded-xl flex items-center justify-center border-b-4 border-[#D12A7E]">
             <span className="text-white font-black text-base">H</span>
          </div>
          <span className="text-[#2D3436] font-extrabold text-xl tracking-tight hidden sm:block">Hello World</span>
        </div>
        
        <div className="hidden md:flex gap-10 text-[13px] font-bold text-[#B2BEC3]">
          <a href="#" className="hover:text-[#FF3399] transition-colors uppercase tracking-widest">Tính năng</a>
          <a href="#" className="hover:text-[#FF3399] transition-colors uppercase tracking-widest">Mã nguồn</a>
          <a href="#" className="hover:text-[#FF3399] transition-colors uppercase tracking-widest">Tài liệu</a>
        </div>

        <Link href="/dashboard">
          <button className="bg-[#FF3399] text-white px-5 py-2 rounded-xl text-[13px] font-extrabold border-b-4 border-[#D12A7E] hover:brightness-105 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-wider">
            Bắt đầu
          </button>
        </Link>
      </nav>

      {/* 2. HERO SECTION - Cân đối lại tỉ lệ 7/12 và 5/12 */}
      <section className="max-w-[1100px] mx-auto px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-7/12 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#FFF0F7] border-2 border-[#FF3399] px-3 py-0.5 rounded-full mb-5 shadow-[0_2px_0_0_#FF3399]">
              <Sparkles size={12} className="text-[#FF3399]" />
              <span className="text-[10px] text-[#FF3399] font-black uppercase tracking-wider">Nền tảng mở 100%</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-[800] text-[#2D3436] mb-6 leading-[1.1] tracking-tight">
              Kiến tạo tri thức <br /> 
              <span className="text-[#FF3399] relative inline-block">
                Nâng tầm tương lai
                <div className="absolute -bottom-1 left-0 w-full h-2 bg-[#00CEC9]/20 -z-10 rounded-full"></div>
              </span>
            </h1>
            
            <p className="max-w-lg text-[15px] lg:text-[16px] font-semibold text-[#B2BEC3] leading-relaxed mb-8 mx-auto lg:mx-0">
              Chúng tôi tin rằng học tập tốt nhất là khi được thiết kế riêng. Công cụ mã nguồn mở giúp bạn làm chủ hành trình tri thức của chính mình.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/dashboard">
                <button className="h-12 px-8 bg-[#FF3399] text-white rounded-xl font-black text-xs uppercase tracking-widest border-b-4 border-[#D12A7E] hover:brightness-105 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2">
                  Học ngay bây giờ <ChevronRight size={18} strokeWidth={3} />
                </button>
              </Link>
              <button className="h-12 px-8 bg-white text-[#2D3436] rounded-xl font-black text-xs uppercase tracking-widest border-2 border-[#E5E5E5] border-b-4 hover:bg-[#F7F9FB] active:border-b-0 active:translate-y-1 transition-all">
                Xem mã nguồn
              </button>
            </div>
          </div>

          {/* Illustration Area - Thu gọn kích thước để cân bằng Desktop */}
          <div className="lg:w-5/12 w-full relative flex justify-center items-center">
             <div className="relative w-64 h-64 md:w-80 md:h-80">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF3399] rounded-[24px] border-b-[6px] border-[#D12A7E] flex items-center justify-center animate-bounce duration-[3000ms]">
                  <Zap size={36} className="text-white" fill="currentColor" />
                </div>
                <div className="absolute bottom-4 left-0 w-32 h-32 bg-white border-2 border-[#E5E5E5] border-b-[6px] rounded-[32px] flex flex-col items-center justify-center p-4 shadow-xl">
                  <div className="w-10 h-10 bg-[#00CEC9] rounded-full mb-3 border-b-4 border-[#00A8A3]"></div>
                  <div className="w-full h-2 bg-[#E5E5E5] rounded-full mb-2"></div>
                  <div className="w-2/3 h-2 bg-[#E5E5E5] rounded-full"></div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#00CEC9]/5 rounded-full -z-10 blur-3xl"></div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. PHILOSOPHY / QUOTE - Giảm padding dọc */}
      <section className="bg-white border-y-2 border-[#E5E5E5] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-[800] text-[#2D3436] leading-tight tracking-tight">
            “Kiến thức thuộc về mọi người, <br />
            <span className="text-[#00CEC9]">học tập thuộc về từng cá nhân.”</span>
          </h2>
        </div>
      </section>

      {/* 4. FEATURES GRID - Tối ưu Bento cho Desktop */}
      <main className="max-w-[1100px] mx-auto p-8 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          <div className="md:col-span-4 bg-[#2D3436] rounded-[24px] p-6 border-b-[6px] border-black text-white flex flex-col justify-between min-h-[280px]">
            <div>
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#00CEC9] mb-4">Philosophy</p>
              <h3 className="text-xl font-[800] mb-4">Tại sao là mã nguồn mở?</h3>
              <ul className="space-y-3 font-bold text-[#B2BEC3] text-[13px]">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00CEC9]"></div> Quyền sở hữu dữ liệu</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00CEC9]"></div> Không có phí ẩn</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#00CEC9]"></div> Tùy chỉnh vô hạn</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-8 bg-white border-2 border-[#E5E5E5] border-b-[6px] rounded-[24px] p-8 hover:border-[#FF3399] transition-all group cursor-pointer">
            <div className="h-12 w-12 bg-[#FFF0F7] rounded-xl flex items-center justify-center mb-6 border-b-2 border-[#FF3399]/20 group-hover:scale-110 transition-transform">
              <Search className="text-[#FF3399]" size={24} strokeWidth={3} />
            </div>
            <h3 className="text-xl font-[800] text-[#2D3436] mb-3">Tra cứu ngữ nghĩa</h3>
            <p className="text-[#636E72] font-semibold leading-relaxed text-[15px]">
              Tìm kiếm sâu theo chủ đề thay vì chỉ dựa vào từ khóa. Hệ thống hiểu ngữ cảnh và tóm tắt kiến thức từ nguồn đáng tin cậy nhất của bạn.
            </p>
          </div>

          <div className="md:col-span-7 bg-white border-2 border-[#E5E5E5] border-b-[6px] rounded-[24px] p-8 flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1">
              <div className="inline-block px-2.5 py-0.5 bg-[#F0FFFE] border-2 border-[#00CEC9] rounded-lg mb-3">
                <span className="text-[10px] font-black text-[#00CEC9] uppercase tracking-wider italic">Smart Sync</span>
              </div>
              <h3 className="text-xl font-[800] text-[#2D3436] mb-3">Theo dõi & Điều chỉnh</h3>
              <p className="text-[#636E72] font-semibold text-[14px]">
                Xác định điểm mạnh/yếu theo thời gian thực và đề xuất nội dung bổ sung phù hợp với bạn.
              </p>
            </div>
            <div className="w-full sm:w-40 flex items-end justify-between h-20 bg-[#F7F9FB] rounded-xl p-3 border-2 border-[#E5E5E5]">
              {[40, 70, 45, 90, 65, 80].map((h, i) => (
                <div key={i} className="w-3 bg-[#FF3399] rounded-t-full border-b-2 border-[#D12A7E]" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 bg-white border-2 border-[#E5E5E5] border-b-[6px] rounded-[24px] p-8">
            <div className="h-12 w-12 bg-[#00CEC9]/10 rounded-xl flex items-center justify-center mb-5">
              <Compass className="text-[#00CEC9]" size={24} strokeWidth={3} />
            </div>
            <h3 className="text-lg font-[800] text-[#2D3436] mb-2">Lộ trình cá nhân</h3>
            <p className="text-[#636E72] font-semibold text-[13px]">
              Tự động hóa danh sách bài học và tài liệu phù hợp nhất với trình độ hiện tại.
            </p>
          </div>

        </div>
      </main>

      {/* 5. CALL TO ACTION - Thu nhỏ padding Desktop */}
      <section className="max-w-[1100px] mx-auto px-8 pb-20">
        <div className="bg-[#FF3399] rounded-[32px] p-12 md:p-16 text-center relative overflow-hidden border-b-[10px] border-[#D12A7E]">
          <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
            <Cpu size={240} className="text-white" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-[900] text-white mb-6 relative z-10 leading-tight">
            Sẵn sàng để làm chủ tri thức?
          </h2>
          
          <div className="flex justify-center relative z-10">
            <button className="h-14 px-10 bg-white text-[#FF3399] rounded-xl font-black text-xs uppercase tracking-widest border-b-4 border-[#E5E5E5] hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3">
              Ghé thăm GitHub <ArrowUpRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER - Tinh giản */}
      <footer className="py-12 text-center bg-white border-t-2 border-[#E5E5E5]">
        <p className="text-[10px] text-[#B2BEC3] font-black uppercase tracking-[0.3em]">
          © 2026 — Mạnh Đức
        </p>
      </footer>
    </div>
  );
}