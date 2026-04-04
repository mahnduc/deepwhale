'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePdfProcessor } from './_hooks/usePdfProcessor';
import ReactMarkdown from 'react-markdown';
import { 
  FileText, Trash2, FileUp, Loader2, 
  Menu, ChevronLeft, Type, Eye, Save
} from 'lucide-react';

const OPFS_DIR = 'to-markdown';

export default function ToMarkdownPage() {
  const { processFile, status, progress, markdown, setMarkdown, setStatus } = usePdfProcessor();
  const [history, setHistory] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Logic OPFS giữ nguyên để đảm bảo chức năng ---
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
    <div className="flex h-screen bg-base-100 text-base-content antialiased">
      {/* Sidebar - Minimalist Style */}
      <aside className={`bg-base-200/50 transition-all duration-300 border-r border-base-300 flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-widest uppercase opacity-50">Thư viện</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="btn btn-ghost btn-xs btn-circle">
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {history.length === 0 && (
            <div className="text-center py-20 opacity-30 italic text-sm">Trống</div>
          )}
          {history.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => { setActiveId(doc.id); setMarkdown(doc.content); setStatus('idle'); }}
              className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                activeId === doc.id ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' : 'hover:bg-base-300'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className={`text-[10px] opacity-60 ${activeId === doc.id ? 'text-white' : ''}`}>{doc.date}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFile(doc.id); }} 
                className={`btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 ${activeId === doc.id ? 'hover:bg-primary-focus' : 'text-error'}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-base-300">
           <label className="btn btn-primary btn-block rounded-2xl gap-2 shadow-sm">
              <FileUp size={18} />
              <span className="normal-case">Tải tài liệu</span>
              <input type="file" accept=".pdf" hidden onChange={handleFileChange} />
           </label>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-30 px-6 border-b border-base-200">
          <div className="flex-1 gap-2">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-square">
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 className="text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                {activeDoc ? activeDoc.name : 'Untitled Document'}
              </h1>
              {status === 'loading' && (
                <div className="flex items-center gap-2 text-[10px] text-primary font-bold uppercase tracking-tighter">
                   <span className="loading loading-spinner loading-xs"></span>
                   Đang xử lý {progress}%
                </div>
              )}
            </div>
          </div>

          <div className="flex-none gap-4">
            {activeDoc && (
              <div className="join bg-base-200 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('preview')} 
                  className={`join-item btn btn-xs border-none rounded-lg ${viewMode === 'preview' ? 'btn-active shadow-sm' : 'btn-ghost opacity-50'}`}
                >
                  <Eye size={14} className="mr-1" /> Xem
                </button>
                <button 
                  onClick={() => setViewMode('edit')} 
                  className={`join-item btn btn-xs border-none rounded-lg ${viewMode === 'edit' ? 'btn-active shadow-sm' : 'btn-ghost opacity-50'}`}
                >
                  <Type size={14} className="mr-1" /> Sửa
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto bg-base-100 flex justify-center p-4 md:p-8">
          {!activeDoc && status !== 'loading' ? (
            <div className="flex flex-col items-center justify-center text-center max-w-sm opacity-40 select-none pt-20">
              <div className="bg-base-200 p-10 rounded-[3rem] mb-6">
                <FileText size={64} strokeWidth={1} />
              </div>
              <p className="text-lg font-light tracking-tight">Bắt đầu bằng cách chọn một tệp từ thư viện hoặc tải lên PDF mới.</p>
            </div>
          ) : (
            <div className={`w-full max-w-3xl transition-all duration-500 ${status === 'loading' ? 'blur-sm opacity-50' : 'opacity-100'}`}>
              <div className="card bg-base-100 min-h-full">
                {viewMode === 'edit' ? (
                  <textarea 
                    className="textarea textarea-ghost w-full min-h-[70vh] focus:outline-none p-0 text-base leading-relaxed font-mono resize-none"
                    value={activeDoc?.content || markdown}
                    onChange={(e) => {
                      if (!activeId) return;
                      const newContent = e.target.value;
                      const updated = { ...activeDoc, content: newContent };
                      setHistory(prev => prev.map(d => d.id === activeId ? updated : d));
                      saveFile(updated);
                    }}
                    spellCheck={false}
                    placeholder="Bắt đầu viết..."
                  />
                ) : (
                  <article className="prose prose-slate lg:prose-lg max-w-none prose-headings:font-bold prose-a:text-primary">
                    <ReactMarkdown>{activeDoc?.content || markdown}</ReactMarkdown>
                  </article>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}