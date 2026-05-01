"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Lock, ArrowRight, HelpCircle } from 'lucide-react'; // Sử dụng Lucide Icons theo đặc tả

export default function AuthenticationPage() {
  const [pin, setPin] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FB] font-['Nunito',_sans-serif]">
      {/* BÊN TRÁI: LỜI CHÀO (Hero Section) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#FF3399] to-[#00CEC9] items-center justify-center p-16 relative overflow-hidden">
        {/* Trang trí phía sau */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white opacity-10 rounded-full" />
        <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-black opacity-5 rounded-full" />
        
        <div className="max-w-md z-10 text-white">
          <div className="bg-white/20 w-fit p-3 rounded-2xl mb-8">
          </div>
          <h1 className="text-[32px] font-[800] leading-[1.2] mb-6">
            Chào mừng quay trở lại, <br />
            <span className="text-white drop-shadow-md">Mạnh Đức!</span>
          </h1>
          <p className="text-[16px] font-[400] opacity-90 leading-relaxed">
            Hôm nay bạn đã sẵn sàng để chinh phục những kiến thức mới chưa? 
            Hãy nhập mã PIN để tiếp tục hành trình nhé!
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          {/* Card Container */}
          <div className="bg-white border-[1.5px] border-[#F0F0F0] rounded-[24px] p-8 shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F7F9FB] rounded-full mb-4">
                <Lock className="text-[#FF3399]" size={28} />
              </div>
              <h2 className="text-[24px] font-[700] text-[#2D3436]">Xác nhận mã PIN</h2>
              <p className="text-[13px] text-[#B2BEC3] mt-2">Nhập 6 con số bí mật của bạn</p>
            </div>

            {/* PIN Input Group */}
            <div className="flex justify-between gap-2 mb-10">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  type="password"
                  maxLength={1}
                  value={digit}
                  // ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-xl font-bold text-[#2D3436] bg-white border-[1.5px] border-[#B2BEC3] rounded-[8px] focus:border-[#FF3399] focus:ring-2 focus:ring-[#FF3399]/10 outline-none transition-all"
                />
              ))}
            </div>

            {/* Button Primary - Duolingo Style Physical Shadow */}
            <button
              onClick={() => alert(`Mã PIN: ${pin.join("")}`)}
              className="group relative w-full h-[56px] bg-[#FF3399] border-b-[4px] border-[#D12A7E] active:border-b-0 active:translate-y-[2px] rounded-[24px] transition-all duration-[80ms] flex items-center justify-center"
            >
              <span className="text-white font-[700] text-[17px] flex items-center gap-2">
                ĐĂNG NHẬP <ArrowRight size={20} />
              </span>
            </button>

            {/* Ghost Button */}
            <button className="w-full mt-6 py-2 text-[15px] font-[600] text-[#B2BEC3] hover:text-[#FF3399] transition-colors flex items-center justify-center gap-2">
              <HelpCircle size={18} />
              Quên mã PIN?
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}