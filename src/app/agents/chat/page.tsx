'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Send,
  ArrowLeft,
  Cpu,
  AlertCircle,
  History
} from 'lucide-react';
import { PGlite } from '@electric-sql/pglite';

import * as GroqService from "./_domain/groq";

const NEO_FLAT =
  'bg-base-200 shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]';
const NEO_INSET =
  'bg-base-200 shadow-[inset:6px_6px_12px_#b8b9be,inset_-6px_-6px_#ffffff]';
const NEO_PRESSED =
  'active:shadow-[inset:4px:4px:8px_#b8b9be,inset_-4px_-4px:8px_#ffffff] transition-all';

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
  
  const targetId = searchParams.get('id'); // string | null

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

    if (!targetId) {
      setError('Thiếu ID agent.');
      return;
    }

    const safeId: string = targetId;

    async function init() {
      try {
        // ===== INIT DB =====
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

        // ===== LOAD AGENT (SAFE) =====
        let agents: AgentData[] = [];

        try {
          const root = await navigator.storage.getDirectory();
          const systemAgentsDir = await root.getDirectoryHandle('system-agents', { create: true });
          const membersDir = await systemAgentsDir.getDirectoryHandle('members', { create: true });

          let text = '[]';

          try {
            const fileHandle = await membersDir.getFileHandle('agent_members.json');
            const file = await fileHandle.getFile();
            text = await file.text();
          } catch {
            console.warn('Chưa có agent_members.json');
          }

          agents = JSON.parse(text || '[]');
        } catch (err) {
          console.error('Lỗi OPFS:', err);
        }

        const found = agents.find(a => a.agent_id === safeId);

        if (!found) {
          setError('Không tìm thấy agent.');
          return;
        }

        if (isMounted) setAgent(found);

        // ===== LOAD API KEY =====
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

            if (typeof GroqService.fetchGroqModels === 'function') {
              const fetched = await GroqService.fetchGroqModels(key);
              setModels(fetched);

              if (fetched.length > 0) {
                setSelectedModel(fetched[0].id);
              }
            }
          }
        } catch {
          console.warn('Không có API key → offline mode');
        }

        await refreshMessages(db, safeId);

      } catch (err: any) {
        setError(err.message);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ===== SEND MESSAGE =====
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !agent || !pg || isTyping) return;

    const userText = input.trim();
    const now = Date.now();

    setInput('');

    try {
      await pg.query(
        `INSERT INTO messages VALUES ($1,$2,$3,$4,$5)`,
        [`msg_${now}`, agent.agent_id, 'user', userText, now]
      );

      await refreshMessages(pg, agent.agent_id);

      // ===== OFFLINE MODE =====
      if (!apiKey) {
        await pg.query(
          `INSERT INTO messages VALUES ($1,$2,$3,$4,$5)`,
          [`ai_${Date.now()}`, agent.agent_id, 'assistant', '⚠️ No API key', Date.now()]
        );

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

      await pg.query(
        `INSERT INTO messages VALUES ($1,$2,$3,$4,$5)`,
        [`ai_${Date.now()}`, agent.agent_id, 'assistant', reply, Date.now()]
      );

      await refreshMessages(pg, agent.agent_id);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTyping(false);
    }
  };

  // ===== UI =====
  if (error)
    return (
      <div className="h-screen flex items-center justify-center font-mono">
        <div className={`${NEO_FLAT} p-12 rounded-[3rem] text-error`}>
          <AlertCircle className="mx-auto mb-4" />
          <p className="text-xs font-black uppercase">{error}</p>

          <button
            onClick={() => router.push('/agents')}
            className="mt-6 text-primary"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );

  if (!agent)
    return (
      <div className="h-screen flex items-center justify-center opacity-20 uppercase text-xs">
        Loading...
      </div>
    );
  
  return (
    <div className="flex h-screen flex-col bg-base-200 font-mono">
      <header className={`${NEO_FLAT} p-4 flex items-center gap-4`}>
        <button onClick={() => router.back()} className={`${NEO_FLAT} p-2 rounded`}>
          <ArrowLeft size={16} />
        </button>
        <h2 className="font-black uppercase text-xs">{agent.name}</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className="inline-block p-3 rounded-xl bg-base-300">
              {m.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="opacity-40 text-xs flex gap-2">
            <Cpu size={12} /> AI đang trả lời...
          </div>
        )}

        <div ref={scrollRef} />
      </main>

      <footer className="p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Nhập tin nhắn..."
          />
          <button type="submit" className="px-4 bg-primary text-white rounded">
            <Send size={16} />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <ChatContent />
    </Suspense>
  );
}