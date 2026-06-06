"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save, Trash2, FileText, ChevronDown, RefreshCw,
  Network, Edit3, Hash, Link2, Info, Plus, FolderPlus
} from 'lucide-react';
import dynamic from 'next/dynamic';

interface FileItem {
  name: string;
  cleanName: string;
}

interface NoteMetadata {
  title: string;
  sourceContext: string;
  content: string;
  updatedAt: string;
  characterCount: number;
  tags?: string[];
  wordCount?: number;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  type: 'file' | 'concept' | 'tag';
  degree?: number;
  pulseTimer?: number;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

type ViewMode = 'edit' | 'graph';

const ForceGraph2DClient = dynamic(
  () => import('react-force-graph-2d'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-[#030712]">
        <RefreshCw size={20} className="animate-spin mb-3 text-[#00E5FF]" />
        <span className="text-xs font-mono tracking-widest uppercase opacity-60">Đang khởi động đồ thị tri thức...</span>
      </div>
    )
  }
);

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function extractWikiLinks(content: string): string[] {
  const regex = /\[\[(.*?)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const rawLink = match[1].trim();
    if (rawLink) {
      const cleanLink = rawLink.split('|')[0].trim();
      if (cleanLink) links.push(cleanLink);
    }
  }
  return [...new Set(links)];
}

function extractTags(content: string): string[] {
  const regex = /#([a-zA-Z0-9_\-\u00C0-\u024F\u1EA0-\u1EF9/]+)/g;
  const tags: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    tags.push(match[1]);
  }
  return [...new Set(tags)];
}

export default function NoteWindow() {
  const [note, setNote] = useState<string>('');
  const [sourceFiles, setSourceFiles] = useState<FileItem[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number>(0);
  const pulseGlobalTime = useRef<number>(0);

  const wikiLinksInNote = extractWikiLinks(note);
  const tagsInNote = extractTags(note);
  const wordCount = countWords(note);

  const refreshFileList = useCallback(async (selectTarget?: string) => {
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const fileList: FileItem[] = [];
      
      for await (const entry of (notebookDir as any).values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          fileList.push({ name: entry.name, cleanName: entry.name.replace('.json', '') });
        }
      }
      
      fileList.sort((a, b) => a.cleanName.localeCompare(b.cleanName));
      setSourceFiles(fileList);

      if (selectTarget) {
        setSelectedSource(selectTarget);
      } else if (fileList.length > 0 && !selectedSource) {
        setSelectedSource(fileList[0].cleanName);
      }
    } catch (error) {
      console.error('Lỗi khi truy xuất kho lưu trữ OPFS:', error);
    }
  }, [selectedSource]);

  useEffect(() => {
    refreshFileList();
  }, []);

