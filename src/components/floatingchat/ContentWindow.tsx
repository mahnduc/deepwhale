"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, History } from 'lucide-react';
import { Resizable } from 're-resizable';
import Draggable from 'react-draggable';
import HistoryPracticeWindow from './HistoryPractice';
import NoteWindow from './NoteWindow';

interface ChatWindowProps {
  onClose: () => void;
}

type ActiveView = 'history' | 'note';

export default function ContentWindow({ onClose }: ChatWindowProps) {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('note');
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds={false}>
      <div ref={nodeRef} className="fixed z-50" style={{ top: '10%', left: '20%' }}>
        <Resizable
          defaultSize={{ width: 960, height: 600 }}
          minWidth={450}
          minHeight={350}
          maxWidth="200vw"
          maxHeight="200vh"
          enable={{
            top: false, right: true, bottom: true, left: false,
            topRight: false, bottomRight: true, bottomLeft: false, topLeft: false
          }}
          handleClasses={{
            right: 'cursor-e-resize',
            bottom: 'cursor-s-resize',
            bottomRight: 'cursor-se-resize'
          }}
        >
          <div className="w-full h-full bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="drag-handle flex items-center justify-between bg-white px-3 py-2 cursor-grab active:cursor-grabbing select-none shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveView('note');
                  }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
                    activeView === 'note'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Ghi chú nhanh"
                >
                  <Pencil size={16} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveView('history');
                  }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 active:scale-95 ${
                    activeView === 'history'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Lịch sử luyện tập"
                >
                  <History size={16} strokeWidth={2.5} />
                </button>

                <div className="flex flex-col min-w-0 ml-2">
                  <span className="text-sm font-bold tracking-wide text-slate-800">
                    {activeView === 'note' && "Sổ tay ghi chú"}
                    {activeView === 'history' && "Lịch sử luyện tập"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="group flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all duration-200 hover:bg-slate-50 hover:text-slate-600 active:scale-95"
                aria-label="Close"
              >
                <X size={16} className="transition-transform group-hover:rotate-90" />
              </button>
            </div>

            <div className="flex-1 bg-white overflow-auto custom-scrollbar">
              {activeView === 'note' && <NoteWindow />}
              {activeView === 'history' && <HistoryPracticeWindow />}
            </div>
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
}