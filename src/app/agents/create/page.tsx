'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AVATAR_STYLES = [
  { id: 'bottts', name: 'Robot' },
  { id: 'avataaars', name: 'Con người' },
  { id: 'pixel-art', name: 'Pixel' },
  { id: 'lorelei', name: 'Dễ thương' },
  { id: 'identicon', name: 'Trừu tượng' },
];

interface AgentData {
  agent_id: string;
  name: string;
  description: string;
  avatarUrl: string;
  style: string;
  seed: string;
  createdAt: string;
}

export default function CreateNewAgent() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('bottts');
  const [seed, setSeed] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (name.trim() && !seed) {
      setSeed(name.trim());
    }
  }, [name, seed]);

  useEffect(() => {
    if (seed) {
      const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
      setAvatarUrl(url);
    } else {
      setAvatarUrl(null);
    }
  }, [style, seed]);

  const handleRandomize = () => {
    const randomString = Math.random().toString(36).substring(7);
    setSeed(randomString);
  };

  const saveToSingleFileOPFS = async (newAgent: AgentData) => {
    try {
      const root = await navigator.storage.getDirectory();
      const agentsDir = await root.getDirectoryHandle('system-agents', { create: true });
      const membersDir = await agentsDir.getDirectoryHandle('members', { create: true });
      const fileHandle = await membersDir.getFileHandle('agent_members.json', { create: true });
      
      let currentAgents: AgentData[] = [];
      try {
        const file = await fileHandle.getFile();
        const text = await file.text();
        if (text) {
          currentAgents = JSON.parse(text);
        }
      } catch (e) {
        console.log("Khởi tạo danh sách mới hoặc file trống");
      }

      currentAgents.push(newAgent);

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(currentAgents, null, 2));
      await writable.close();
      return true;
    } catch (error) {
      console.error("OPFS Error:", error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn load lại trang
    if (!avatarUrl || !name.trim()) return;

    setIsSaving(true);
    const newAgent: AgentData = {
      agent_id: crypto.randomUUID(),
      name: name.trim(),
      description,
      avatarUrl,
      style,
      seed,
      createdAt: new Date().toISOString(),
    };

    const success = await saveToSingleFileOPFS(newAgent);
    
    if (success) {
      router.push('/agents');
      router.refresh();
    } else {
      alert("Lỗi lưu trữ dữ liệu vào OPFS!");
    }
    setIsSaving(false);
  };

  // Styles Neumorphism
  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_5px_5px_10px_rgba(0,0,0,0.1),inset_-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 flex justify-center items-start text-base-content transition-colors duration-300">
      <div className="w-full max-w-2xl bg-base-200">

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          
          <div className="flex justify-between items-center pb-6 border-b border-base-content/5">
            {/* <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase">Kích hoạt Agent</h2>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em] mt-1">Hệ thống thực thể số</p>
            </div>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-base-200 text-error transition-all ${neoFlat} ${neoPressed}`}
            >
              ✕
            </button> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center gap-8">
              <div className="relative">
                <div className={`w-52 h-52 rounded-full bg-base-200 flex items-center justify-center p-4 ${neoInset}`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-base-300/30">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[10px] font-black opacity-20 tracking-widest">OFFLINE</div>
                    )}
                  </div>
                </div>
                
                <button 
                  type="button"
                  onClick={handleRandomize}
                  className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-base-200 flex items-center justify-center text-primary transition-all ${neoFlat} ${neoPressed}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-black opacity-40 uppercase mb-4 block ml-2 tracking-widest">Cấu trúc hình thái</label>
                <div className="grid grid-cols-2 gap-4">
                  {AVATAR_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStyle(s.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-none outline-none ${
                        style === s.id 
                        ? `bg-base-200 text-primary ${neoInset}` 
                        : `bg-base-200 text-base-content/70 ${neoFlat} hover:text-base-content`
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black opacity-40 uppercase ml-2 tracking-widest">Danh tính định danh</label>
                <input
                  type="text"
                  placeholder="AGENT NAME..."
                  className={`w-full py-4 px-6 rounded-2xl bg-base-200 outline-none border-none focus:text-primary font-bold placeholder:opacity-20 ${neoInset}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black opacity-40 uppercase ml-2 tracking-widest">Chỉ thị thuật toán</label>
                <textarea
                  className={`w-full py-4 px-6 rounded-2xl bg-base-200 outline-none border-none focus:text-primary h-48 resize-none font-medium placeholder:opacity-20 leading-relaxed ${neoInset}`}
                  placeholder="Mô tả chức năng cốt lõi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all uppercase tracking-widest ${
                isSaving 
                ? `bg-base-200 opacity-50 ${neoInset}` 
                : `bg-base-200 text-primary ${neoFlat} hover:scale-[0.99] ${neoPressed}`
              }`}
            >
              {isSaving ? 'Đang đúc...' : 'Tạo mới Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}