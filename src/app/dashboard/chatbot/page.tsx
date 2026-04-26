"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Settings2,
  Cpu,
  X,
} from "lucide-react";

import ChatTools from "./_components/ChatTools";

const MODELS = [{ id: "hyper-p-42", name: "Hyper-P 4.2", version: "V4.2.0" }];

export default function PenguChat() {
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?", timestamp: new Date().toISOString() }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    // Giả lập phản hồi
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Tôi đã nhận được tin nhắn của bạn. Hệ thống đang xử lý...", 
        timestamp: new Date().toISOString() 
      }]);
    }, 800);
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-128px)] w-full">
      
      {/* VÙNG TIN NHẮN (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-2 pb-32 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div 
              key={i} 
              className={`flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-300 ${isUser ? "items-end" : "items-start"}`}
            >
              <div className={`
                max-w-[85%] px-4 py-2.5 text-[15px] leading-snug shadow-sm
                ${isUser 
                  ? "bg-blue-600 text-white rounded-[20px] rounded-tr-none" 
                  : "bg-[#1E1E1E] text-gray-100 rounded-[20px] rounded-tl-none"}
              `}>
                {m.content}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 px-2">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* THANH NHẬP LIỆU CỐ ĐỊNH (Ghi đè Padding của Layout) */}
      <div className="absolute bottom-[-32px] left-[-32px] right-[-32px] p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-40">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-[28px] p-1.5 pl-4 pr-2 border border-white/5 focus-within:border-white/20 transition-all shadow-2xl">
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-full transition-colors ${isSidebarOpen ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <Settings2 size={20} />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-transparent py-2.5 px-2 text-[15px] outline-none placeholder:text-gray-600"
            />

            <button 
              onClick={handleSendMessage}
              disabled={!input.trim()}
              className="bg-white text-black p-2 rounded-full hover:bg-blue-500 hover:text-white disabled:bg-gray-800 disabled:text-gray-600 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-gray-600 mt-2">
            Hệ thống AI có thể nhầm lẫn. Vui lòng kiểm tra lại.
          </p>
        </div>
      </div>

      {/* CẤU HÌNH SIDEBAR (Dùng Fixed để không bị giới hạn bởi Div cha) */}
      <aside 
        className={`
          fixed top-0 right-0 h-full z-[60] bg-[#0D0D0D] border-l border-white/5 
          transition-all duration-300 ease-in-out overflow-hidden
          ${isSidebarOpen ? "w-80" : "w-0"}
        `}
      >
        <div className="w-80 p-6 flex flex-col h-full space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Cpu size={16} className="text-blue-500" /> Cấu hình mô hình
            </h3>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400">Độ sáng tạo (Temp)</span>
                <span className="text-blue-500">0.8</span>
              </div>
              <input type="range" className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>

            <div className="space-y-4">
              {["Suy luận sâu", "Tìm kiếm web", "Phản hồi nhanh"].map((label, i) => (
                <div key={label} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
                  <div className={`w-8 h-4 rounded-full relative ${i < 2 ? 'bg-blue-600' : 'bg-gray-800'}`}>
                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${i < 2 ? 'right-1' : 'left-1'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-auto w-full bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl text-xs font-medium text-gray-300 transition-all"
          >
            Cài đặt nâng cao
          </button>
        </div>
      </aside>

      {/* MODAL TOOLS */}
      <ChatTools
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey="sk-..."
        setApiKey={() => {}}
        tempPrompt="Assistant"
        setTempPrompt={() => {}}
        onSave={() => setIsModalOpen(false)}
        onSaveOPFS={() => {}}
      />
    </div>
  );
}