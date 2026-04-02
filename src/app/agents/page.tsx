'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Định nghĩa trực tiếp style để đảm bảo không bị undefined
const neoFlat = 'bg-base-200 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]';
const neoInset = 'bg-base-200 shadow-[inset:6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff]';
const neoPressed = 'active:shadow-[inset:4px:4px:8px_#b8b9be,inset_-4px_-4px:8px_#ffffff] transition-all';

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchAgents = async () => {
      if (typeof window === 'undefined' || !navigator.storage?.getDirectory) {
        setIsLoading(false);
        return;
      }

      try {
        const root = await navigator.storage.getDirectory();
        const agentsDir = await root.getDirectoryHandle('system-agents', { create: true });
        const membersDir = await agentsDir.getDirectoryHandle('members', { create: true });
        
        let data: AgentData[] = [];
        try {
          const fileHandle = await membersDir.getFileHandle('agent_members.json');
          const file = await fileHandle.getFile();
          const text = await file.text();
          if (text.trim()) {
            const parsed = JSON.parse(text);
            data = Array.isArray(parsed) ? parsed : [];
          }
        } catch (e) {
          console.info("Chưa có dữ liệu thực thể.");
        }
        setAgents(data.filter(a => a && a.agent_id));
      } catch (error) {
        console.error("Lỗi OPFS:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-base-200" />;

  return (
    <div className="min-h-screen bg-base-200 p-8 text-base-content font-mono">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Thư viện Agent</h1>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em] mt-2">Local-First Directory</p>
          </div>
          <Link 
            href="/agents/create" 
            className={`px-10 py-4 rounded-2xl font-black text-primary text-xs uppercase ${neoFlat} ${neoPressed}`}
          >
            + TẠO THỰC THỂ
          </Link>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20"><span className="loading loading-ring loading-lg opacity-20"></span></div>
        ) : agents.length === 0 ? (
          <div className={`p-24 rounded-[3rem] text-center ${neoInset}`}>
            <p className="opacity-30 uppercase text-xs font-black tracking-widest">Hệ thống trống</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {agents.map((agent) => (
              <div key={agent.agent_id} className={`group rounded-[2.5rem] p-8 ${neoFlat} transition-transform hover:scale-[1.02]`}>
                <div className={`w-24 h-24 rounded-full mx-auto mb-6 p-2 ${neoInset}`}>
                  <img 
                    src={agent.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${agent.agent_id}`} 
                    className="w-full h-full rounded-full object-cover"
                    alt="avatar"
                  />
                </div>
                <h2 className="text-center font-black uppercase text-sm truncate">{agent.name}</h2>
                <p className="text-[10px] text-center opacity-40 mb-8 line-clamp-2 h-8 mt-2 italic px-2">"{agent.description}"</p>
                <Link 
                  href={{ pathname: '/agents/chat', query: { id: agent.agent_id } }}
                  className={`block w-full py-4 rounded-xl text-center text-[10px] font-black text-primary ${neoFlat} ${neoPressed} uppercase tracking-widest`}
                >
                  Kết nối Neural
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}