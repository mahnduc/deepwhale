'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePdfProcessor } from './_hooks/usePdfProcessor';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, Trash2, FileUp, Loader2, 
  Menu, ChevronLeft, Type, Eye, Plus, Terminal
} from 'lucide-react';

const OPFS_DIR = 'to-markdown';

export default function ToMarkdownPage() {
  const { processFile, status, progress, markdown, setMarkdown, setStatus } = usePdfProcessor();
  const [history, setHistory] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getFolderHandle = async () => {
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle(OPFS_DIR, { create: true });
  };

  const loadFiles = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.storage) return;
    try {
      const folder = await getFolderHandle();
      const docs = [];
      for await (const entry of folder.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          const file = await (entry as FileSystemFileHandle).getFile();
          docs.push(JSON.parse(await file.text()));
        }
      }
      setHistory(docs.sort((a, b) => Number(b.id) - Number(a.id)));
    } catch (e) { console.error("Load OPFS Error:", e); }
  }, []);

  const saveFile = async (doc: any) => {
    try {
      const folder = await getFolderHandle();
      const handle = await folder.getFileHandle(`${doc.id}.json`, { create: true });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(doc));
      await writable.close();
      await loadFiles();
    } catch (e) { console.error("Save OPFS Error:", e); }
  };

  const deleteFile = async (id: string) => {
    try {
      const folder = await getFolderHandle();
      await folder.removeEntry(`${id}.json`);
      if (activeId === id) {
        setActiveId(null);
        setMarkdown("");
      }
      await loadFiles();
    } catch (e) { console.error("Delete OPFS Error:", e); }
  };

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setActiveId(null); 
    const output = await processFile(file);
    if (output) {
      const newId = Date.now().toString();
      const newDoc = {
        id: newId,
        name: file.name.replace('.pdf', ''),
        content: output.result,
        date: new Date().toLocaleDateString('vi-VN'),
      };
      setActiveId(newId);
      await saveFile(newDoc);
    }
    e.target.value = '';
  };

  const activeDoc = history.find(d => d.id === activeId);

  return (
    <div className="flex h-screen bg-base-100 text-base-content antialiased overflow-hidden">
      
      {/* Sidebar - State-driven Minimalist */}
      <aside className={`transition-all duration-300 border-r border-base-300 flex flex-col bg-base-100 ${isSidebarOpen ? 'w-72' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-base-300 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Tài liệu</span>
          <button onClick={() => setIsSidebarOpen(false)} className="btn btn-ghost btn-xs btn-square opacity-40 hover:opacity-100">
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {history.length === 0 && (
            <div className="p-10 text-center opacity-20 text-[10px] font-bold uppercase tracking-widest italic">Registry Empty</div>
          )}
          {history.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => { setActiveId(doc.id); setMarkdown(doc.content); setStatus('idle'); }}
              className={`group flex items-center gap-3 p-4 border-b border-base-300 cursor-pointer transition-colors ${
                activeId === doc.id ? 'bg-base-200/60' : 'hover:bg-base-200/30'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${activeId === doc.id ? 'text-primary' : ''}`}>{doc.name}</p>
                <p className="text-[10px] font-mono opacity-30 mt-1 uppercase tracking-tighter">{doc.date}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFile(doc.id); }} 
                className="opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-error transition-all p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-base-300">
           <label className="btn btn-primary btn-sm btn-block rounded-none gap-2 text-[10px] font-black uppercase tracking-widest">
              <Plus size={14} />
              Tải PDF Mới
              <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
           </label>
        </div>
      </aside>

      {/* Main Content Area - Content-first */}
      <main className="flex-1 flex flex-col min-w-0 bg-base-100">
        
        {/* Header - Flat & Sticky */}
        <header className="h-16 px-6 border-b border-base-300 flex items-center justify-between sticky top-0 bg-base-100/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4 min-w-0">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-sm btn-square opacity-40 hover:opacity-100">
                <Menu size={18} />
              </button>
            )}
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold truncate tracking-tight">
                {activeDoc ? activeDoc.name : 'Chưa có tài liệu'}
              </h1>
              {status === 'loading' && (
                <div className="flex items-center gap-2 text-[9px] text-primary font-black uppercase tracking-widest">
                  <span className="loading loading-spinner loading-xs h-3 w-3"></span>
                  Processing {progress}%
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeDoc && (
              <div className="flex bg-base-200/50 p-1 rounded-none border border-base-300">
                <button 
                  onClick={() => setViewMode('preview')} 
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-base-100 shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                >
                  Xem
                </button>
                <button 
                  onClick={() => setViewMode('edit')} 
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'edit' ? 'bg-base-100 shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                >
                  Sửa
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Feed */}
        <div className="flex-1 overflow-y-auto">
          {!activeDoc && status !== 'loading' ? (
            <div className="py-40 flex flex-col items-center justify-center text-center opacity-10 select-none">
              <Terminal size={64} strokeWidth={1} className="mb-6" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">Waiting for Input</h2>
            </div>
          ) : (
            <div className={`max-w-2xl mx-auto py-12 px-6 transition-opacity duration-300 ${status === 'loading' ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
              
              {viewMode === 'edit' ? (
                <textarea 
                  className="w-full min-h-[70vh] bg-transparent focus:outline-none text-[15px] leading-relaxed font-mono resize-none border-none p-0"
                  value={activeDoc?.content || markdown}
                  onChange={(e) => {
                    if (!activeId) return;
                    const newContent = e.target.value;
                    const updated = { ...activeDoc, content: newContent };
                    setHistory(prev => prev.map(d => d.id === activeId ? updated : d));
                    saveFile(updated);
                  }}
                  spellCheck={false}
                  placeholder="Bắt đầu nhập nội dung..."
                />
              ) : (
                <article className="prose prose-sm lg:prose-base prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-relaxed prose-pre:bg-base-200/50 prose-pre:text-base-content prose-pre:rounded-none">
                  <ReactMarkdown>{activeDoc?.content || markdown}</ReactMarkdown>
                </article>
              )}

              {/* Status Footer inside Content Area */}
              <div className="mt-20 pt-10 border-t border-base-300 flex justify-between items-center opacity-20">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest">Local-First Storage</span>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Protocol: MarkItDown/DeepWhale</span>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}