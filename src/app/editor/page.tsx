"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TurndownService from "turndown";

// Extensions
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";

// Icons & Components
import { Eye, PenLine, Save, Loader2, CheckCircle2, FileText } from "lucide-react";
import EditorToolbar from "./_components/EditorToolbar";

// Import Command
import { FileCommands } from "@/commands/file.command";

export default function MarkdownEditor() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  // State quản lý tên file
  const [fileName, setFileName] = useState("tai-lieu-moi");

  useEffect(() => {
    setMounted(true);
  }, []);

  const turndown = useMemo(() => {
    return new TurndownService({ 
      headingStyle: "atx", 
      codeBlockStyle: "fenced", 
      emDelimiter: "_" 
    });
  }, []);

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Highlight,
    Image,
    Link.configure({ 
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-[var(--color-brand-primary)] underline cursor-pointer',
      },
    }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder: "Bắt đầu nhập nội dung tài liệu..." }),
  ], []);

  const editor = useEditor({
    extensions,
    content: `<h1>Tài liệu mới</h1><p>Bắt đầu viết nội dung tại đây...</p>`,
    immediatelyRender: false,
    editorProps: {
      attributes: { 
        class: "prose max-w-none focus:outline-none min-h-[500px] text-sm p-8 transition-all duration-300" 
      },
    },
  });

  if (!mounted || !editor) return null;

  const getMarkdown = () => {
    const html = editor.getHTML();
    return turndown.turndown(html).replace(/\n{3,}/g, "\n\n").trim();
  };

  // Hàm xử lý lưu
  const onSaveAction = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    const content = getMarkdown();
    
    // Làm sạch tên file (loại bỏ ký tự đặc biệt)
    const safeFileName = fileName.trim().replace(/[/\\?%*:|"<>]/g, '-') || "document";
    const finalPath = `my-workspace/${safeFileName}.md`;

    const response = await FileCommands.save({
      path: finalPath,
      content: content
    });

    if (response.success && response.timestamp) {
      setLastSaved(response.timestamp);
      setTimeout(() => setLastSaved(null), 3000);
    } else if (!response.success) {
      alert(`Lỗi: ${response.error}`);
    }
    
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto p-4 space-y-4 text-[var(--color-ui-text-main)]">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-[var(--color-ui-bg)]/50 p-2 rounded-2xl border border-[var(--color-ui-border)]">
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Nhập tên file */}
          <div className="relative flex items-center w-full md:w-64 group">
            <div className="absolute left-3 text-[var(--color-ui-text-muted)] group-focus-within:text-[var(--color-brand-primary)] transition-colors">
              <FileText size={16} />
            </div>
            <input 
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Tên tập tin..."
              className="w-full bg-white border border-[var(--color-ui-border)] rounded-xl py-2 pl-10 pr-12 text-xs font-medium focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 focus:border-[var(--color-brand-primary)] outline-none transition-all"
            />
            <span className="absolute right-3 text-[10px] font-bold text-[var(--color-ui-text-muted)]">.md</span>
          </div>

          <div className="h-6 w-[1px] bg-[var(--color-ui-border)] hidden md:block" />

          {/* Switch Tabs */}
          <div className="flex p-1 bg-black/[0.03] rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("edit")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeTab === 'edit' 
                ? 'bg-white text-[var(--color-brand-primary)] shadow-sm border border-black/5' 
                : 'text-[var(--color-ui-text-muted)] hover:text-[var(--color-ui-text-main)]'
              }`}
            >
              <PenLine size={12} /> SOẠN THẢO
            </button>
            <button 
              onClick={() => setActiveTab("preview")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                activeTab === 'preview' 
                ? 'bg-white text-[var(--color-brand-primary)] shadow-sm border border-black/5' 
                : 'text-[var(--color-ui-text-muted)] hover:text-[var(--color-ui-text-main)]'
              }`}
            >
              <Eye size={12} /> XEM TRƯỚC
            </button>
          </div>
        </div>
        
        {/* Nút lưu */}
        <button 
          onClick={onSaveAction}
          disabled={isSaving}
          className={`w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-lg active:scale-95 disabled:opacity-70
            ${lastSaved 
              ? "bg-green-500 border-green-500 text-white" 
              : "bg-[var(--color-brand-primary)] border-[var(--color-brand-primary)] text-white hover:brightness-110 shadow-[var(--color-brand-primary)]/20"
            }`}
        >
          {isSaving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : lastSaved ? (
            <CheckCircle2 size={14} />
          ) : (
            <Save size={14}/>
          )}
          
          {isSaving ? "ĐANG LƯU..." : lastSaved ? "ĐÃ LƯU XONG" : "LƯU VÀO OPFS"}
        </button>
      </div>

      {/* 2. MAIN CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-[var(--color-ui-border)] bg-white ring-1 ring-black/[0.02]">
        {activeTab === "edit" ? (
          <>
            <EditorToolbar editor={editor} />
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              <EditorContent editor={editor} />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-[var(--color-ui-bg)]/30 animate-in fade-in duration-300">
            <div className="h-full min-h-[500px] font-mono p-6 border border-[var(--color-ui-border)] rounded-xl bg-white/80 shadow-inner">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap text-[var(--color-ui-text-main)]">
                {getMarkdown() || "// Chưa có nội dung"}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}