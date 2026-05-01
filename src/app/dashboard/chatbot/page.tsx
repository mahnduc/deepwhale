'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, Menu, Settings, X, Volume2, Clock, MessageSquare, Sparkles, ChevronDown, BookOpen, BrainCog, HardDrive, Key, SkipBack, ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', content: 'Chào bạn! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?' },
    { id: 2, role: 'user', content: 'Tôi muốn thiết kế một giao diện chat đồng bộ với phong cách Duolingo.' },
    { id: 3, role: 'bot', content: 'Rất sẵn lòng! Hãy chú ý các khối tin nhắn: chúng ta sử dụng shadow cứng và bo góc lớn để tạo cảm giác thân thiện.' },
    { id: 4, role: 'bot', content: 'Chào bạn! Tôi là trợ lý AI. Tôi có thể giúp gì cho bạn hôm nay?' },
    { id: 5, role: 'user', content: 'Tôi muốn thiết kế một giao diện chat đồng bộ với phong cách Duolingo.' },
    { id: 6, role: 'bot', content: 'Rất sẵn lòng! Hãy chú ý các khối tin nhắn: chúng ta sử dụng shadow cứng và bo góc lớn để tạo cảm giác thân thiện.' },
  
  ]);
  
  const [modelType, setModelType] = useState('all');
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
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white text-[#2D3436]">
      {/* Nút Toggle Sidebar Trái */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button 
          onClick={() => setLeftOpen(!leftOpen)}
          className="p-2 bg-white border-2 border-b-4 border-[#E5E5E5] rounded-xl text-[#2D3436] hover:bg-[#F7F7F7] transition-all active:border-b-0 active:translate-y-1"
        >
          {leftOpen ? <X size={20} strokeWidth={2.5} /> : <Menu size={20} strokeWidth={2.5} />}
        </button>
      </div>
      {/* Nút Toggle Sidebar Phải */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setRightOpen(!rightOpen)}
          className="p-2 bg-white border-2 border-b-4 border-[#E5E5E5] rounded-xl text-[#2D3436] hover:bg-[#F7F7F7] transition-all active:border-b-0 active:translate-y-1"
        >
          {rightOpen ? <X size={20} strokeWidth={2.5} /> : <Settings size={20} strokeWidth={2.5} />}
        </button>
      </div>
      {/* SIDEBAR TRÁI - Lịch sử */}
      <aside 
        className={`absolute top-0 left-0 h-full z-40 bg-white border-r-2 border-[#E5E5E5] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-72 
        ${leftOpen ? 'translate-x-0 shadow-[20px_0_40px_rgba(0,0,0,0.05)]' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-6 pt-7">
          <div className="flex items-center gap-2 mb-8 px-2 pl-10">
            {/* <Clock className="text-[#B2BEC3]" size={20} /> */}
            <h3 className="font-extrabold text-[#B2BEC3] uppercase text-[13px] tracking-wider">Lịch sử học tập</h3>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="p-4 bg-[#E1F5FE] border-2 border-b-4 border-[#00CEC9] rounded-2xl flex items-center gap-3 transition-all transform active:scale-95 cursor-pointer">
              <div className="w-10 h-10 bg-[#00CEC9] rounded-xl flex items-center justify-center text-white shadow-sm">
                <MessageSquare size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px]">Thiết kế UI</span>
                <span className="text-[11px] font-bold text-[#00A8A3] uppercase tracking-tighter">Đang học tập</span>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-6 border-t-2 border-[#F0F0F0]">
            <button className="w-full py-4 bg-[#FF3399] text-white font-extrabold rounded-2xl border-b-4 border-[#D12A7E] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
              <Sparkles size={18} fill="currentColor" /> Bài học mới
            </button>
          </div>
        </div>
      </aside>
      {/* SIDEBAR PHẢI - Cấu hình */}
      <aside 
        className={`absolute top-0 right-0 h-full z-40 bg-white border-l-2 border-[#E5E5E5] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-72
        ${rightOpen ? 'translate-x-0 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Main Config */}
          <div className="p-6 pt-8 space-y-6">
            <div className="flex items-center gap-2 mb-2 px-2">
              <h3 className="font-extrabold text-[#B2BEC3] uppercase text-[13px] tracking-wider">Tùy chỉnh</h3>
            </div>

            {/* Card LLM Model */}
            <div className="p-4 bg-[#F7F9FB] rounded-[24px] border-2 border-[#E5E5E5] transition-all hover:border-[#B2BEC3] w-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#1CB0F6] rounded-xl text-white shadow-[0_2px_0_0_#1899D6] group-hover:scale-110 transition-transform">
                  <BrainCog size={18} strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-[15px]">LLM Model</span>
              </div>

              <div className="relative w-full mb-3">
                <select 
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full appearance-none bg-white border-2 border-[#E5E5E5] rounded-xl px-4 py-2.5 pr-10 font-bold text-[#4B4B4B] text-sm cursor-pointer focus:outline-none focus:border-[#1CB0F6] transition-colors shadow-[0_2px_0_0_#E5E5E5] active:shadow-none active:translate-y-[1px]"
                >
                  <option value="all">Danh sách mô hình</option>
                  <option value="local">Local</option>
                  <option value="api">API Key</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#B2BEC3]">
                  <ChevronDown size={16} strokeWidth={3} />
                </div>
              </div>
              <p className="text-[12px] font-bold text-[#B2BEC3] leading-tight px-1">Tùy chọn kết nối mô hình ngôn ngữ.</p>
            </div>
            {/* Card Kho tri thức */}
            <div className="p-4 bg-[#F7F9FB] rounded-[24px] border-2 border-[#E5E5E5] transition-all hover:border-[#B2BEC3] w-full group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#58CC02] rounded-xl text-white shadow-[0_2px_0_0_#46A302] group-hover:scale-110 transition-transform">
                  <BookOpen size={18} strokeWidth={2.5} />
                </div>
                <span className="font-extrabold text-[15px]">Kho tri thức</span>
              </div>
              <div className="relative w-full mb-3">
                <select className="w-full appearance-none bg-white border-2 border-[#E5E5E5] rounded-xl px-4 py-2.5 pr-10 font-bold text-[#4B4B4B] text-sm cursor-pointer focus:outline-none focus:border-[#58CC02] transition-colors shadow-[0_2px_0_0_#E5E5E5] active:shadow-none active:translate-y-[1px]">
                  <option value="all">Chọn bộ tri thức</option>
                  <option value="sci-fi">Khoa học</option>
                  <option value="novel">Tiểu thuyết</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#B2BEC3]">
                  <ChevronDown size={16} strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
          {/* SUB-SIDEBAR */}
          <div 
            className={`absolute inset-y-0 right-0 w-full bg-white z-50 transition-transform duration-300 ease-in-out p-6 pt-8
            ${modelType !== 'all' ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <button 
              onClick={() => setModelType('all')}
              className="mb-6 flex items-center gap-2 font-black text-[#1CB0F6] uppercase text-xs hover:opacity-70 transition-opacity"
            >
              <ArrowLeft size={16} strokeWidth={3} /> Quay lại
            </button>

            {modelType === 'local' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                {/* Header Section */}
                <div className="flex items-center gap-2 text-[#58CC02] mb-2 px-1">
                  <HardDrive size={20} strokeWidth={2.5} />
                  <h4 className="font-black uppercase text-sm tracking-tight">Cấu hình Local</h4>
                </div>

                {/* Description Box */}
                <div className="p-4 bg-[#F7F9FB] border-2 border-dashed border-[#E5E5E5] rounded-[24px] text-center space-y-3">
                  <p className="text-[13px] font-bold text-[#4B4B4B] leading-snug">
                    <span className="text-[#58CC02]">@xenova</span> transformers
                  </p>
                  
                  {/* The Styled Button */}
                  <button className="
                    w-full py-3 px-4
                    font-extrabold text-[13px] uppercase tracking-wider
                    bg-[#58CC02] text-white
                    rounded-2xl
                    border-b-4 border-[#46A302]
                    transition-all duration-100
                    hover:brightness-110
                    active:border-b-0
                    active:translate-y-[4px]
                    select-none
                    flex items-center justify-center gap-2
                  ">
                    <Sparkles size={16} fill="currentColor" />
                    Kích hoạt Xenova
                  </button>
                </div>

                {/* Note */}
                <p className="text-[11px] font-bold text-[#B2BEC3] px-2 leading-tight">
                  * Vui lòng chờ đợi trong lần khởi động đầu tiên.
                </p>
              </div>
            )}
            {modelType === 'api' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 text-[#FF3399] mb-2">
                  <Key size={20} strokeWidth={2.5} />
                  <h4 className="font-black uppercase text-sm">Cấu hình API</h4>
                </div>
                <input 
                  type="password" 
                  placeholder="sk-..."
                  className="w-full p-4 bg-[#F7F9FB] border-2 border-[#E5E5E5] rounded-2xl focus:outline-none focus:border-[#FF3399] font-bold text-sm"
                />
                <button className="w-full py-3 bg-[#FF3399] text-white font-extrabold rounded-xl border-b-4 border-[#D12A7E] active:border-b-0 active:translate-y-1 transition-all uppercase text-xs tracking-widest">Kết nối</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* NỘI DUNG CHAT CHÍNH */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full pt-16">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex mb-8 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-400`}>
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

      {/* FOOTER NHẬP TIN NHẮN */}
      <footer className="bg-white pt-2 pb-6 px-4 md:px-8 shrink-0 border-t-2 border-transparent"> 
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-white border-2 border-[#E5E5E5] border-b-4 rounded-[24px] p-2 focus-within:border-[#1CB0F6] transition-all shadow-sm">
            <button className="p-3 text-[#B2BEC3] hover:text-[#1CB0F6] transition-colors">
              <Paperclip size={22} strokeWidth={2.5} />
            </button>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Nhập tin nhắn..."
              className="focus:outline-none flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-bold py-3 resize-none max-h-32 placeholder-[#B2BEC3] text-[#2D3436] leading-tight"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-3 bg-[#1CB0F6] text-white rounded-xl border-b-4 border-[#1899D6] hover:brightness-105 active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:border-b-0 transition-all shrink-0"
            >
              <Send size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Overlay */}
      {(leftOpen || rightOpen) && (
        <div 
          className="absolute inset-0 bg-black/10 z-30 md:hidden backdrop-blur-[2px]" 
          onClick={() => {setLeftOpen(false); setRightOpen(false);}}
        />
      )}
    </div>
  );
}