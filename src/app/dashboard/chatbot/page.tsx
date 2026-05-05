'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import LeftSidebar from './_components/LeftSidebar';
import { keyService } from '../settings/api-key/_services/key.service';
import { ChatMessage } from './_components/ChatMessage';
import { BotMessage } from './_components/BotMessage';
import { callGroqChat } from './_service/groq';

export default function ChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMessage = { id: Date.now(), role: 'user', content: userContent };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Kiểm tra API Key
      const keys = await keyService.getKeys('groq');
      
      if (!keys || keys.length === 0) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: "Bạn cần cấu hình model LLM để tôi có thể hoạt động. Bạn có thể xem hướng dẫn chi tiết tại đây: [Xem hướng dẫn](/guide)"
        }]);
        setIsLoading(false);
        return;
      }

      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      
      // api chat
      const result = await callGroqChat(randomKey, messages, userContent);
      
      // Kiểm tra phản hồi từ Server
      if (!result.ok) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Lỗi hệ thống: ${result.data?.error?.message || 'Không thể nhận phản hồi từ AI.'}`
        }]);
      } else {
        // Thành công
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.data.choices[0].message.content,
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'assistant', 
        content: `Đã xảy ra lỗi kết nối: ${error.message}. Vui lòng kiểm tra lại đường truyền.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-white text-[#2D3436]">
      <LeftSidebar />

      <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full pt-16">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {isLoading && <BotMessage isLoading={true} />}
        </div>
      </main>

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
              disabled={isLoading}
              className="focus:outline-none flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-bold py-3 resize-none max-h-32 placeholder-[#B2BEC3] text-[#2D3436] leading-tight"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-[#1CB0F6] text-white rounded-xl border-b-4 border-[#1899D6] hover:brightness-105 active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:border-b-0 transition-all shrink-0"
            >
              <Send size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}