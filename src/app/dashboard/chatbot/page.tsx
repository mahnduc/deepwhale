'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, Menu, Settings, X, Volume2, Clock, MessageSquare, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', content: 'Chào bạn! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?' },
    { id: 2, role: 'user', content: 'Tôi muốn thiết kế một giao diện chat đồng bộ với phong cách Duolingo.' },
    { id: 3, role: 'bot', content: 'Rất sẵn lòng! Hãy chú ý các khối tin nhắn: chúng ta sử dụng shadow cứng và bo góc lớn để tạo cảm giác thân thiện.' },
    { id: 4, role: 'bot', content: 'Chào bạn! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?' },
    { id: 5, role: 'user', content: 'Tôi muốn thiết kế một giao diện chat đồng bộ với phong cách Duolingo.' },
    { id: 6, role: 'bot', content: 'Rất sẵn lòng! Hãy chú ý các khối tin nhắn: chúng ta sử dụng shadow cứng và bo góc lớn để tạo cảm giác thân thiện.' },
  ]);
  
  const [input, setInput] = useState('');
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), role: 'user', content: input }]);
    setInput('');
  };

  if (!mounted) return null;

  return (
    // Giữ nguyên div gốc này của bạn
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white">
      
      {/* NÚT ĐIỀU KHIỂN SIDEBAR - Tận dụng Absolute để không chiếm diện tích */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button 
          onClick={() => setLeftOpen(!leftOpen)}
          className="p-2 bg-white border-2 border-b-4 border-[#E5E5E5] rounded-xl text-[#2D3436] hover:bg-[#F7F7F7] transition-all active:border-b-0 active:translate-y-1"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setRightOpen(!rightOpen)}
          className="p-2 bg-white border-2 border-b-4 border-[#E5E5E5] rounded-xl text-[#2D3436] hover:bg-[#F7F7F7] transition-all active:border-b-0 active:translate-y-1"
        >
          <Settings size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* SIDEBAR TRÁI - Lịch sử trò chuyện */}
      <aside 
        className={`absolute top-0 left-0 h-full z-40 bg-white border-r-2 border-[#E5E5E5] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-72 
        ${leftOpen ? 'translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.05)]' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-6 pt-24">
          <div className="flex items-center gap-2 mb-8 px-2">
            <Clock className="text-[#B2BEC3]" size={20} />
            <h3 className="font-extrabold text-[#B2BEC3] uppercase text-[13px] tracking-wider">Lịch sử học tập</h3>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {/* Item đang hoạt động (Active) */}
            <div className="group relative cursor-pointer">
              <div className="p-4 bg-[#E1F5FE] border-2 border-b-4 border-[#00CEC9] rounded-2xl flex items-center gap-3 transition-all transform active:scale-95">
                <div className="w-10 h-10 bg-[#00CEC9] rounded-xl flex items-center justify-center text-white shadow-sm">
                  <MessageSquare size={20} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-[#2D3436] text-[15px]">Thiết kế UI Duo</span>
                  <span className="text-[11px] font-bold text-[#00A8A3] uppercase tracking-tighter">Đang học tập</span>
                </div>
              </div>
            </div>

            {/* Item danh sách */}
            <div className="p-4 bg-white border-2 border-b-4 border-[#E5E5E5] hover:bg-[#F7F9FB] hover:border-[#B2BEC3] rounded-2xl flex items-center gap-3 transition-all active:border-b-0 active:translate-y-1 cursor-pointer group">
              <div className="w-10 h-10 bg-[#F0F0F0] group-hover:bg-white rounded-xl flex items-center justify-center text-[#B2BEC3] transition-colors">
                <MessageSquare size={20} />
              </div>
              <span className="font-bold text-[#4B4B4B] text-[15px]">Bài hội thoại #12</span>
            </div>
          </div>

          {/* Nút hành động phía dưới Sidebar */}
          <div className="mt-auto pt-6 border-t-2 border-[#F0F0F0]">
            <button className="w-full py-4 bg-[#FF3399] text-white font-extrabold rounded-2xl border-b-4 border-[#D12A7E] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
              <Sparkles size={18} fill="currentColor" />
              Bài học mới
            </button>
          </div>
        </div>
      </aside>

      {/* SIDEBAR PHẢI - Cấu hình trợ lý */}
      <aside 
        className={`absolute top-0 right-0 h-full z-40 bg-white border-l-2 border-[#E5E5E5] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-72
        ${rightOpen ? 'translate-x-0 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-6 pt-24">
          <div className="flex items-center gap-2 mb-8 px-2">
            <Settings className="text-[#B2BEC3]" size={20} />
            <h3 className="font-extrabold text-[#B2BEC3] uppercase text-[13px] tracking-wider">Tùy chỉnh AI</h3>
          </div>

          <div className="space-y-6">
            {/* Card cài đặt âm thanh */}
            <div className="p-5 bg-[#F7F9FB] rounded-[24px] border-2 border-[#E5E5E5] transition-all hover:border-[#B2BEC3]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#58CC02] rounded-xl text-white shadow-[0_2px_0_0_#46A302]">
                    <Volume2 size={18} />
                  </div>
                  <span className="font-extrabold text-[#2D3436]">Âm thanh</span>
                </div>
                {/* Custom Toggle Duolingo Style */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-12 h-7 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[#58CC02] shadow-inner"></div>
                </label>
              </div>
              <p className="text-[13px] font-bold text-[#B2BEC3] leading-snug">
                Tự động phát âm thanh khi AI trả lời tin nhắn.
              </p>
            </div>

            {/* Chọn chế độ (Radio buttons) */}
            <div className="space-y-3 px-2">
              <span className="font-extrabold text-[13px] text-[#B2BEC3] uppercase">Chế độ trợ lý</span>
              <div className="grid grid-cols-1 gap-2">
                <button className="flex items-center justify-between p-4 bg-[#FFF0F7] border-2 border-[#FF3399] rounded-2xl text-[#FF3399] font-extrabold transition-all active:scale-95 shadow-[0_2px_0_0_#FF3399]">
                  <span className="flex items-center gap-2"><Sparkles size={16} /> Vui vẻ</span>
                  <div className="w-4 h-4 rounded-full border-4 border-[#FF3399] bg-white"></div>
                </button>
                <button className="flex items-center justify-between p-4 bg-white border-2 border-[#E5E5E5] rounded-2xl text-[#2D3436] font-extrabold hover:bg-[#F7F7F7] transition-all active:scale-95">
                  <span>Nghiêm túc</span>
                  <div className="w-4 h-4 rounded-full border-2 border-[#E5E5E5] bg-white"></div>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </aside>

      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth
                   [&::-webkit-scrollbar]:w-[8px] 
                   [&::-webkit-scrollbar-track]:bg-transparent 
                   [&::-webkit-scrollbar-thumb]:bg-[#E5E5E5] 
                   [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-400`}
            >
              <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border-b-4 
                  ${msg.role === 'user' ? 'bg-[#2D3436] border-[#000000]' : 'bg-[#FF3399] border-[#D12A7E]'}`}>
                  {msg.role === 'user' ? <User size={20} className="text-white" strokeWidth={2.5} /> : <Bot size={20} className="text-white" strokeWidth={2.5} />}
                </div>
                
                <div className={`p-4 rounded-[16px] text-[15px] font-semibold leading-relaxed shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-[#2D3436] text-white border-b-4 border-[#000000] rounded-tr-none' 
                    : 'bg-white border-2 border-[#E5E5E5] border-b-4 text-[#2D3436] rounded-tl-none'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 2. FOOTER - GIỮ NGUYÊN */}
      <footer className="bg-inherit pt-2 pb-6 px-4 md:px-8 shrink-0"> 
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-white border-2 border-[#E5E5E5] border-b-4 rounded-[24px] p-2 focus-within:border-[#FF3399] transition-all shadow-sm">
            <button className="p-3 text-[#B2BEC3] hover:text-[#FF3399] transition-colors">
              <Paperclip size={22} strokeWidth={2.5} />
            </button>
            
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-bold py-3 resize-none max-h-32 placeholder-[#B2BEC3] text-[#2D3436] leading-tight"
            />
            
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-[#FF3399] text-white rounded-xl border-b-4 border-[#D12A7E] hover:brightness-105 active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:border-b-0 transition-all shrink-0"
            >
              <Send size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </footer>

      {/* Lớp mờ (Overlay) khi mở Sidebar trên mobile - Tùy chọn */}
      {(leftOpen || rightOpen) && (
        <div 
          className="absolute inset-0 bg-black/5 z-30 md:hidden" 
          onClick={() => {setLeftOpen(false); setRightOpen(false);}}
        />
      )}
    </div>
  );
}