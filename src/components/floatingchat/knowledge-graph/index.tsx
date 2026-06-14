"use client";

import React, { useEffect, useRef } from 'react';
import {
  Save, Trash2, FileText, ChevronDown, RefreshCw,
  Network, Edit3, Hash, Link2, Plus, FolderPlus, Type
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useNoteGraph } from './useNoteGraph';
import { extractTags, extractWikiLinks, countWords, ViewMode } from './types';

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

export default function NoteWindow() {
  const {
    note, sourceFiles, selectedSource, statusMessage, isLoading, isDirty, viewMode, graphData,
    setSelectedSource, setViewMode, handleNoteChange, handleSave, handleCreateNewNote,
    handleRenameNote, handleAutoCreateFromConcept, handleDeleteNote, showStatus
  } = useNoteGraph();

  const graphRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  const pulseGlobalTime = useRef<number>(0);

  const wikiLinksInNote = extractWikiLinks(note);
  const tagsInNote = extractTags(note);
  const wordCount = countWords(note);

  useEffect(() => {
    const updatePulse = () => {
      pulseGlobalTime.current += 0.04;
      animationFrameRef.current = requestAnimationFrame(updatePulse);
    };
    if (viewMode === 'graph') {
      animationFrameRef.current = requestAnimationFrame(updatePulse);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'graph' && graphRef.current) {
      const fg = graphRef.current;
      fg.d3Force('charge').strength(-240);
      fg.d3Force('link').distance(80);
    }
  }, [viewMode, graphData]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-white border-b border-slate-200/80 shrink-0 select-none z-20 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={handleCreateNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} className="text-[#00E5FF] stroke-3" />
            <span>Note mới</span>
          </button>

          <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 hover:border-slate-300 transition-colors">
            <FileText size={13} className="text-slate-600 mr-2 shrink-0" />
            <select
              value={selectedSource}
              onChange={e => setSelectedSource(e.target.value)}
              className="appearance-none bg-transparent pr-6 text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-47.5 truncate"
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
          {selectedSource && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRenameNote}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-950 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
                title="Đổi tên ghi chú hiện tại"
              >
                <Type size={13} className="text-slate-500" /> Đổi tên
              </button>

              {viewMode === 'edit' && (
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
          )}
        </div>
      </header>

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
                    placeholder="Sử dụng cú pháp Obsidian: [[Tên ghi chú]] hoặc [[Cấp 1 / Cấp 2 / Cấp 3]] để liên kết tri thức, phân nhóm bằng thẻ #tag..."
                    spellCheck={false}
                    className="w-full h-full resize-none outline-none text-base text-slate-800 bg-transparent leading-relaxed caret-emerald-600 font-normal font-sans tracking-wide"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'graph' && (
          <div className="w-full h-full bg-[#030712] overflow-hidden relative">
            <div className="absolute top-4 right-4 z-30 bg-[#0b0f19]/90 backdrop-blur-md border border-slate-800/60 rounded-lg p-3 w-64 shadow-xl pointer-events-none select-none">
              <div className="space-y-2 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                  <span className="text-slate-200">Note đang mở</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
                  <span>Note sẵn sàng</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] opacity-40 animate-pulse" />
                  <span className="text-amber-400/90">Node rỗng</span>
                </div>
              </div>
            </div>

            <ForceGraph2DClient
              ref={graphRef}
              graphData={graphData}
              linkDirectionalParticles={3}
              linkDirectionalParticleSpeed={0.006}
              linkDirectionalParticleWidth={2.0}
              linkDirectionalParticleColor={() => '#00E5FF'}
              linkColor={() => 'rgba(255, 255, 255, 0.15)'}
              linkWidth={1.2}
              backgroundColor="#030712"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label: string = node.name;
                const nodeLevel = node.level || 1;
                const isCurrentRoot = node.id === selectedSource;

                const radius = node.val * Math.pow(0.72, nodeLevel - 1);
                const fontSize = Math.max(6.0, (isCurrentRoot ? 11.0 : 9.0) / globalScale);
                
                ctx.save();

                if (isCurrentRoot) {
                  const pulseGlow = radius + 5.0 + Math.abs(Math.sin(pulseGlobalTime.current * 1.5) * 3.5);
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, pulseGlow, 0, 2 * Math.PI);
                  ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
                  ctx.fill();

                  ctx.beginPath();
                  ctx.arc(node.x, node.y, radius + 2.0, 0, 2 * Math.PI);
                  ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
                  ctx.lineWidth = 0.6;
                  ctx.stroke();
                } else {
                  const staticGlowRadius = radius * 1.45;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, staticGlowRadius, 0, 2 * Math.PI);
                  
                  if (node.type === 'tag') {
                    ctx.fillStyle = 'rgba(255, 0, 127, 0.08)';
                  } else if (node.type === 'file') {
                    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
                  } else {
                    ctx.fillStyle = 'rgba(245, 158, 11, 0.03)';
                  }
                  ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                
                if (isCurrentRoot) {
                  ctx.fillStyle = '#00E5FF';
                  ctx.shadowColor = '#00E5FF';
                  ctx.shadowBlur = 8;
                } else if (node.type === 'tag') {
                  ctx.fillStyle = '#ff007f';
                  ctx.shadowBlur = 0;
                } else if (node.type === 'file') {
                  ctx.fillStyle = '#6366f1'; 
                  ctx.shadowBlur = 0;
                } else {
                  ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
                  ctx.shadowBlur = 0;
                }
                ctx.fill();

                const isImportantConcept = node.type === 'concept' && (node.degree || 0) > 1;
                const alpha = isCurrentRoot 
                  ? 1.0 
                  : node.type === 'tag'
                    ? 0.85
                    : node.type === 'file' || isImportantConcept
                      ? 0.75 
                      : 0.35;
                
                ctx.font = `${isCurrentRoot || node.type === 'tag' ? '600' : '400'} ${fontSize}px sans-serif`;
                ctx.fillStyle = node.type === 'tag' ? `rgba(255, 0, 127, ${alpha})` : `rgba(241, 245, 249, ${alpha})`;

                const textWidth = ctx.measureText(label).width;
                const offsetTextY = radius + fontSize + 4.5;
                ctx.fillText(label, node.x - textWidth / 2, node.y + offsetTextY);
                
                ctx.restore();
              }}
              onNodeClick={(node: any) => {
                if (node.type === 'file') {
                  setSelectedSource(node.id);
                  setViewMode('edit');
                } else if (node.type === 'concept') {
                  handleAutoCreateFromConcept(node.id);
                } else if (node.type === 'tag') {
                  showStatus(`Thẻ nhóm "${node.id}" quy tụ ${node.degree || 0} bài viết.`);
                }
              }}
            />
          </div>
        )}
      </div>

      <footer className="px-6 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold truncate max-w-65">
            notebook/{selectedSource ? `${selectedSource}.json` : 'empty'}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-medium">
          {viewMode === 'edit' && selectedSource && (
            <>
              {tagsInNote.length > 0 && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Hash size={11} className="text-[#ff007f]" /> {tagsInNote.length} thẻ
                </span>
              )}
              {wikiLinksInNote.length > 0 && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Link2 size={11} className="text-[#6366f1]" /> {wikiLinksInNote.length} liên kết
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