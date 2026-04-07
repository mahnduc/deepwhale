'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePdfProcessor } from './_hooks/usePdfProcessor';
import ReactMarkdown from 'react-markdown';
import { 
  Trash2, FileUp, Menu, ChevronLeft, 
  Eye, Plus, Terminal, Edit3, Save, FileText
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
    } catch (e) { console.error("OPFS Load Error", e); }
  }, []);

  const saveFile = async (doc: any) => {
    try {
      const folder = await getFolderHandle();
      const handle = await folder.getFileHandle(`${doc.id}.json`, { create: true });
      const writable = await handle.createWritable();
      await writable.write(JSON.stringify(doc));
      await writable.close();
      await loadFiles();
    } catch (e) { console.error("OPFS Save Error", e); }
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
    } catch (e) { console.error("OPFS Delete Error", e); }
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
    <div className="flex h-full bg-[var(--color-ui-bg)] overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`shrink-0 transition-all duration-300 border-r border-[var(--color-ui-border)] flex flex-col bg-[var(--color-ui-card)] ${isSidebarOpen ? 'w-72' : 'w-0 opacity-0'}`}>
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--color-ui-border)]">
          <h6>Tài liệu</h6>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-[var(--color-ui-bg)] rounded-md text-[var(--color-icon-muted)]">
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {history.length === 0 && (
            <div className="ui-card-outline border-dashed text-center py-8">
              <p className="text-[11px] uppercase tracking-widest text-[var(--color-ui-text-subtle)]">Trống</p>
            </div>
          )}
          {history.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => { setActiveId(doc.id); setMarkdown(doc.content); setStatus('idle'); }}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                activeId === doc.id ? 'bg-[var(--color-brand-primary)]/10' : 'hover:bg-[var(--color-ui-bg)]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${activeId === doc.id ? 'text-[var(--color-brand-primary)]' : 'text-[var(--color-ui-text-main)]'}`}>{doc.name}</p>
                <p className="text-[10px] text-[var(--color-ui-text-subtle)] font-mono">{doc.date}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFile(doc.id); }} 
                className="opacity-0 group-hover:opacity-100 p-1.5 text-[var(--color-ui-text-subtle)] hover:text-[var(--color-state-error)] transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-[var(--color-ui-border)]">
           <label className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--color-brand-primary)] text-white rounded-lg cursor-pointer hover:opacity-90 transition-all text-xs font-bold uppercase tracking-wider">
              <Plus size={14} />
              Tải PDF
              <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
           </label>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Navbar */}
        <header className="h-14 px-6 border-b border-[var(--color-ui-border)] flex items-center justify-between shrink-0 bg-[var(--color-ui-bg)]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 min-w-0">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[var(--color-ui-border)]/40 rounded-md text-[var(--color-icon-muted)]">
                <Menu size={18} />
              </button>
            )}
            <div className="flex flex-col">
              <h4 className="!m-0 truncate max-w-[200px] md:max-w-md">
                {activeDoc ? activeDoc.name : 'Bộ chuyển đổi Markdown'}
              </h4>
              {status === 'loading' && (
                <div className="flex items-center gap-2 text-[10px] text-[var(--color-brand-primary)] font-bold uppercase">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
                  Đang xử lý {progress}%
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeDoc && (
              <div className="flex bg-[var(--color-ui-card)] p-1 rounded-lg border border-[var(--color-ui-border)]">
                <button 
                  onClick={() => setViewMode('preview')} 
                  className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${viewMode === 'preview' ? 'bg-[var(--color-ui-bg)] shadow-sm text-[var(--color-brand-primary)]' : 'text-[var(--color-ui-text-subtle)] hover:text-[var(--color-ui-text-main)]'}`}
                >
                  <Eye size={12} /> Xem
                </button>
                <button 
                  onClick={() => setViewMode('edit')} 
                  className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${viewMode === 'edit' ? 'bg-[var(--color-ui-bg)] shadow-sm text-[var(--color-brand-primary)]' : 'text-[var(--color-ui-text-subtle)] hover:text-[var(--color-ui-text-main)]'}`}
                >
                  <Edit3 size={12} /> Sửa
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!activeDoc && status !== 'loading' ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="ui-card-outline p-16 flex flex-col items-center gap-6 max-w-sm opacity-40">
                <div className="w-20 h-20 rounded-3xl border-2 border-dashed border-[var(--color-ui-border)] flex items-center justify-center">
                  <Terminal size={32} />
                </div>
                <h6 className="!text-[var(--color-ui-text-subtle)]">Sẵn sàng nhập dữ liệu</h6>
                <p className="text-xs">Tải lên tệp PDF để bắt đầu trích xuất Markdown bằng AI thông qua MarkItDown.</p>
              </div>
            </div>
          ) : (
            <div className={`max-w-3xl mx-auto py-12 px-6 transition-all duration-500 ${status === 'loading' ? 'opacity-20 blur-xl scale-95' : 'opacity-100'}`}>
              
              <div className="ui-card min-h-[70vh] !p-8 shadow-none border-[var(--color-ui-border)]">
                {viewMode === 'edit' ? (
                  <textarea 
                    className="w-full min-h-[60vh] bg-transparent outline-none text-[14px] leading-relaxed font-mono resize-none border-none p-0 text-[var(--color-ui-text-main)]"
                    value={activeDoc?.content || markdown}
                    onChange={(e) => {
                      if (!activeId) return;
                      const newContent = e.target.value;
                      const updated = { ...activeDoc, content: newContent };
                      setHistory(prev => prev.map(d => d.id === activeId ? updated : d));
                      saveFile(updated);
                    }}
                    spellCheck={false}
                    placeholder="Nhập nội dung Markdown tại đây..."
                  />
                ) : (
                  <article className="prose prose-sm prose-slate max-w-none 
                    prose-headings:text-[var(--color-ui-text-main)] 
                    prose-p:text-[var(--color-ui-text-main)]
                    prose-a:text-[var(--color-state-info)]
                    prose-pre:bg-[var(--color-ui-bg)] prose-pre:border prose-pre:border-[var(--color-ui-border)]">
                    <ReactMarkdown>{activeDoc?.content || markdown}</ReactMarkdown>
                  </article>
                )}
              </div>

              {/* Status Footer */}
              <div className="mt-12 pt-6 border-t border-[var(--color-ui-border)] flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-ui-text-subtle)]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-state-success)] rounded-full shadow-[0_0_8px_var(--color-state-success)]" />
                  <span>Local-First Node</span>
                </div>
                <div className="flex gap-4">
                  <span>MarkItDown Protocol</span>
                  <span>DeepWhale AI Agent</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}