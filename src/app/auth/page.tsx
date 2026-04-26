'use client';

import React from 'react';
import { 
  ChevronRight, 
  Lock,
  Fingerprint,
  ShieldCheck,
  Cpu,
  Globe,
  Key
} from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black font-mono text-white flex flex-col items-center justify-center p-4 selection:bg-[#00E5FF] selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00E5FF]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00E5FF]/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00E5FF 1px, transparent 1px), linear-gradient(90deg, #00E5FF 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      </div>
      <div className="w-full max-w-[450px] border border-[#262626] bg-[#050505]/80 backdrop-blur-md p-10 relative group transition-all hover:border-[#00E5FF]/30">
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00E5FF] opacity-30 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00E5FF] opacity-30 group-hover:opacity-100 transition-opacity"></div>
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-[#262626] mb-4 group-hover:border-[#00E5FF] transition-colors">
            <Key size={24} className="text-[#00E5FF]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
            Authenticate<span className="text-[#00E5FF] animate-pulse">_</span>
          </h1>
          <p className="text-[10px] text-[#717B7A] uppercase tracking-[0.3em]">
            Secure Access Terminal
          </p>
        </div>

        {/* Form Section */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="text-[10px] text-[#00E5FF] uppercase font-bold tracking-widest ml-1">Identifier</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#262626] text-xs font-bold">ID:</span>
              <input 
                type="text" 
                placeholder="USER_CORE_01" 
                className="w-full bg-black border border-[#262626] p-3 pl-12 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-all placeholder:text-[#1A1A1A]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-[#00E5FF] uppercase font-bold tracking-widest">Security_Key</label>
              <button type="button" className="text-[9px] text-[#262626] hover:text-[#00E5FF] transition-colors uppercase font-bold">Lost Key?</button>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#262626]" />
              <input 
                type="password" 
                placeholder="••••••••••••" 
                className="w-full bg-black border border-[#262626] p-3 pl-12 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-4">
            <button className="w-full bg-[#00E5FF] text-black font-black py-4 text-xs uppercase flex items-center justify-center gap-3 hover:bg-[#80F2FF] transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              Establish_Connection <ChevronRight size={16} />
            </button>
          </div>
        </form>

      </div>

      {/* Decorative Bottom Left Info */}
      <div className="fixed bottom-8 left-8 p-4 border-l border-[#262626] hidden md:block">
        <div className="text-[10px] uppercase text-[#717B7A] tracking-tighter leading-tight">
          Current_IP: 192.168.0.254<br />
          Location: Sector_04<br />
          Status: Awaiting_Auth
        </div>
      </div>

      {/* Background Decorative Text (Ảnh 2) */}
      <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-20">
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-[0.5em] text-[#717B7A]">_Authenticate</p>
          <p className="text-xl font-black text-[#FFFFFF] italic uppercase tracking-tighter">Hello World</p>
        </div>
      </div>
    </div>
  );
}