"use client";

import React from "react";
import { 
  Info, 
  ShieldCheck, 
  FileText, 
  Heart, 
  ExternalLink,
  Github,
  Globe,
  Quote
} from "lucide-react";

export default function AppAppendix() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 p-4 font-['Nunito'] animate-in fade-in duration-700">
      
      {/* HEADER: PHẦN KẾT THÚC */}
      <div className="text-center space-y-2 py-6">
        <h1 className="text-[24px] font-[800] text-[#2D3436]">Thông tin ứng dụng</h1>
        <div className="h-1 w-16 bg-[#FF3399] mx-auto rounded-full" />
      </div>

      {/* SECTION 1: LỜI KẾT TỪ ĐỘI NGŨ PHÁT TRIỂN (DEV TEAM REFLECTION) */}
      <section className="bg-white border-2 border-[#F0F0F0] rounded-[24px] p-8 shadow-[0_4px_0_0_rgba(0,0,0,0.05)] relative overflow-hidden">
        {/* Chữ trang trí mờ ở góc - tạo cảm giác Code một chút */}
        <div className="absolute top-4 right-6 text-[10px] font-mono text-[#F0F0F0] select-none uppercase tracking-widest rotate-12">
          &lt;root_access /&gt;
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-[#FFF0F7] rounded-[16px] flex items-center justify-center text-[#FF3399]">
            <Heart size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-[20px] font-[800] text-[#2D3436]">Từ đội ngũ phát triển</h2>
            <p className="text-[12px] font-bold text-[#B2BEC3] uppercase tracking-wider">Dev Team Reflections</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-6">
            <p className="text-[16px] italic font-medium leading-[1.8] text-[#2D3436]">
              Chúng tôi bắt đầu dự án này từ những dòng mã đầu tiên với một niềm tin đơn giản:
            </p>
            
            <blockquote className="relative rounded-2xl border-2 border-[#F0F0F0] bg-white p-6">
              <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-[#FF3399] text-white shadow-[0_2px_0_0_#D12A7E]">
                <Quote size={16} fill="currentColor" />
              </span>
              <p className="text-xl font-extrabold leading-snug tracking-tight text-[#FF3399] text-center">
                Xây dựng công cụ học tập miễn phí cho cộng đồng.
              </p>
            </blockquote>
          </div>        
          <p className="text-[15px] text-[#636E72] leading-relaxed">
            Mỗi tính năng bạn trải nghiệm là kết quả của niềm tin và mong muốn đóng góp cho cộng đồng. 
            Chúng tôi không chỉ xây dựng một ứng dụng, mà đang cùng bạn xây dựng một hành trình phát triển bản thân.
          </p>
          
          <div className="pt-4 flex flex-col gap-1 border-t-2 border-[#F7F9FB]">
            <p className="font-black text-[#2D3436] text-[16px]">The Dev Team</p>
            <p className="text-[13px] text-[#B2BEC3] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00CEC9] rounded-full animate-pulse"></span>
              Mạnh Đức
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: TÀI LIỆU THAM KHẢO & PHÁP LÝ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Điều khoản */}
        <div className="bg-[#F7F9FB] border-2 border-dashed border-[#B2BEC3] rounded-[24px] p-6 hover:bg-white hover:border-solid hover:border-[#00CEC9] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <ShieldCheck className="text-[#00CEC9]" size={28} />
            <ExternalLink size={16} className="text-[#B2BEC3] group-hover:text-[#00CEC9]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#2D3436]">Chính sách bảo mật</h3>
          <p className="text-[13px] text-[#B2BEC3] mt-1">Cách chúng tôi bảo vệ dữ liệu của bạn theo tiêu chuẩn quốc tế.</p>
        </div>

        {/* Nguồn tài liệu */}
        <div className="bg-[#F7F9FB] border-2 border-dashed border-[#B2BEC3] rounded-[24px] p-6 hover:bg-white hover:border-solid hover:border-[#FF3399] transition-all group">
          <div className="flex items-center justify-between mb-4">
            <FileText className="text-[#FF3399]" size={28} />
            <ExternalLink size={16} className="text-[#B2BEC3] group-hover:text-[#FF3399]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#2D3436]">Nguồn học liệu</h3>
          <p className="text-[13px] text-[#B2BEC3] mt-1">Danh sách các giáo trình và nguồn mở được sử dụng trong bài học.</p>
        </div>
      </div>

      {/* SECTION 3: PHIÊN BẢN & LIÊN HỆ (CREDITS) */}
      <section className="bg-white border-2 border-[#F0F0F0] rounded-[24px] overflow-hidden shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
        <div className="p-6 border-b-2 border-[#F0F0F0] bg-[#F7F9FB]">
          <h3 className="text-[16px] font-bold text-[#2D3436] flex items-center gap-2">
            <Info size={18} /> Thông tin kỹ thuật
          </h3>
        </div>
        <div className="p-6 space-y-4 text-[15px]">
          {/* <div className="flex justify-between items-center">
            <span className="text-[#B2BEC3]">Phiên bản ứng dụng</span>
            <span className="font-bold text-[#2D3436]">v1.0.4-stable</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#B2BEC3]">Lần cập nhật cuối</span>
            <span className="font-bold text-[#2D3436]">01 tháng 05, 2026</span>
          </div> */}
          <div className="flex justify-between items-center">
            <span className="text-[#B2BEC3]">Công nghệ</span>
            <span className="px-3 py-1 bg-[#E0FFFE] text-[#00CEC9] text-[12px] font-bold rounded-full">Next.js 14</span>
          </div>
        </div>
      </section>

      {/* SOCIAL LINKS */}
      {/* <div className="flex justify-center gap-6 pt-4">
        <a href="#" className="p-3 bg-white border-2 border-[#F0F0F0] rounded-full text-[#B2BEC3] hover:text-[#FF3399] hover:border-[#FF3399] transition-all shadow-[0_2px_0_0_rgba(0,0,0,0.05)]">
          <Github size={20} />
        </a>
        <a href="#" className="p-3 bg-white border-2 border-[#F0F0F0] rounded-full text-[#B2BEC3] hover:text-[#00CEC9] hover:border-[#00CEC9] transition-all shadow-[0_2px_0_0_rgba(0,0,0,0.05)]">
          <Globe size={20} />
        </a>
      </div> */}

      <div className="text-center opacity-30 select-none pt-6">
        <p className="text-[12px] font-bold tracking-[0.3em] text-[#2D3436]">Mạnh Đức</p>
        <p className="text-[10px] mt-1">© 2026</p>
      </div>

    </div>
  );
}