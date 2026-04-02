"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Bell } from "lucide-react";

const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

export default function SchedulePage() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="w-full h-full min-h-screen lg:min-h-0 bg-base-200 p-4 md:p-6 lg:p-8 text-base-content/80 font-sans overflow-y-auto lg:overflow-hidden">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-6 lg:gap-8">
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-full">
          <div className="space-y-6 lg:space-y-8 flex flex-col">
            {/* Clock Card */}
            <div className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] bg-base-200 ${neoFlat} text-center flex flex-col justify-center`}>
              <div className={`inline-flex p-3 rounded-xl bg-base-200 ${neoInset} text-primary mb-4 mx-auto`}>
                <Clock size={20} />
              </div>
              <h2 className="text-4xl xl:text-5xl font-black tracking-tighter text-base-content mb-1 font-mono">
                {time || "00:00:00"}
              </h2>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">
                GMT+7
              </p>
            </div>

            <div className={`p-6 lg:p-8 rounded-[2rem] bg-base-200 ${neoFlat} flex-1 overflow-hidden flex flex-col`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Bell size={14} className="text-primary" /> Transmissions
              </h3>
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide">
                {[
                  { time: "09:00", title: "Daily Sync AI", active: true },
                  { time: "14:30", title: "Review MCP Server", active: false },
                  { time: "19:00", title: "Data Backup", active: false },
                ].map((event, i) => (
                  <div key={i} className={`p-4 rounded-2xl bg-base-200 ${event.active ? neoFlat : neoInset} flex items-center justify-between transition-all hover:scale-[1.02]`}>
                    <div>
                      <p className="text-[8px] font-black opacity-40 uppercase">{event.time}</p>
                      <p className="text-[10px] font-bold uppercase tracking-tight">{event.title}</p>
                    </div>
                    {event.active && <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI: LỊCH THÁNG --- */}
          <div className="lg:col-span-2 h-full">
            <div className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[3.5rem] bg-base-200 ${neoFlat} h-full flex flex-col`}>
              
              {/* Header Lịch */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className={`p-2 lg:p-3 rounded-xl bg-base-200 ${neoInset} text-primary`}>
                    <CalendarIcon size={18} />
                  </div>
                  <h3 className="text-sm lg:text-base font-black uppercase tracking-widest">
                    April <span className="opacity-30 italic">2026</span>
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button className={`p-2 lg:p-3 rounded-xl bg-base-200 ${neoFlat} ${neoPressed} transition-all`}>
                    <ChevronLeft size={14} />
                  </button>
                  <button className={`p-2 lg:p-3 rounded-xl bg-base-200 ${neoFlat} ${neoPressed} transition-all`}>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Grid Lịch - Tự động co giãn theo chiều cao container */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-7 gap-2 lg:gap-4">
                  {days.map((day) => (
                    <div key={day} className="text-center text-[9px] font-black uppercase opacity-30">
                      {day}
                    </div>
                  ))}
                  
                  <div className="aspect-square" />
                  <div className="aspect-square" />

                  {dates.map((date) => {
                    const isToday = date === 2; 
                    return (
                      <button
                        key={date}
                        className={`aspect-square md:h-12 lg:h-auto rounded-xl lg:rounded-2xl flex flex-col items-center justify-center transition-all group relative
                          ${isToday 
                            ? `bg-primary text-primary-content ${neoFlat} z-10 scale-110` 
                            : `bg-base-200 ${neoFlat} hover:bg-base-300 hover:scale-105 active:shadow-inner`
                          }`}
                      >
                        <span className="text-xs lg:text-sm font-black">{date}</span>
                        {/* Event indicator */}
                        {[10, 15, 22].includes(date) && !isToday && (
                          <div className="absolute bottom-1.5 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}