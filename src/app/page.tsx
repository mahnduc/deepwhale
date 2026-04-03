"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, Save, Edit3, ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react";

const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

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
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(updatedNotes));
      await writable.close();
      setNotes(updatedNotes);
    } catch (err) { console.error("Save Fail", err); }
    finally { setTimeout(() => setIsSaving(false), 500); }
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-full bg-base-200 flex flex-col p-6 lg:p-10 select-none overflow-y-auto">
      <div className="max-w-350 mx-auto w-full flex flex-col gap-8 h-full">

        <div className={`p-6 rounded-4xl bg-base-200 ${neoFlat} flex flex-col gap-4 shrink-0`}>

          <div className="flex items-center justify-between gap-4">
            <div className={`px-4 py-2 rounded-xl bg-base-200 ${neoInset} flex items-center gap-3 shrink-0 opacity-60`}>
              <Clock size={16} className="text-base-content/40" />
              <span className="text-lg font-mono font-black tracking-tighter italic">{time}</span>
            </div>

            <div className={`
              hidden md:flex items-center gap-2
              px-4 py-2 rounded-xl bg-base-200 ${neoInset} 
              border-l-2 border-primary/30 shrink-0 opacity-60
            `}>
              <span className="text-xs font-black text-primary font-mono">{selectedDateKey}</span>
            </div>
          </div>

          <div className="w-full relative">
            <div className="flex items-center gap-2 mb-3 ml-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
              <div className="w-12 h-0.5 bg-linear-to-r from-primary/50 to-transparent" />
              <label className="text-[11px] font-black uppercase text-primary tracking-[0.25em] animate-pulse">
                Thông báo             </label>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl" />

              <div className={`
                relative p-6 rounded-3xl
                bg-linear-to-br from-base-200 via-base-200 to-base-300/30
                ${neoFlat}
                border-2 border-primary/20
                transition-all duration-500
                hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10
                group
              `}>
                {activeNote ? (
                  <div className="flex items-start gap-4">
                    <div className="mt-1 shrink-0">
                      <div className={`w-8 h-8 rounded-lg bg-primary/10 ${neoInset} flex items-center justify-center`}>
                        <span className="text-primary text-lg">»</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-base-content leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                        {activeNote.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-xs font-black uppercase tracking-wider opacity-20 italic">
                      Không có thông báo
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 min-h-0">

          <div className={`lg:col-span-5 p-8 rounded-4xl bg-base-200 ${neoFlat} flex flex-col h-full`}>
            <div className="flex justify-between items-center mb-8 px-2 shrink-0">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/30">Calender</h4>
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  {currentDate.toLocaleString('default', { month: 'long' })} <span className="text-primary">{calendarData.year}</span>
                </h2>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentDate(new Date(calendarData.year, calendarData.month - 1))}
                  className={`w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center transition-all ${neoFlat} ${neoPressed}`}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(calendarData.year, calendarData.month + 1))}
                  className={`w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center transition-all ${neoFlat} ${neoPressed}`}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 flex-1 content-start">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} className="text-center text-[9px] font-black uppercase opacity-20 mb-2 tracking-[0.2em]">{d}</div>
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
                    key={day}
                    onClick={() => setSelectedDateKey(dKey)}
                    className={`
                      aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative
                      ${isSelected
                        ? `bg-base-200 ${neoInset} text-primary scale-95 font-black`
                        : `${neoFlat} hover:scale-105 text-base-content/70`
                      }
                      ${isToday && !isSelected ? "ring-1 ring-primary/30" : ""}
                    `}
                  >
                    <span className="text-xs">{day}</span>
                    {hasNote && !isSelected && (
                      <div className="absolute bottom-2 w-1 h-1 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(var(--p),0.5)]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className={`mt-8 p-4 rounded-2xl bg-base-200 ${neoInset} flex justify-around shrink-0`}>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Active</span></div>
              <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-base-content/20" /> <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Empty</span></div>
            </div>
          </div>

          <div className={`lg:col-span-7 p-8 rounded-4xl bg-base-200 ${neoFlat} flex flex-col h-full`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 px-2 shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-base-200 ${neoInset} flex items-center justify-center text-primary`}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase opacity-30 tracking-[0.3em] block">Data Entry</label>
                  <h3 className="text-lg font-black tracking-tight uppercase">{selectedDateKey}</h3>
                </div>
              </div>

              <button
                onClick={saveNote}
                className={`w-full md:w-auto px-8 py-3 rounded-2xl bg-base-200 ${neoFlat} ${neoPressed} flex gap-3 items-center justify-center transition-all group`}
              >
                <Save size={18} className={`${isSaving ? "animate-spin text-primary" : "text-base-content/40 group-hover:text-primary transition-colors"}`} />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lưu</span>
              </button>
            </div>

            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Tạo ghi chú..."
              className={`flex-1 w-full p-8 rounded-4xl bg-base-200 ${neoInset} outline-none resize-none text-sm font-medium leading-relaxed text-base-content/80 placeholder:opacity-10 focus:ring-1 focus:ring-primary/5 transition-all scrollbar-hide`}
            />

            <div className="mt-6 flex justify-between items-center px-4 shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle size={12} className="opacity-20" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20">OPFS-Node</span>
              </div>
              {activeNote && (
                <span className="text-[9px] font-mono opacity-20 uppercase">Updated: {activeNote.updatedAt}</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}