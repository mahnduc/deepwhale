'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Send, ArrowLeft, Bot, User, MoreVertical, Hash } from 'lucide-react';

interface AgentData {
    agent_id: string;
    name: string;
    description: string;
    avatarUrl: string;
    style: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Hàm lấy dữ liệu từ OPFS (Giữ nguyên logic đường dẫn đã sửa ở các bước trước)
async function getAgentFromOPFS(agentId: string): Promise<AgentData | null> {
    try {
        const root = await navigator.storage.getDirectory();
        const agentsDir = await root.getDirectoryHandle('agents', { create: false });
        const membersDir = await agentsDir.getDirectoryHandle('members', { create: false });
        const fileHandle = await membersDir.getFileHandle('agent_members.json', { create: false });

        const file = await fileHandle.getFile();
        const text = await file.text();
        if (!text) return null;

        const allAgents: AgentData[] = JSON.parse(text);
        return allAgents.find(a => a.agent_id === agentId) || null;
    } catch (err) {
        return null;
    }
}

function ChatContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const agentId = searchParams.get('id');

    const [agent, setAgent] = useState<AgentData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Giao thức đã được thiết lập. Tôi sẵn sàng xử lý yêu cầu của bạn.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Neumorphism Utility Classes
    const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
    const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
    const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

    useEffect(() => {
        if (!agentId) {
            setError('Định danh thực thể không hợp lệ.');
            return;
        }
        (async () => {
            const data = await getAgentFromOPFS(agentId);
            if (!data) {
                setError('Thực thể không tồn tại trong bộ nhớ cục bộ.');
                return;
            }
            setAgent(data);
        })();
    }, [agentId]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !agent) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Giả lập phản hồi AI
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `Phán quyết từ ${agent.name}: Phân tích dữ liệu hoàn tất. Logic yêu cầu của bạn đã được ghi nhận vào hạt nhân hệ thống.`,
                    timestamp: new Date()
                }
            ]);
        }, 1500);
    };

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center gap-6 bg-base-200 p-8">
            <div className={`p-10 rounded-[2.5rem] bg-base-200 text-center ${neoFlat}`}>
                <p className="text-error font-black uppercase tracking-tighter mb-4">{error}</p>
                <button onClick={() => router.push('/agents')} className={`btn btn-ghost uppercase text-xs tracking-widest ${neoFlat}`}>Quay lại danh bạ</button>
            </div>
        </div>
    );

    if (!agent) return (
        <div className="h-screen flex items-center justify-center bg-base-200">
            <span className="loading loading-ring loading-lg opacity-20"></span>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-base-200 text-base-content overflow-hidden">
            
            {/* --- Header --- */}
            <header className={`z-10 flex items-center justify-between px-6 py-4 bg-base-200 ${neoFlat}`}>
                <div className="flex items-center gap-4">
                    <Link href="/agents" className={`p-3 rounded-xl bg-base-200 text-base-content/50 hover:text-primary transition-all ${neoPressed}`}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div className={`p-1 rounded-full bg-base-200 ${neoInset}`}>
                        <img src={agent.avatarUrl} className="w-10 h-10 rounded-full object-cover" alt={agent.name} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                            {agent.name}
                            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(0,255,0,0.4)] animate-pulse"></span>
                        </h2>
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{agent.style} Interface</p>
                    </div>
                </div>
                <button className={`p-3 rounded-xl bg-base-200 opacity-40 ${neoPressed}`}>
                    <MoreVertical size={20} />
                </button>
            </header>

            {/* --- Chat Window --- */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-base-200">
                {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar Icon */}
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-base-200 ${neoFlat}`}>
                                {m.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-primary" />}
                            </div>

                            {/* Bubble */}
                            <div>
                                <div className={`px-5 py-4 rounded-[1.8rem] text-sm leading-relaxed ${
                                    m.role === 'user' 
                                    ? `bg-base-200 text-primary font-medium ${neoFlat} rounded-tr-none` 
                                    : `bg-base-200 opacity-80 ${neoInset} rounded-tl-none`
                                }`}>
                                    {m.content}
                                </div>
                                <p className={`text-[8px] mt-2 font-bold opacity-30 uppercase tracking-tighter ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className={`px-6 py-3 rounded-full bg-base-200 flex gap-1 ${neoInset}`}>
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce"></span>
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* --- Input Area --- */}
            <footer className="p-6 bg-base-200">
                <form onSubmit={sendMessage} className={`relative flex items-center p-2 rounded-4xl bg-base-200 ${neoInset}`}>
                    <div className="pl-4 text-primary/30">
                        <Hash size={18} />
                    </div>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={`Gửi lệnh tới ${agent.name}...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm font-medium placeholder:opacity-30"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className={`p-4 rounded-full bg-primary text-primary-content transition-all hover:scale-105 disabled:opacity-20 disabled:grayscale ${neoFlat} ${neoPressed}`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="h-screen bg-base-200" />}>
            <ChatContent />
        </Suspense>
    );
}