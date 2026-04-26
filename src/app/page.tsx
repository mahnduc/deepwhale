'use client';

import React from 'react';
import { 
  Search, 
  FileText, 
  Compass, 
  Activity, 
  Github, 
  Globe, 
  Download, 
  Cpu, 
  ChevronRight,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] font-mono text-[#D4D4D4] selection:bg-[#00E5FF] selection:text-black">
      
      {/* HEADER / NAV */}
      <nav className="border-b border-[#262626] h-16 flex items-center justify-between px-8 bg-[#000000] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-white font-black tracking-tighter uppercase text-sm">Hello World</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#717B7A]">
          <a href="#" className="hover:text-[#00E5FF] transition-colors">Features</a>
          <a href="#" className="hover:text-[#00E5FF] transition-colors">Source_Code</a>
          <a href="#" className="hover:text-[#00E5FF] transition-colors">Documentation</a>
        </div>
        <Link href="/dashboard">
        <button className="border border-[#00E5FF] text-[#00E5FF] px-4 py-1.5 text-[10px] uppercase font-bold hover:bg-[#00E5FF] hover:text-black transition-all">
          Bắt đầu ngay
        </button>
        </Link>
      </nav>

      <section className="max-w-[1400px] mx-auto p-6 lg:p-12 lg:pb-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 border border-[#262626] bg-[#000000] p-10 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden">
            
            {/* Nội dung bên trái */}
            <div className="relative z-10 lg:w-2/3">
              <div className="inline-block border border-[#006064] px-2 py-1 mb-6">
                <span className="text-[10px] text-[#00e5ffba] uppercase font-bold tracking-widest">Open tools</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-[0.9]">
                Kiến tạo tri thức <br /> 
                <span className="text-[#00E5FF]">Nâng tầm tương lai</span>
              </h1>
              <p className="max-w-xl text-sm md:text-base text-[#717B7A] leading-relaxed mb-8">
                Chúng tôi tin rằng học tập tốt nhất là học tập được thiết kế riêng cho bạn. Đó là lý do chúng tôi xây dựng công cụ mã nguồn mở này, nơi giúp bạn tạo ra hành trình học tập của riêng mình.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard">
                <button className="bg-[#00E5FF] text-black px-6 py-3 text-xs font-black uppercase flex items-center gap-2 hover:bg-white transition-all duration-300">
                  Bắt đầu ngay <ChevronRight size={14} />
                </button>
                </Link>
                <button className="border border-[#262626] text-white px-6 py-3 text-xs font-black uppercase hover:border-[#00E5FF] transition-all duration-300">
                  Xem mã nguồn
                </button>
              </div>
            </div>

            <div className="relative lg:w-1/3 w-full h-[300px] mt-12 lg:mt-0 flex items-center justify-center group">
              <div className="absolute inset-0 bg-[#00E5FF]/5 blur-[70px] rounded-full group-hover:bg-[#00E5FF]/10 transition-all duration-500"></div>
            
              <svg width="260" height="340" viewBox="0 0 260 340" xmlns="http://www.w3.org/2000/svg" className="relative z-10 opacity-90 drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]">
                <text
                  x="130"
                  y="85"
                  fontFamily="monospace"
                  fontSize="58"
                  fontWeight="bold"
                  fill="#006064"
                  textAnchor="middle"
                  letterSpacing="2"
                >
                  ,____,
                </text>

                <text x="130" y="155" fontFamily="monospace" fontSize="68" fontWeight="bold" fill="#00E5FF" textAnchor="middle" letterSpacing="1">
                  (O,O)
                </text>

                <text
                  x="130"
                  y="230"
                  fontFamily="monospace"
                  fontSize="68"
                  fontWeight="bold"
                  fill="#006064"
                  textAnchor="middle"
                  letterSpacing="1"
                >
                  /)__)
                </text>

                <text
                  x="130"
                  y="295"
                  fontFamily="monospace"
                  fontSize="50"
                  fontWeight="bold"
                  fill="#00E5FF"
                  textAnchor="middle"
                >
                  " "
                </text>
              </svg>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full border-l border-[#262626] opacity-20 pointer-events-none hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* 2. FULL WIDTH QUOTE SECTION (Tách biệt hoàn toàn khỏi Grid) */}
      <section className="w-full border-y border-[#262626] bg-[#050505] py-20 my-12 relative overflow-hidden group">
        {/* Background Decor */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent"></div>
           <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-[#00E5FF] to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          {/* Dấu Quote Mở - Căn trái trong container */}
          <div className="text-[#006064] mb-6 self-start transform -translate-x-4 md:-translate-x-12">
            <svg width="40" height="32" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H10V10H4C4 13.3137 6.68629 16 10 16V20C4.47715 20 0 15.5228 0 10V0Z" fill="currentColor"/>
              <path d="M14 0H24V10H18C18 13.3137 20.6863 16 24 16V20C18.4772 20 14 15.5228 14 10V0Z" fill="currentColor"/>
            </svg>
          </div>
          
          <h2 className="text-2xl md:text-5xl font-black text-white uppercase leading-tight tracking-[calc(-0.05em)] italic text-center">
            Kiến thức thuộc về mọi người, <br />
            <span className="text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">học tập thuộc về từng cá nhân.</span>
          </h2>

          {/* Dấu Quote Đóng - Căn phải trong container */}
          <div className="text-[#006064] mt-6 self-end transform translate-x-4 md:translate-x-12 rotate-180">
            <svg width="40" height="32" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0H10V10H4C4 13.3137 6.68629 16 10 16V20C4.47715 20 0 15.5228 0 10V0Z" fill="currentColor"/>
              <path d="M14 0H24V10H18C18 13.3137 20.6863 16 24 16V20C18.4772 20 14 15.5228 14 10V0Z" fill="currentColor"/>
            </svg>
          </div>

          <div className="mt-10 flex flex-col items-center">
             <p className="text-[10px] tracking-[0.5em] text-[#717B7A] uppercase font-bold mb-4">Và chúng tôi là cầu nối</p>
             <div className="h-px w-24 bg-[#00E5FF]"></div>
          </div>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto p-6 lg:p-12 lg:pt-0">
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          
          <div className="col-span-12 md:col-span-4 border border-[#262626] bg-[#000000] p-8 flex flex-col relative group overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#00E5FF] mb-4 font-bold ">Philosophy</p>
              <ul className="text-[11px] uppercase font-bold text-white space-y-3 tracking-tight">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF]"></div> Công cụ mã nguồn mở.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF]"></div> Tập trung vào người học.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF]"></div> Phát triển cùng cộng đồng.
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-[#00E5FF]"></div> Không thu thập dữ liệu.
                </li>
              </ul>
            </div>
          </div>

          {/* Features */}
          <div className="col-span-12 md:col-span-8 border border-[#262626] bg-[#000000] p-8 group">
            <div className="h-10 w-10 border border-[#262626] flex items-center justify-center mb-6 group-hover:border-[#00E5FF] transition-colors">
              <Search className="text-[#00E5FF]" size={18} />
            </div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-tighter text-xl">Tra cứu ngữ nghĩa_</h3>
            <p className="text-sm text-[#717B7A] leading-relaxed max-w-2xl">
              Hệ thống hiểu ý định và ngữ cảnh, tóm tắt kiến thức từ nguồn đáng tin cậy. Tìm kiếm sâu theo chủ đề thay vì chỉ dựa vào từ khóa.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 border border-[#262626] bg-[#000000] p-8 group">
            <div className="h-10 w-10 border border-[#262626] flex items-center justify-center mb-6 group-hover:border-[#00E5FF] transition-colors">
              <FileText className="text-[#00E5FF]" size={18} />
            </div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-tighter">Tạo trắc nghiệm_</h3>
            <p className="text-xs text-[#717B7A] leading-relaxed">
              Tự động hóa bộ câu hỏi từ PDF, văn bản. Hỗ trợ 4 lựa chọn, đúng/sai, ghép đôi kèm giải thích chi tiết cho từng đáp án.
            </p>
          </div>

          <div className="col-span-12 md:col-span-6 border border-[#262626] bg-[#000000] p-8 group">
            <div className="h-10 w-10 border border-[#262626] flex items-center justify-center mb-6 group-hover:border-[#00E5FF] transition-colors">
              <Compass className="text-[#00E5FF]" size={18} />
            </div>
            <h3 className="text-white font-bold uppercase mb-4 tracking-tighter">Lộ trình cá nhân_</h3>
            <p className="text-xs text-[#717B7A] leading-relaxed">
              Phân tích mục tiêu và trình độ hiện tại để tự động hóa danh sách bài học, tài liệu và bài tập thực hành phù hợp nhất.
            </p>
          </div>

          {/* Progress Tracking */}
          <div className="col-span-12 md:col-span-8 border border-[#262626] bg-[#000000] p-8 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={14} className="text-[#00E5FF]" />
                <span className="text-[10px] uppercase font-bold text-white tracking-widest">Monitoring_System</span>
              </div>
              <h3 className="text-2xl font-bold text-white uppercase mb-4 tracking-tighter italic">Theo dõi & Điều chỉnh</h3>
              <p className="text-xs text-[#717B7A] leading-relaxed">
                Hệ thống xác định điểm mạnh/yếu, đề xuất nội dung bổ sung và điều chỉnh độ khó theo tiến độ thực tế của bạn.
              </p>
            </div>
            <div className="w-full md:w-48 h-24 border border-[#262626] flex items-end p-2 gap-1">
              {[40, 70, 45, 90, 65, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-[#006064]" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          {/* Stats List */}
          <div className="col-span-12 md:col-span-4 border border-[#262626] bg-[#000000] p-8">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#00E5FF] mb-6 font-bold">Additional_Specs</h3>
            <ul className="space-y-4 text-[10px] uppercase font-bold text-[#D4D4D4]">
              <li className="flex items-center gap-3"><Globe size={12} className="text-[#006064]" /> Đa ngôn ngữ (VI/EN)</li>
              <li className="flex items-center gap-3"><Download size={12} className="text-[#006064]" /> Xuất PDF / Markdown</li>
              <li className="flex items-center gap-3"><Plus size={12} className="text-[#006064]" /> Tích hợp ghi chú</li>
            </ul>
          </div>

          {/* Audience Tags */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Học tập", "Chia sẻ kiến thức", "Cá nhân hóa"].map((tag) => (
              <div key={tag} className="border border-[#262626] bg-[#000000] p-6 text-center hover:border-[#00E5FF] transition-colors cursor-default">
                <span className="text-[10px] text-[#717B7A] uppercase">{tag}</span>
              </div>
            ))}
          </div>

          {/* Source Code CTA */}
          <div className="col-span-12 border border-[#262626] bg-[#006064]/10 p-12 text-center relative overflow-hidden">
            <Cpu className="mx-auto text-[#00E5FF] mb-6 relative z-10" size={32} />
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 relative z-10">Open_Source_Purity</h2>
            <p className="text-xs text-[#717B7A] max-w-lg mx-auto mb-8 uppercase tracking-widest relative z-10">
              Minh bạch – Có thể tự triển khai – Cộng đồng cùng phát triển
            </p>
            <button className="bg-[#00E5FF] text-black px-10 py-4 text-xs font-black uppercase flex items-center gap-3 mx-auto relative z-10">
              Access Repository <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-8 text-center">
        <p className="text-[10px] text-[#717B7A] uppercase tracking-[0.5em]">
          © 2026
        </p>
      </footer>
    </div>
  );
}