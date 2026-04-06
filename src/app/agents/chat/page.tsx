'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Send,
  ArrowLeft,
  Cpu,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { PGlite } from '@electric-sql/pglite';
import * as GroqService from "./_domain/groq";

interface AgentData {
  agent_id: string;
  name: string;
  description: string;
  avatarUrl: string;
}

interface Message {
  id: string;
  agent_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const targetId = searchParams.get('id');

  const [pg, setPg] = useState<PGlite | null>(null);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const refreshMessages = async (db: PGlite, aId: string) => {
    const res = await db.query<Message>(
      `SELECT * FROM messages WHERE agent_id = $1 ORDER BY timestamp ASC`,
      [aId]
    );
    setMessages(res.rows);
  };

  useEffect(() => {
    let isMounted = true;
    if (!targetId) { setError('Missing Agent ID'); return; }
    const safeId: string = targetId;

    async function init() {
      try {
        const db = new PGlite('opfs://chat_db');
        await db.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            agent_id TEXT,
            role TEXT,
            content TEXT,
            timestamp BIGINT
          );
        `);
        if (isMounted) setPg(db);

        // Load Agent from OPFS
        let agents: AgentData[] = [];
        try {
          const root = await navigator.storage.getDirectory();
          const systemAgentsDir = await root.getDirectoryHandle('system-agents', { create: true });
          const membersDir = await systemAgentsDir.getDirectoryHandle('members', { create: true });
          const fileHandle = await membersDir.getFileHandle('agent_members.json');
          const file = await fileHandle.getFile();
          const text = await file.text();
          agents = JSON.parse(text || '[]');
        } catch { console.warn('No agents found'); }

        const found = agents.find(a => a.agent_id === safeId);
        if (!found) { setError('Agent not found'); return; }
        if (isMounted) setAgent(found);

        // Load API Key
        try {
          const root = await navigator.storage.getDirectory();
          const systemAgentsDir = await root.getDirectoryHandle('system-agents');
          const fileHandle = await systemAgentsDir.getFileHandle('api-key');
          const file = await fileHandle.getFile();
          const keyData = await file.text();
          const keys = JSON.parse(keyData || '[]');
          if (keys.length > 0) {
            const key = keys[0].key;
            setApiKey(key);
            const fetched = await GroqService.fetchGroqModels(key);
            setModels(fetched);
            if (fetched.length > 0) setSelectedModel(fetched[0].id);
          }
        } catch { console.warn('Offline mode'); }

        await refreshMessages(db, safeId);
      } catch (err: any) { setError(err.message); }
    }
    init();
    return () => { isMounted = false; };
  }, [targetId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !agent || !pg || isTyping) return;

    const userText = input.trim();
    const now = Date.now();
    setInput('');

    try {
      await pg.query(`INSERT INTO messages VALUES ($1,$2,$3,$4,$5)`,
        [`msg_${now}`, agent.agent_id, 'user', userText, now]);
      await refreshMessages(pg, agent.agent_id);

      if (!apiKey) {
        await pg.query(`INSERT INTO messages VALUES ($1,$2,$3,$4,$5)`,
          [`ai_${Date.now()}`, agent.agent_id, 'assistant', '⚠️ No API key provided.', Date.now()]);
        await refreshMessages(pg, agent.agent_id);
        return;
      }

      setIsTyping(true);
      const contextRes = await pg.query<Message>(
        `SELECT role, content FROM messages WHERE agent_id = $1 ORDER BY timestamp DESC LIMIT 10`,
        [agent.agent_id]
      );

      const reply = await GroqService.callGroqAPI({
        apiKey,
        model: selectedModel,
        systemPrompt: agent.description,
        messages: contextRes.rows.reverse(),
        userInput: userText
      });

      await pg.query(`INSERT INTO messages VALUES ($1,$2,$3,$4,$5)`,
        [`ai_${Date.now()}`, agent.agent_id, 'assistant', reply, Date.now()]);
      await refreshMessages(pg, agent.agent_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTyping(false);
    }
  };

  if (error) return (
    <div className="h-screen flex items-center justify-center bg-base-100 p-6 text-center">
      <div className="max-w-xs">
        <AlertCircle className="mx-auto mb-4 opacity-20" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-6">{error}</p>
        <button onClick={() => router.push('/agents')} className="text-xs border-b border-base-content/20 pb-1 hover:border-primary transition-colors">
          Return to Agents
        </button>
      </div>
    </div>
  );

  if (!agent) return <div className="h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.3em] opacity-20">Initializing...</div>;

  return (
    <div className="flex h-screen flex-col bg-base-100 font-sans antialiased text-base-content">
      {/* HEADER: Ultra-thin with border */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-base-200 bg-base-100/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 -ml-2 opacity-40 hover:opacity-100 transition-opacity">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div>
            <h2 className="text-sm font-medium tracking-tight">{agent.name}</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-primary" />
              <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Active Instance</span>
            </div>
          </div>
        </div>
        <button className="opacity-20 hover:opacity-100 transition-opacity">
          <MoreHorizontal size={18} />
        </button>
      </header>

      {/* MESSAGES AREA */}
      <main className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scrollbar-hide">
        <div className="max-w-2xl mx-auto w-full">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-8`}>
              <div className={`max-w-[85%] md:max-w-[70%] group`}>
                <div className={`text-[10px] uppercase tracking-widest font-bold opacity-20 mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {m.role === 'user' ? 'You' : agent.name}
                </div>
                <div className={`text-sm leading-relaxed ${m.role === 'user' ? 'text-base-content/80' : 'text-base-content'}`}>
                  {m.content}
                </div>
                <div className={`mt-2 h-[1px] w-4 bg-base-content/5 transition-all group-hover:w-full ${m.role === 'user' ? 'ml-auto' : 'mr-auto'}`} />
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3 opacity-30">
              <Cpu size={14} className="animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold italic">Processing query...</span>
            </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </main>

      {/* INPUT AREA: Minimalist floating bar */}
      <footer className="p-6 bg-base-100">
        <div className="max-w-2xl mx-auto relative">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${agent.name}...`}
              className="w-full bg-base-200/50 border border-base-200 rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:border-primary/30 focus:bg-base-100 transition-all placeholder:opacity-30"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 rounded-full text-primary hover:bg-primary/10 disabled:opacity-0 transition-all"
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </form>
          <p className="text-center text-[9px] opacity-20 mt-4 uppercase tracking-[0.3em]">
            Powered by Groq • Local SQLite (PGlite)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center opacity-10">...</div>}>
      <ChatContent />
    </Suspense>
  );
}