"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Save,
  Calendar as CalendarIcon
} from "lucide-react";

interface Note {
  id: string;
  dateKey: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function SchedulePage() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setMounted(true);
    setSelectedDateKey(todayKey);
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    loadAllNotes();
    return () => clearInterval(timer);
  }, [todayKey]);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    return { year, month, daysInMonth, adjustedFirstDay };
  }, [currentDate]);

  const activeNote = useMemo(() =>
    notes.find(n => n.dateKey === selectedDateKey),
    [notes, selectedDateKey]);

  useEffect(() => {
    setEditContent(activeNote?.content || "");
  }, [activeNote, selectedDateKey]);

  const loadAllNotes = async () => {
    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle("deepwhale_notes.json", { create: true });
      const file = await fileHandle.getFile();
      const text = await file.text();
      if (text) setNotes(JSON.parse(text));
    } catch (err) { console.error("OPFS Fail", err); }
  };

  const saveNote = async () => {
    if (!selectedDateKey) return;
    setIsSaving(true);
    const newNote: Note = {
      id: activeNote?.id || crypto.randomUUID(),
      dateKey: selectedDateKey,
      title: `Note for ${selectedDateKey}`,
      content: editContent,
      updatedAt: new Date().toLocaleString()
    };

    const updatedNotes = activeNote
      ? notes.map(n => n.dateKey === selectedDateKey ? newNote : n)
      : [...notes, newNote];

    try {
      const root = await navigator.storage.getDirectory();
      const fileHandle = await root.getFileHandle("deepwhale_notes.json", { create: true });
      const fileHandleWritable = await fileHandle.createWritable();
      await fileHandleWritable.write(JSON.stringify(updatedNotes));
      await fileHandleWritable.close();
      setNotes(updatedNotes);
    } catch (err) { console.error("Save Fail", err); }
    finally { setTimeout(() => setIsSaving(false), 500); }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[var(--color-ui-bg)] overflow-hidden">
      
      {/* LEFT COLUMN: CALENDAR NAVIGATION */}
      <aside className="w-full lg:w-72 flex flex-col border-r border-[var(--color-ui-border)] bg-[var(--color-ui-bg)]">
        
        {/* TOP INFO */}
        <div className="p-6 pb-2">
          <h1 className="!mt-0 !mb-1">Lịch trình</h1>
          <div className="flex items-center gap-2 text-[var(--color-ui-text-subtle)]">
            <Clock size={14} />
            <span className="text-[11px] font-bold tabular-nums uppercase tracking-wider">{time}</span>
          </div>
        </div>

        {/* CALENDAR */}
        <div className="p-4">
          <div className="ui-card !p-3">
            <div className="flex items-center justify-between mb-4">
              <h5 className="!mb-0 capitalize">
                {currentDate.toLocaleString('default', { month: 'long' })}
                <span className="ml-1 opacity-50 font-normal">{calendarData.year}</span>
              </h5>
              <div className="flex gap-0.5">
                <button 
                  onClick={() => setCurrentDate(new Date(calendarData.year, calendarData.month - 1))} 
                  className="p-1 rounded hover:bg-[var(--color-ui-border)] text-[var(--color-icon-muted)]"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date(calendarData.year, calendarData.month + 1))} 
                  className="p-1 rounded hover:bg-[var(--color-ui-border)] text-[var(--color-icon-muted)]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="py-1 text-[9px] font-bold text-center text-[var(--color-ui-text-subtle)] opacity-50 uppercase">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: calendarData.adjustedFirstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {Array.from({ length: calendarData.daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dKey = `${calendarData.year}-${String(calendarData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = dKey === selectedDateKey;
                const isToday = dKey === todayKey;
                const hasNote = notes.some(n => n.dateKey === dKey);

                return (
                  <button
                    key={dKey}
                    onClick={() => setSelectedDateKey(dKey)}
                    className={`
                      aspect-square flex items-center justify-center transition-all relative text-[13px] rounded-md
                      ${isSelected 
                        ? "bg-[var(--color-brand-primary)] text-white font-bold" 
                        : "hover:bg-[var(--color-ui-border)] text-[var(--color-ui-text-main)]"}
                    `}
                  >
                    {isToday && !isSelected && (
                      <div className="absolute top-1 w-1 h-1 rounded-full bg-[var(--color-brand-primary)]" />
                    )}
                    <span>{day}</span>
                    {hasNote && !isSelected && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--color-ui-text-subtle)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: CANVAS EDITOR */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* EDITOR CONTROLS */}
        <div className="flex items-center justify-between px-6 h-14 border-b border-[var(--color-ui-border)] bg-[var(--color-ui-card)]">
          <div className="flex items-center gap-3">
            <CalendarIcon size={18} className="text-[var(--color-icon-muted)]" />
            <h3 className="!mt-0 !mb-0 text-[var(--color-ui-text-main)]">
              {selectedDateKey}
            </h3>
          </div>

          <button
            onClick={saveNote}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-4 h-9 rounded-md font-semibold text-[13px] transition-all
              bg-[var(--color-brand-primary)] text-white hover:opacity-90 active:scale-95 disabled:opacity-50
            `}
          >
            {isSaving ? <Clock size={14} className="animate-spin" /> : <Save size={14} />}
            {isSaving ? "Đang lưu" : "Lưu bản ghi"}
          </button>
        </div>

        {/* EDITOR AREA */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <h6>Ghi chú của bạn</h6>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Bắt đầu ghi lại ý tưởng..."
              className="flex-1 w-full bg-transparent outline-none resize-none text-base leading-relaxed text-[var(--color-ui-text-main)] placeholder:text-[var(--color-ui-text-subtle)] font-normal py-4"
            />
          </div>
        </div>
      </main>
    </div>
  );
}