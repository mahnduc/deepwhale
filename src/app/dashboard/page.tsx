'use client';

import React, { useState } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Flame,
  Zap,
  HardDrive,
  ArrowUpRight,
  FileCode,
  FolderOpen,
  FileJson,
  FileText,
} from "lucide-react";
import Link from 'next/link';

export default function HomePage() {
  const [today] = useState(new Date());

  // Tính toán lịch thực tế
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDate = today.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'short' }).toUpperCase();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-700">
      {/* Grid chính - Tận dụng 12 cột */}
      <div className="grid grid-cols-12 gap-6 grid-flow-dense">
        
        {/* 1. WEEKLY ACTIVITY (8 CỘT) */}
        <div className="col-span-12 lg:col-span-8 min-h-[240px] border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col group hover:border-[#333] transition-all">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-3 bg-[#00E5FF]"></div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F5]">Activity_Log</h2>
            </div>
            <span className="text-[10px] font-mono text-[#717B7A]">{monthName} / {currentYear}</span>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-3">
            {[40, 60, 100, 30, 55, 10, 20].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group/bar h-full justify-end">
                <div 
                  className={`w-full max-w-[45px] transition-all duration-700 ease-out ${h === 100 ? 'bg-[#00E5FF]' : 'bg-[#1a1a1a] group-hover/bar:bg-[#262626]'}`} 
                  style={{ height: `${h}%` }} 
                />
                <span className="text-[9px] mt-4 text-[#444] uppercase font-mono group-hover/bar:text-[#717B7A]">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. STREAK (4 CỘT) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 min-h-[240px] border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col justify-center items-center relative overflow-hidden group">
          <Zap size={100} className="absolute -top-6 -right-6 text-[#00E5FF] opacity-5 group-hover:opacity-10 transition-all duration-1000 rotate-12" />
          
          <h3 className="text-[10px] text-[#717B7A] uppercase tracking-widest mb-4">Current_Streak</h3>
          <div className="flex items-center gap-4">
            <p className="text-7xl font-bold text-[#F5F5F5] tracking-tighter italic">36</p>
            <div className="flex flex-col">
              <Flame size={28} className="text-[#00E5FF] animate-pulse" />
              <span className="text-[10px] text-[#00E5FF] font-bold font-mono">DAYS</span>
            </div>
          </div>
          <div className="mt-6 w-full max-w-[120px] bg-[#1a1a1a] h-[2px]">
            <div className="bg-[#00E5FF] h-full w-3/4 shadow-[0_0_8px_#00E5FF]"></div>
          </div>
        </div>

        {/* 3. OPFS EXPLORER (5 CỘT) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-5 min-h-[240px] border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col justify-between group relative overflow-hidden">
          
          <div className="absolute top-12 right-6 flex flex-col gap-3 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
            <FileCode size={40} className="translate-x-4 rotate-12" />
            <FileJson size={32} className="-translate-x-2 -rotate-12" />
            <FileText size={48} className="translate-x-6 rotate-6" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#757A7B]">Storage_Interface</h2>
            </div>

            <h3 className="text-xl font-bold text-[#F5F5F5] mb-3 uppercase tracking-tight">
              <span className="text-[#00E5FF]">OPFS</span> Explorer
            </h3>
            
            <div className="flex items-start gap-3">
              <FolderOpen size={18} className="text-[#717B7A] mt-0.5 shrink-0" />
              <p className="text-[#717B7A] text-[11px] leading-relaxed font-mono">
                Hệ thống lưu trữ tệp tin riêng tư cục bộ. Tối ưu hóa cho các thao tác đọc/ghi tệp tin lớn với độ trễ cực thấp.
              </p>
            </div>
          </div>

          <Link href="/dashboard/opfs-explorer" className="relative z-10 mt-6">
            <button className="w-full flex items-center justify-between bg-transparent border border-[#262626] group-hover:border-[#00E5FF] group-hover:text-[#00E5FF] p-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 overflow-hidden relative">
              <span className="relative z-10 flex items-center gap-2">
                <FileCode size={14} />
                Mở trình quản lý
              </span>
              <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-[#00E5FF]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </Link>
        </div>

        {/* 4. CREATE COURSE (4 CỘT) */}
        <div className="col-span-12 md:col-span-7 lg:col-span-4 min-h-[280px] border border-[#262626] bg-[#0A0A0A] p-6 flex flex-col justify-between group cursor-pointer hover:border-[#00E5FF]/40 transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 blur-[60px] group-hover:bg-[#00E5FF]/10 transition-all"></div>
          {/* PHẦN TRÊN: Header của Card */}
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col gap-1">
              
              <div className="h-[2px] w-8 bg-[#00E5FF]"></div>
            </div>
            <ArrowUpRight size={18} className="text-[#262626] group-hover:text-[#00E5FF] transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
          <div className="flex-1 flex items-center justify-center py-4 relative">
            {/* SVG được lồng vào giữa, điều chỉnh scale khi hover */}
            <div className="transform group-hover:scale-110 transition-transform duration-500 ease-out">
              <svg width="140" height="180" viewBox="0 0 260 340" xmlns="http://www.w3.org/2000/svg" className="relative z-10 opacity-80 group-hover:opacity-100 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all">
                <text x="130" y="85" fontFamily="monospace" fontSize="58" fontWeight="bold" fill="#006064" textAnchor="middle" letterSpacing="2">
                  ,____,
                </text>
                <text x="130" y="155" fontFamily="monospace" fontSize="68" fontWeight="bold" fill="#00E5FF" textAnchor="middle" letterSpacing="1">
                  (O,O)
                </text>
                <text x="130" y="230" fontFamily="monospace" fontSize="68" fontWeight="bold" fill="#006064" textAnchor="middle" letterSpacing="1">
                  /)__)
                </text>
                <text x="130" y="295" fontFamily="monospace" fontSize="50" fontWeight="bold" fill="#00E5FF" textAnchor="middle">
                  " "
                </text>
              </svg>
            </div>

            {/* Hiệu ứng tia sáng quét qua khi hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00E5FF]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-end justify-between border-t border-[#262626] pt-4 group-hover:border-[#00E5FF]/20 transition-colors">
              <div>
                <h3 className="text-sm font-black text-[#F5F5F5] uppercase tracking-[0.2em] group-hover:text-[#00E5FF] transition-colors">
                  Tra cứu và tạo Quizze
                </h3>
                <p className="text-[9px] text-[#717B7A] font-mono mt-1 uppercase tracking-tighter">
                  Bắt đầu
                </p>
              </div>
              
              <Link href="/dashboard/courses/create">
              <div className="w-8 h-8 rounded-full border border-[#262626] flex items-center justify-center group-hover:border-[#00E5FF] group-hover:bg-[#00E5FF]/10 transition-all">
                <Plus size={16} className="text-[#717B7A] group-hover:text-[#00E5FF]" />
              </div>
              </Link>
            </div>
          </div>
        </div>
        {/* 5. CALENDAR (3 CỘT) */}
        <div className="col-span-12 md:col-span-5 lg:col-span-3 min-h-[240px] border border-[#262626] bg-[#0A0A0A] p-5 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#F5F5F5]">{monthName}</h2>
            <CalendarIcon size={14} className="text-[#00E5FF]" />
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-[9px] text-center mb-4">
            {['SUN', 'MON', 'TUE', 'WED', 'THUS', 'FRI', 'SAT'].map(d => (
              <span key={d} className="text-[#444] font-bold pb-2">{d}</span>
            ))}
            {blanks.map(b => <div key={`b-${b}`} className="py-1" />)}
            {days.map(d => (
              <div 
                key={d} 
                className={`py-1 text-[10px] transition-all font-mono
                  ${d === currentDate 
                    ? 'bg-[#00E5FF] text-black font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]' 
                    : 'text-[#717B7A] hover:text-[#F5F5F5]'
                  }`}
              >
                {d}
              </div>
            ))}
          </div>
          
          <div className="mt-auto flex justify-between items-center text-[8px] text-[#444] border-t border-[#1a1a1a] pt-3">
            <span>SYNC_STATUS</span>
            <span className="text-[#00E5FF] font-bold animate-pulse">ONLINE</span>
          </div>
        </div>

      </div>
    </div>
  );
}