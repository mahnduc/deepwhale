'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface AgentData {
  agent_id: string;
  name: string;
  description: string;
  avatarUrl: string;
  style: string;
  seed: string;
  createdAt: string;
}

export default function AgentDirectory() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false); // Chống lỗi Hydration

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  useEffect(() => {
    setIsMounted(true); 

    async function fetchAgents() {
      if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.getDirectory) {
        setIsLoading(false);
        return;
      }

      try {
        const root = await navigator.storage.getDirectory();
        const agentsDir = await root.getDirectoryHandle('agents', { create: true });
        const membersDir = await agentsDir.getDirectoryHandle('members', { create: true });
        
        let data: AgentData[] = [];
        try {
          const fileHandle = await membersDir.getFileHandle('agent_members.json');
          const file = await fileHandle.getFile();
          const text = await file.text();
          if (text) {
            const parsed = JSON.parse(text);
            data = Array.isArray(parsed) ? parsed : [];
          }
        } catch (e) {
          console.log("Thông tin: Chưa có dữ liệu Agent.");
        }
        
        setAgents(data.filter(a => a && a.agent_id));
      } catch (error) {
        console.error("Lỗi khi tương tác OPFS:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAgents();
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-base-200" />;
  }
  
  return (
    <div className="min-h-screen bg-base-200 p-8 text-base-content transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tighter uppercase">Thư viện Agent</h1>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2">Bắt đầu cuộc trò chuyện của bạn</p>
          </div>
          
          <Link 
            href="/agents/create/" 
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl bg-base-200 font-bold text-primary transition-all ${neoFlat} ${neoPressed}`}
          >
            TẠO THỰC THỂ MỚI
          </Link>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-dots loading-lg opacity-20"></span>
          </div>
        ) : agents.length === 0 ? (
          <div className={`p-20 rounded-[3rem] bg-base-200 text-center ${neoInset}`}>
            <p className="font-bold opacity-30 uppercase tracking-widest text-sm">Hệ thống trống</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {agents.map((agent) => (
              <div 
                key={agent.agent_id} 
                className={`group rounded-[2.5rem] bg-base-200 p-6 flex flex-col items-center transition-all duration-300 ${neoFlat} hover:scale-[1.02]`}
              >
                <div className={`w-32 h-32 rounded-full bg-base-200 flex items-center justify-center p-3 mb-6 ${neoInset}`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-base-300/20">
                    <img 
                      src={agent.avatarUrl || ''} 
                      alt={agent.name} 
                      className="w-full h-full object-contain transition-transform group-hover:scale-110" 
                      onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=fallback')}
                    />
                  </div>
                </div>
                
                <div className="text-center w-full mb-6">
                  <h2 className="text-xl font-black tracking-tight truncate px-2">{agent.name || 'Vô danh'}</h2>
                  <div className={`mt-2 py-1 px-3 rounded-full inline-block bg-base-200 text-[10px] font-black opacity-50 uppercase tracking-wider ${neoInset}`}>
                    {agent.style || 'Mặc định'}
                  </div>
                </div>
                
                <p className="text-xs text-center opacity-60 h-12 overflow-hidden line-clamp-2 mb-8 italic px-2">
                  "{agent.description || 'Không có mô tả cho thực thể này.'}"
                </p>
                
                <Link 
                  href={`/agents/chat?id=${agent.agent_id}`}
                  className={`w-full py-4 rounded-2xl bg-base-200 font-black text-center text-xs tracking-widest text-primary transition-all uppercase ${neoFlat} ${neoPressed}`}
                >
                  Trò chuyện
                </Link>
                
                <div className="mt-6 text-[8px] font-bold opacity-20 uppercase tracking-tighter">
                  {/* Bảo vệ split bằng optional chaining và giá trị mặc định */}
                  ID: {agent.agent_id?.split('-')[0] || 'Unknown'} | {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}