import React from 'react';
import { Key, ShieldCheck, Zap, ArrowLeft, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#F7F9FB] font-['Nunito',sans-serif] text-[#2D3436] antialiased">

      <nav className="h-16 flex items-center justify-between px-8 md:px-16 bg-white border-b-2 border-[#E5E5E5] sticky top-0 z-50">
        <div className="flex items-center gap-3">
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

      <main className="max-w-3xl mx-auto px-4 pt-10">
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-[800] leading-[1.2] mb-4 text-[#2D3436]">Cách cấu hình model LLM với <br/> Groq Api key miễn phí</h2>
          <p className="text-[#B2BEC3] font-[600] text-[18px]">
            Hiện tại, chúng tôi chỉ hỗ trợ api key từ Groq.
          </p>
        </div>

        {/* STEPS - Áp dụng Layout Card và Physical Buttons */}
        <div className="space-y-6">
          {/* STEP 1 */}
          <section className="bg-white border-[1.5px] border-[#F0F0F0] rounded-[24px] p-8 shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-12 h-12 shrink-0 bg-[#FF3399] text-white rounded-[12px] flex items-center justify-center font-[800] text-[20px] border-b-4 border-[#D12A7E]">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] font-[700] mb-3 text-[#2D3436]">Lấy API Key miễn phí từ Groq</h3>
                <p className="text-[#2D3436] text-[15px] leading-[1.6] mb-6 font-[400]">
                  Truy cập vào trang quản trị của Groq Cloud để tạo mã khóa. Việc này hoàn toàn miễn phí theo hạn mức của Groq.
                </p>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#00CEC9] text-white px-8 py-3 rounded-[16px] font-[700] text-[15px] border-b-4 border-[#00A8A3] hover:brightness-[1.05] active:translate-y-[2px] active:border-b-[2px] transition-all"
                >
                  Mở Groq Console <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </section>

          {/* STEP 2 */}
          <section className="bg-white border-[1.5px] border-[#F0F0F0] rounded-[24px] p-8 shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
            <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Step Number - Physical Design */}
                <div className="w-12 h-12 shrink-0 bg-[#00CEC9] text-white rounded-[12px] flex items-center justify-center font-[800] text-[20px] border-b-4 border-[#00A8A3]">
                2
                </div>

                <div className="flex-1">
                {/* Heading 2 Style */}
                <h3 className="text-[20px] font-[700] mb-4 text-[#2D3436] tracking-tight">
                    Thêm cấu hình API
                </h3>
                
                {/* Giả lập đường dẫn thao tác (Breadcrumbs) */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="bg-[#F7F9FB] px-3 py-1.5 rounded-[12px] text-[13px] font-[700] text-[#2D3436] border-b-2 border-[#E0E0E0]">
                    Cài đặt
                    </span>
                    <ArrowRight size={14} className="text-[#B2BEC3]" />
                    <span className="bg-[#F7F9FB] px-3 py-1.5 rounded-[12px] text-[13px] font-[700] text-[#2D3436] border-b-2 border-[#E0E0E0]">
                    API Keys
                    </span>
                </div>

                {/* Body Text Style */}
                <p className="text-[#2D3436] text-[15px] leading-[1.6] font-[400]">
                    Dán mã khóa bạn đã sao chép vào ô nhập liệu, sau đó nhấn nút 
                    <span className="ml-1 inline-block bg-[#FF3399] text-white px-3 py-0.5 rounded-[8px] font-[700] text-[13px] border-b-2 border-[#D12A7E]">
                    Cập nhật 
                    </span>
                    để hoàn tất kết nối.
                </p>
                </div>
            </div>
            </section>
        </div>
        {/* SECURITY NOTE - Achievement Card Style */}
        <div className="mt-12 p-6 bg-[#2D3436] rounded-[24px] flex gap-4 items-center">
          <div className="bg-[#FFFFFF1A] p-3 rounded-full">
            <ShieldCheck className="text-[#00CEC9]" size={32} />
          </div>
          <div>
            <h4 className="font-[700] text-white mb-1">Bảo mật thông tin</h4>
            <p className="text-[#B2BEC3] text-[13px] leading-[1.5]">
              API Key được lưu tại trình duyệt người dùng. Chúng tôi tuyệt đối không gửi khóa của bạn về máy chủ bên thứ ba nào ngoài Groq.
            </p>
          </div>
        </div>

        {/* FAQ - Grid Layout */}
        <div className="mt-16 pt-12 border-t-2 border-[#F0F0F0]">
          <h3 className="text-[24px] font-[700] mb-8 text-center text-[#2D3436]">Câu hỏi thường gặp</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* <div className="bg-white p-6 rounded-[16px] border-[1.5px] border-[#F0F0F0] shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
              <h5 className="font-[700] text-[16px] mb-2 flex items-center gap-2 text-[#2D3436]">
                <Zap size={18} className="text-[#FF3399]" />
                Tại sao cần nhiều Key?
              </h5>
              <p className="text-[13px] text-[#B2BEC3] font-[400]">
                Giúp hệ thống xoay tua tự động khi một mã khóa đạt đến giới hạn (Rate Limit) của Groq.
              </p>
            </div>
            <div className="bg-white p-6 rounded-[16px] border-[1.5px] border-[#F0F0F0] shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
              <h5 className="font-[700] text-[16px] mb-2 flex items-center gap-2 text-[#2D3436]">
                <Zap size={18} className="text-[#FF3399]" />
                Lỗi "Invalid Key"?
              </h5>
              <p className="text-[13px] text-[#B2BEC3] font-[400]">
                Vui lòng kiểm tra lại khoảng trắng khi copy hoặc trạng thái kích hoạt của mã trên Console.
              </p>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}