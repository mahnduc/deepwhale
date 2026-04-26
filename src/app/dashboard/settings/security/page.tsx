"use client";

import React, { useState } from "react";

export default function SecuritySettings() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <section className="border border-[#262626] p-8 relative">
        <h2 className="absolute -top-3 left-6 bg-[#000000] px-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">
          Auth_Protocols
        </h2>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="text-sm font-bold uppercase text-[#DCE4E5]">Update_Password</h3>
              <p className="text-[10px] text-[#717B7A] uppercase mt-2 leading-relaxed">
                Ensure your credentials follow high-entropy requirements. Minimum 12 characters.
              </p>
            </div>
            
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] text-[#717B7A] uppercase tracking-widest">Current_Key</label>
                <input 
                  type="password" 
                  className="w-full bg-black border border-[#262626] px-4 py-3 text-sm focus:border-[#00E5FF] outline-none transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] text-[#717B7A] uppercase tracking-widest">New_Entry_Key</label>
                  <input 
                    type="password" 
                    className="w-full bg-black border border-[#262626] px-4 py-3 text-sm focus:border-[#00E5FF] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-[#717B7A] uppercase tracking-widest">Verify_New_Key</label>
                  <input 
                    type="password" 
                    className="w-full bg-black border border-[#262626] px-4 py-3 text-sm focus:border-[#00E5FF] outline-none transition-all"
                  />
                </div>
              </div>
              <button className="px-6 py-2 bg-transparent border border-[#00E5FF] text-[#00E5FF] text-[10px] font-bold uppercase tracking-widest hover:bg-[#00E5FF] hover:text-black transition-all">
                Update_Credentials
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-[#262626] p-8 relative">
        <h2 className="absolute -top-3 left-6 bg-[#000000] px-2 text-[10px] font-bold text-[#00E5FF] uppercase tracking-[0.2em]">
          Tùy chỉnh
        </h2>
      </section>
    </div>
  );
}