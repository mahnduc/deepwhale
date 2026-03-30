"use client";

import React, { useState } from "react";
import { Layers, Trash2, Edit3, Check, X, Calendar, Info } from "lucide-react";

interface CourseCardProps {
  id: string;
  name: string;
  description: string; // Thêm prop description
  uploadDate: string;
  onLaunch: () => void;
  onDelete: () => void;
  // Cập nhật hàm Rename để nhận cả name và description
  onUpdateMetadata: (newName: string, newDesc: string) => Promise<void>;
}

export default function CourseCard({ 
  id, 
  name, 
  description, 
  uploadDate, 
  onLaunch, 
  onDelete, 
  onUpdateMetadata 
}: CourseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempDesc, setTempDesc] = useState(description);

  const neoFlat = "shadow-[5px_5px_10px_rgba(0,0,0,0.1),-5px_-5px_10px_rgba(255,255,255,0.5)]";
  const neoInset = "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]";
  const neoPressed = "active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5)]";

  const handleSave = async () => {
    await onUpdateMetadata(tempName, tempDesc);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setTempDesc(description);
    setIsEditing(false);
  };

  return (
    <div className={`group relative rounded-[2.5rem] bg-base-200 p-8 transition-all duration-300 hover:scale-[1.02] ${neoFlat}`}>
      <div className="flex flex-col h-full">
        {/* HEADER AREA */}
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-primary transition-transform group-hover:scale-110 ${neoInset}`}>
            <Layers size={24} />
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="p-2 rounded-xl text-success hover:scale-110 transition-all"><Check size={18}/></button>
                <button onClick={handleCancel} className="p-2 rounded-xl text-error hover:scale-110 transition-all"><X size={18}/></button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className={`p-2 rounded-xl text-primary/30 hover:text-primary transition-all ${neoFlat} ${neoPressed}`}
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="grow">
          {isEditing ? (
            <div className="flex flex-col gap-3 mb-4">
              <input 
                autoFocus
                className={`bg-transparent text-lg font-black uppercase italic text-primary outline-none w-full px-3 py-1 rounded-xl ${neoInset}`}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Tên khóa học..."
              />
              <textarea 
                className={`bg-transparent text-xs font-medium text-base-content/70 outline-none w-full px-3 py-2 rounded-xl resize-none h-20 ${neoInset}`}
                value={tempDesc}
                onChange={(e) => setTempDesc(e.target.value)}
                placeholder="Mô tả ngắn gọn..."
              />
            </div>
          ) : (
            <div className="mb-4">
              <h2 className="text-xl font-black tracking-tight mb-1 uppercase italic text-base-content truncate">
                {name}
              </h2>
              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Info size={10} /> {description}
              </p>
              <div className="flex items-center gap-2 opacity-40">
                <Calendar size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{uploadDate}</span>
              </div>
            </div>
          )}

          <div className={`p-4 rounded-2xl bg-base-200/50 text-[9px] font-medium opacity-60 leading-relaxed ${neoInset}`}>
            ID: <span className="font-mono">{id}</span>
            <br />
            Trạng thái: <span className="text-primary font-bold italic">Sẵn sàng ngoại tuyến</span>
          </div>
        </div>

        {/* ACTION AREA */}
        <div className="mt-8 flex justify-between items-center">
          <button 
            onClick={onLaunch} 
            disabled={isEditing}
            className={`px-6 py-2 rounded-xl bg-base-200 text-primary text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'opacity-20' : neoFlat + " " + neoPressed}`}
          >
            Bắt đầu học
          </button>
          
          <button 
            onClick={onDelete}
            className={`p-2 rounded-full bg-base-200 text-error/40 hover:text-error transition-all ${neoFlat} ${neoPressed}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}