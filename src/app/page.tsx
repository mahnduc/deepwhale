"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Save,
  FileText,
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
    <div className="flex-1 flex flex-col lg:flex-row bg-ui-bg overflow-hidden font-sans antialiased text-ui-text-main">
      
      {/* LEFT COLUMN: NAVIGATION & CALENDAR */}
      <aside className="w-full lg:w-80 flex flex-col bg-ui-bg select-none border-r border-ui-border">
        
        {/* HEADER SECTION */}
        <div className="py-10 px-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lịch trình</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-ui-text-muted">
            <Clock size={14} className="text-ui-text-muted" />
            <span className="tabular-nums">{time}</span>
          </div>
        </div>

        {/* CALENDAR CARD */}
        <div className="px-6 pb-8">
          <div className="bg-ui-card border border-ui-border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-6 px-1">
              <span className="text-sm font-semibold capitalize">
                {currentDate.toLocaleString('default', { month: 'long' })}
                <span className="ml-2 text-ui-text-muted font-normal">{calendarData.year}</span>
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentDate(new Date(calendarData.year, calendarData.month - 1))} 
                  className="p-1.5 rounded-lg hover:bg-ui-border/20 text-ui-text-muted transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date(calendarData.year, calendarData.month + 1))} 
                  className="p-1.5 rounded-lg hover:bg-ui-border/20 text-ui-text-muted transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="py-2 text-[10px] font-bold text-center text-ui-text-muted/50 uppercase tracking-tighter">
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
                      aspect-square flex flex-col items-center justify-center transition-all relative text-sm rounded-xl
                      ${isSelected 
                        ? "bg-brand-primary text-white font-bold shadow-md shadow-brand-primary/20" 
                        : "hover:bg-ui-border/10 text-ui-text-muted font-medium"}
                    `}
                  >
                    {isToday && !isSelected && (
                      <div className="absolute top-1.5 w-1 h-1 rounded-full bg-brand-primary" />
                    )}
                    <span>{day}</span>
                    {hasNote && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-ui-text-muted/30" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT COLUMN: CONTENT EDITOR */}
      <main className="flex-1 flex flex-col bg-ui-bg">
        {/* EDITOR HEADER */}
        <div className="h-24 px-8 flex items-center justify-between border-b border-ui-border bg-ui-bg/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-ui-card border border-ui-border flex items-center justify-center rounded-2xl text-ui-text-muted">
              <CalendarIcon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-ui-text-muted uppercase tracking-widest">Ghi chú ngày</p>
              <h2 className="text-xl font-bold tracking-tight">{selectedDateKey}</h2>
            </div>
          </div>

          <button
            onClick={saveNote}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Clock size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>{isSaving ? "Đang lưu..." : "Lưu bản ghi"}</span>
          </button>
        </div>

        {/* TEXT AREA CARD */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto h-full flex flex-col bg-ui-card border border-ui-border rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-ui-text-muted/40">
              <FileText size={14} />
              <span className="text-xs font-medium uppercase tracking-widest">DeepWhale Content Canvas</span>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Bắt đầu ghi lại ý tưởng cho ngày hôm nay..."
              className="flex-1 w-full bg-transparent outline-none resize-none text-lg leading-relaxed text-ui-text-main placeholder:text-ui-text-muted/20 font-normal"
            />
          </div>
        </div>
      </main>
    </div>
  );
}