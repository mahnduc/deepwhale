"use client";

import React, { useState, useRef } from "react";

export default function SecuritySettings() {
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Xử lý nhập PIN
  const handlePinChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // Tự động focus ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Xử lý xóa (Backspace)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 font-['Nunito'] animate-in fade-in duration-500">
      
      {/* SECTION: BẬT/TẮT MÃ PIN */}
      <section className="bg-white border-2 border-[#F0F0F0] rounded-[24px] p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-[20px] font-bold text-[#2D3436]">Xác thực mã PIN</h2>
            <p className="text-[15px] text-[#B2BEC3]">
              Yêu cầu người dùng nhập mã Pin gồm 6 số khi mở ứng dụng.
            </p>
          </div>
          
          {/* Toggle Switch phong cách Duolingo */}
          <button 
            onClick={() => setIsPinEnabled(!isPinEnabled)}
            className={`w-14 h-8 rounded-full transition-colors relative ${isPinEnabled ? 'bg-[#00CEC9]' : 'bg-[#E8ECF0]'}`}
          >
            <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform shadow-sm ${isPinEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* Chỉ hiện khi Switch bật */}
      {isPinEnabled && (
        <section className="bg-white border-2 border-[#F0F0F0] rounded-[24px] p-8 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="space-y-2">
            <h3 className="text-[18px] font-bold text-[#2D3436]">Tạo mã PIN an toàn</h3>
            <p className="text-sm text-[#B2BEC3]">Nhập 6 số bí mật</p>
          </div>

          {/* PIN Input Group */}
          <div className="flex justify-center gap-3">
            {pin.map((digit, index) => (
              <input
                key={index}
                // ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-2xl font-bold text-center border-2 border-[#E8ECF0] rounded-[12px] focus:border-[#FF3399] focus:outline-none transition-all text-[#2D3436]"
              />
            ))}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            {/* Nút Primary theo đặc tả thiết kế */}
            <button className="w-full h-[52px] bg-[#FF3399] border-b-4 border-[#D12A7E] active:border-b-0 active:translate-y-[2px] rounded-[16px] text-white font-bold text-[17px] transition-all">
              XÁC NHẬN
            </button>
            
            <button 
              onClick={() => { setPin(["","","","","",""]); inputRefs.current[0]?.focus(); }}
              className="text-[#FF3399] font-bold text-sm hover:opacity-80 transition-opacity"
            >
              Xóa tất cả
            </button>
          </div>
        </section>
      )}

      {/* <p className="text-center text-[13px] text-[#B2BEC3] px-10">
        Ghi nhớ mã PIN của bạn. Nếu quên, bạn sẽ cần đăng nhập lại qua Email để đặt lại quyền truy cập.
      </p> */}
    </div>
  );
}