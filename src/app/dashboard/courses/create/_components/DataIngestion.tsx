"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  UploadCloud, 
  FileCode, 
  Loader2, 
  Terminal,
  Pen,
  ChevronRight,
  Database,
  Plus,
  Maximize2
} from "lucide-react";
import { opfsApi } from "@/app/lib/opfs/opfsApis";

export default function KnowledgeBaseAllInOne() {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const WORKSPACE_PATH = "/my-workspace";

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const exists = await opfsApi.exists(WORKSPACE_PATH);
      if (!exists) await opfsApi.createFolder(WORKSPACE_PATH);
      const contents = await opfsApi.listContents(WORKSPACE_PATH);
      setFiles(contents.filter((f) => f.kind === "file"));
    } catch (error) {
      console.error("OPFS_ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith(".md")) return;
    setIsUploading(true);
    try {
      await opfsApi.save(`${WORKSPACE_PATH}/${file.name}`, file);
      await loadFiles();
      setSelectedFile(file.name);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full h-full bg-black text-[#F5F5F5] font-mono overflow-hidden border-t border-l border-[#262626]">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".md" className="hidden" />

      {/* BENTO GRID - SQUARE VERSION */}
      <div className="grid grid-cols-12 h-full w-full">
        
        {/* LEFT COLUMN (4/12) */}
        <div className="col-span-4 flex flex-col border-r border-[#262626]">
          
          {/* TOP ACTIONS: SQUARE TILES */}
          <div className="grid grid-cols-2 border-b border-[#262626]">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center border-r border-[#262626] hover:bg-[#00E5FF] hover:text-black transition-all group"
            >
              {isUploading ? <Loader2 className="animate-spin" size={24} /> : <UploadCloud size={24} />}
              <span className="text-[10px] mt-2 font-bold uppercase tracking-tighter">Upload</span>
            </button>
            <button className="aspect-square flex flex-col items-center justify-center hover:bg-[#00E5FF] hover:text-black transition-all group">
              <Pen size={24} />
              <span className="text-[10px] mt-2 font-bold uppercase tracking-tighter">Editor</span>
            </button>
          </div>

          {/* FILE LIST AREA */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-[#111] px-4 py-2 border-b border-[#262626] flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#717B7A] uppercase tracking-widest">File</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {files.map((file, idx) => {
                const isSelected = selectedFile === file.name;
                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedFile(file.name)}
                    className={`flex items-center justify-between p-4 border-b border-[#111] cursor-pointer transition-colors ${
                      isSelected ? "bg-[#00E5FF] text-black" : "hover:bg-[#0A0A0A]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileCode size={14} />
                      <span className="text-xs font-bold truncate max-w-[180px]">{file.name}</span>
                    </div>
                    <ChevronRight size={12} className={isSelected ? "text-black" : "text-[#262626]"} />
                  </div>
                );
              })}
            </div>

            {/* STATUS BAR */}
            <div className="p-4 border-t border-[#262626] bg-[#0A0A0A]">
              <button className="w-full py-3 bg-white text-black text-[11px] font-bold uppercase hover:bg-[#00E5FF] transition-all">
                Train Knowledge Base
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (8/12) */}
        <div className="col-span-8 flex flex-col">
          {/* PREVIEW CONTENT */}
          <div className="flex-1 p-12 overflow-y-auto relative">
          </div>

        </div>

      </div>
    </div>
  );
}