  useEffect(() => {
    const updatePulse = () => {
      pulseGlobalTime.current += 0.04; // Tốc độ đập nhẹ hiệu ứng động
      animationFrameRef.current = requestAnimationFrame(updatePulse);
    };
    if (viewMode === 'graph') {
      animationFrameRef.current = requestAnimationFrame(updatePulse);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [viewMode]);

  useEffect(() => {
    if (!selectedSource) { setNote(''); return; }
    async function fetchExistingNote() {
      setIsLoading(true);
      setIsDirty(false);
      try {
        const root = await navigator.storage.getDirectory();
        const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
        try {
          const fileHandle = await notebookDir.getFileHandle(`${selectedSource}.json`);
          const file = await fileHandle.getFile();
          const text = await file.text();
          if (text) {
            const parsed: NoteMetadata = JSON.parse(text);
            setNote(parsed.content || '');
          } else {
            setNote('');
          }
        } catch {
          setNote('');
        }
      } catch (error) {
        console.error('Lỗi nạp văn bản:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchExistingNote();
  }, [selectedSource]);

  const performSave = useCallback(async (content: string, silent = false) => {
    if (!selectedSource) return;
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const fileHandle = await notebookDir.getFileHandle(`${selectedSource}.json`, { create: true });
      
      const payload: NoteMetadata = {
        title: selectedSource,
        sourceContext: selectedSource,
        content,
        updatedAt: new Date().toISOString(),
        characterCount: content.length,
        wordCount: countWords(content),
        tags: extractTags(content),
      };
      
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(payload, null, 2));
      await writable.close();
      setIsDirty(false);
      if (!silent) showStatus('Đã ghi nhận thay đổi');
    } catch {
      if (!silent) showStatus('Lưu dữ liệu thất bại!');
    }
  }, [selectedSource]);

  const handleNoteChange = (val: string) => {
    setNote(val);
    setIsDirty(true);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (selectedSource) performSave(val, true);
    }, 2000);
  };

  const handleSave = () => performSave(note, false);

  const handleCreateNewNote = async () => {
    const rawName = prompt('Nhập tên cho ghi chú mới');
    if (!rawName) return;
    
    const cleanName = rawName.trim().replace(/[/\\?%*:|"<>. ]/g, '-');
    if (!cleanName) return;

    if (sourceFiles.some(f => f.cleanName.toLowerCase() === cleanName.toLowerCase())) {
      setSelectedSource(cleanName);
      return;
    }

    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const fileHandle = await notebookDir.getFileHandle(`${cleanName}.json`, { create: true });
      
      const initialPayload: NoteMetadata = {
        title: cleanName,
        sourceContext: cleanName,
        content: `# ${cleanName}\n\nBắt đầu viết tại đây...`,
        updatedAt: new Date().toISOString(),
        characterCount: 0,
        wordCount: 0,
        tags: []
      };

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(initialPayload, null, 2));
      await writable.close();
      
      await refreshFileList(cleanName);
      setViewMode('edit');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedSource || !confirm(`Xóa vĩnh viễn ghi chú "${selectedSource}"?`)) return;
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      await notebookDir.removeEntry(`${selectedSource}.json`);
      
      const nextIndex = sourceFiles.findIndex(f => f.cleanName === selectedSource);
      let newSelection = '';
      if (sourceFiles.length > 1) {
        newSelection = nextIndex === 0 ? sourceFiles[1].cleanName : sourceFiles[nextIndex - 1].cleanName;
      }
      setSelectedSource(newSelection);
      await refreshFileList(newSelection);
    } catch (err) {
      console.error(err);
    }
  };

  const buildGraphNetwork = useCallback(async () => {
    setIsLoading(true);
    try {
      const root = await navigator.storage.getDirectory();
      const notebookDir = await root.getDirectoryHandle('notebook', { create: true });
      const nodesMap = new Map<string, GraphNode>();
      const links: GraphLink[] = [];
      const degreeCount = new Map<string, number>();
      const rawLinks: { source: string; targets: string[] }[] = [];
      const noteToTagsMap = new Map<string, string[]>();

      for await (const entry of (notebookDir as any).values()) {
        if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue;
        const fh = await notebookDir.getFileHandle(entry.name);
        const file = await fh.getFile();
        const text = await file.text();
        if (!text) continue;
        try {
          const parsed: NoteMetadata = JSON.parse(text);
          const currentFileName = parsed.title || entry.name.replace('.json', '');
          const content = parsed.content || '';
          
          nodesMap.set(currentFileName, {
            id: currentFileName,
            name: currentFileName,
            val: Math.max(7, Math.min(18, 7 + content.length / 300)),
            type: 'file',
          });

          const wikiLinks = extractWikiLinks(content);
          if (wikiLinks.length > 0) rawLinks.push({ source: currentFileName, targets: wikiLinks });

          const tags = extractTags(content);
          if (tags.length > 0) noteToTagsMap.set(currentFileName, tags);
        } catch {}
      }

      noteToTagsMap.forEach((tags, noteTitle) => {
        tags.forEach(tag => {
          const tagId = `#${tag}`;
          if (!nodesMap.has(tagId)) {
            nodesMap.set(tagId, { id: tagId, name: tagId, val: 8, type: 'tag' });
          }
          links.push({ source: noteTitle, target: tagId });
          degreeCount.set(noteTitle, (degreeCount.get(noteTitle) || 0) + 1);
          degreeCount.set(tagId, (degreeCount.get(tagId) || 0) + 1);
        });
      });

      rawLinks.forEach(({ source, targets }) => {
        targets.forEach(conceptName => {
            if (conceptName === source) return;

            if (conceptName.includes('/') || conceptName.includes(' -> ')) {
            const separator = conceptName.includes('/') ? '/' : ' -> ';
            const parts = conceptName.split(separator).map(p => p.trim()).filter(Boolean);
            
            if (parts.length > 1) {
                for (let i = 0; i < parts.length; i++) {
                const currentNodeName = parts[i];
                
                // 1. Khởi tạo Node cho cấp hiện tại nếu chưa có (Ví dụ: tạo nút 'english' hoặc 'haha')
                if (!nodesMap.has(currentNodeName)) {
                    nodesMap.set(currentNodeName, {
                    id: currentNodeName,
                    name: currentNodeName,
                    val: i === 0 ? 9 : 5, // Nút cha cấp 1 cấp thêm trọng lượng để nhìn to hơn một chút
                    type: 'concept'
                    });
                }
                
                // 2. Nếu là phần tử đầu tiên, nối nó với Ghi chú gốc (Source ──> english)
                if (i === 0) {
                    if (!links.some(l => l.source === source && l.target === currentNodeName)) {
                    links.push({ source, target: currentNodeName });
                    degreeCount.set(source, (degreeCount.get(source) || 0) + 1);
                    degreeCount.set(currentNodeName, (degreeCount.get(currentNodeName) || 0) + 1);
                    }
                } else {
                    // 3. Nếu là cấp con, nối nó với cấp cha ngay trước nó (english ──> haha)
                    const parentNodeName = parts[i - 1];
                    if (!links.some(l => l.source === parentNodeName && l.target === currentNodeName)) {
                    links.push({ source: parentNodeName, target: currentNodeName });
                    degreeCount.set(parentNodeName, (degreeCount.get(parentNodeName) || 0) + 1);
                    degreeCount.set(currentNodeName, (degreeCount.get(currentNodeName) || 0) + 1);
                    }
                }
                }
                return;
            }
            }

          if (!nodesMap.has(conceptName)) {
            nodesMap.set(conceptName, { id: conceptName, name: conceptName, val: 5, type: 'concept' });
          }
          if (!links.some(l => l.source === source && l.target === conceptName)) {
            links.push({ source, target: conceptName });
            degreeCount.set(source, (degreeCount.get(source) || 0) + 1);
            degreeCount.set(conceptName, (degreeCount.get(conceptName) || 0) + 1);
          }
        });
      });

      for (const [id, node] of nodesMap) {
        node.degree = degreeCount.get(id) || 0;
        if (node.type === 'tag') {
          node.val = Math.min(22, 8 + (node.degree * 2.5));
        } else if (node.type === 'concept' && node.degree > 1) {
          node.val = Math.min(14, node.val + (node.degree * 0.7));
        }
      }

      setGraphData({ nodes: Array.from(nodesMap.values()), links });
    } catch (err) {
      console.error(err);
    } {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'graph') buildGraphNetwork();
  }, [viewMode, buildGraphNetwork]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => { setStatusMessage(''); }, 2500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      {/* HEADER BAR */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-white border-b border-slate-200/80 shrink-0 select-none z-20 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleCreateNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} className="text-[#00E5FF] stroke-[3]" />
            <span>Note mới</span>
          </button>

          <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-slate-300 transition-colors">
            <FileText size={13} className="text-slate-600 mr-2 shrink-0" />
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="appearance-none bg-transparent pr-6 text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[190px] truncate"
            >
              {sourceFiles.length === 0 ? (
                <option value="">(Trống - Vui lòng tạo note)</option>
              ) : (
                sourceFiles.map(f => (
                  <option key={f.name} value={f.cleanName}>{f.cleanName}</option>
                ))
              )}
            </select>
            <ChevronDown size={11} className="text-slate-500 absolute right-2.5 pointer-events-none" />
          </div>

          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 gap-0.5">
            {[
              { key: 'edit', label: 'Soạn thảo', icon: <Edit3 size={12} /> },
              { key: 'graph', label: 'Đồ thị tri thức', icon: <Network size={12} /> },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setViewMode(tab.key as ViewMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all
                  ${viewMode === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading && <RefreshCw size={13} className="text-[#00E5FF] animate-spin shrink-0" />}
          {isDirty && <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold">Chưa lưu</span>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusMessage && <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-lg font-medium">{statusMessage}</span>}
          {viewMode === 'edit' && selectedSource && (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-sm active:scale-95"
              >
                <Save size={13} /> Lưu nội dung
              </button>
              <button
                type="button"
                onClick={handleDeleteNote}
                disabled={isLoading}
                className="p-1.5 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 bg-white hover:bg-red-50 rounded-lg transition-all active:scale-95"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        {viewMode === 'edit' && (
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-white">
            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
              <div className="max-w-3xl mx-auto h-full">
                {!selectedSource ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 m-4">
                    <FolderPlus size={44} strokeWidth={1.2} className="text-slate-400" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-600">Hệ thống chưa có tệp lưu trữ</p>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={note}
                    onChange={e => handleNoteChange(e.target.value)}
                    disabled={isLoading}
                    placeholder="Sử dụng cú pháp Obsidian: [[Tên ghi chú]] để liên kết tri thức, phân nhóm bằng thẻ #tag..."
                    spellCheck={false}
                    className="w-full h-full resize-none outline-none text-base text-slate-800 bg-transparent leading-relaxed caret-emerald-600 font-normal font-sans tracking-wide"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ĐỒ THỊ MẠNG LƯỚI KHỐI TRÒN HIỆU ỨNG ĐA TẦNG (NO-SVG) */}
        {viewMode === 'graph' && (
          <div className="w-full h-full bg-[#030712] overflow-hidden relative">
            
            {/* Chú giải đồ thị thiết kế lại theo cấu trúc khối tròn */}
            <div className="absolute top-4 right-4 z-30 bg-[#0b0f19]/95 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 w-72 shadow-2xl pointer-events-none select-none">
              <div className="flex items-center gap-1.5 text-slate-200 text-xs font-bold border-b border-slate-800/80 pb-2 mb-2.5">
                <Info size={13} className="text-[#00E5FF]" />
                <span>Kiến trúc nút mạng lưới phát sáng</span>
              </div>
              <div className="space-y-3 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#00E5FF] ring-4 ring-cyan-500/20 shadow-[0_0_12px_#00E5FF]" />
                  <span>Ghi chú hiện tại</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  <span>Tài liệu thực tế</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full border border-[#f59e0b] bg-transparent" />
                  <span>Khái niệm ảo</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#ff007f] shadow-[0_0_10px_#ff007f]" />
                  <span>Super Tag</span>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-800/60 pt-2.5 mt-1">
                  <span className="w-5 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500" />
                  <span>Dòng chảy</span>
                </div>
              </div>
            </div>

            <ForceGraph2DClient
              graphData={graphData}
              linkDirectionalParticles={4}
              linkDirectionalParticleSpeed={0.006}
              linkDirectionalParticleWidth={2.5}
              linkDirectionalParticleColor={() => '#00E5FF'}
              linkColor={() => 'rgba(99, 102, 241, 0.2)'}
              linkWidth={1.2}
              backgroundColor="#030712"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label: string = node.name;
                const radius = Math.sqrt(node.val) * 3.8;
                const fontSize = Math.max(7, 10.5 / globalScale);
                
                ctx.save();

                // KIẾN TRÚC HIỂU ỨNG TRỰC QUAN BẰNG CANVAS (HỦY BỎ TOÀN BỘ SVG)
                if (node.id === selectedSource) {
                  // A. NODE ĐANG ACTIVE: Aura rộng lan tỏa kết hợp nét đứt chuyển động hình tròn
                  const glowRadius = radius + 6 + Math.abs(Math.sin(pulseGlobalTime.current * 1.5) * 5);
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, glowRadius, 0, 2 * Math.PI);
                  ctx.fillStyle = 'rgba(0, 229, 255, 0.08)';
                  ctx.fill();
                  
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius + 3.5, 0, 2 * Math.PI);
                  ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
                  ctx.lineWidth = 1.2;
                  ctx.setLineDash([3, 3]);
                  ctx.stroke();

                  // Tâm nút đặc phát sáng rực rỡ
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                  ctx.fillStyle = '#00E5FF';
                  ctx.shadowColor = '#00E5FF';
                  ctx.shadowBlur = 12;
                  ctx.fill();

                } else if (node.type === 'tag') {
                  // B. SUPER NODE TAG: Khối tròn hồng Cyberpunk phát sáng mạnh, viền kép nhẹ
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                  ctx.fillStyle = '#ff007f';
                  ctx.shadowColor = '#ff007f';
                  ctx.shadowBlur = 10;
                  ctx.fill();

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
                  ctx.strokeStyle = 'rgba(255, 0, 127, 0.3)';
                  ctx.lineWidth = 1;
                  ctx.stroke();

                } else if (node.type === 'file') {
                  // C. FILE THỰC TẾ TRÊN OPFS: Khối tròn Indigo thanh lịch, mịn, độ sáng nhẹ
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                  ctx.fillStyle = '#6366f1';
                  ctx.shadowColor = '#6366f1';
                  ctx.shadowBlur = 6;
                  ctx.fill();

                } else {
                  // D. KHÁI NIỆM ẢO (WIKILINKS CHƯA CÓ FILE): Vòng tròn rỗng viền vàng nhạt xuyên thấu nền tối
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius - 0.5, 0, 2 * Math.PI);
                  ctx.strokeStyle = '#f59e0b';
                  ctx.lineWidth = 1.5;
                  ctx.fillStyle = 'rgba(3, 7, 18, 0.7)'; // Hơi đục nhẹ bên trong để đè dây link phía sau
                  ctx.fill();
                  ctx.stroke();
                }

                const alpha = node.id === selectedSource 
                  ? 1.0 
                  : node.type === 'tag' 
                    ? 0.9 
                    : Math.max(0.35, Math.min(0.85, 0.35 + (node.degree || 0) * 0.15));
                
                ctx.font = `${node.id === selectedSource || node.type === 'tag' ? '600' : '400'} ${fontSize}px sans-serif`;
                ctx.fillStyle = node.type === 'tag' ? `rgba(255, 0, 127, ${alpha})` : `rgba(241, 245, 249, ${alpha})`;
                ctx.shadowBlur = 0;

                const textWidth = ctx.measureText(label).width;
                ctx.fillText(label, node.x - textWidth / 2, node.y + radius + fontSize + 4);
                
                ctx.restore();
              }}
              onNodeClick={(node: any) => {
                if (node.type === 'file') {
                  setSelectedSource(node.id);
                  setViewMode('edit');
                } else if (node.type === 'tag') {
                  showStatus(`Nhãn nhóm "${node.id}" quy tụ ${node.degree || 0} bài viết.`);
                } else {
                  showStatus(`"${node.id}" chưa khởi tạo file. Hãy bấm "Note mới" đặt tên trùng để kích hoạt`);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <footer className="px-6 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold truncate max-w-[260px]">
            notebook/{selectedSource ? `${selectedSource}.json` : 'empty'}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-medium">
          {viewMode === 'edit' && selectedSource && (
            <>
              {tagsInNote.length > 0 && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Hash size={11} className="text-[#ff007f]" /> {tagsInNote.length} thẻ phân loại
                </span>
              )}
              {wikiLinksInNote.length > 0 && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Link2 size={11} className="text-[#6366f1]" /> {wikiLinksInNote.length} liên kết chéo
                </span>
              )}
              <span className="text-slate-500 border-l border-slate-200 pl-3">{wordCount} từ · {note.length} ký tự</span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}