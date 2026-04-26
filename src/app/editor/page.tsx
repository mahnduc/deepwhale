"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
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

// Icons
import { Eye, PenLine, Save, Loader2, CheckCircle2, FileText } from "lucide-react";

// Components
import EditorPane from "./_components/EditorPane";
import PreviewPane from "./_components/PreviewPane";
import { opfsApi } from "../lib/opfs/opfsApis";

export default function MarkdownEditor() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(false);
  const [fileName, setFileName] = useState("tai-lieu-moi");

  useEffect(() => {
    setMounted(true);
  }, []);

  const turndown = useMemo(
    () =>
      new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
        emDelimiter: "_"
      }),
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Highlight,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#00E5FF] underline" }
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ 
        placeholder: "Bắt đầu soạn thảo...",
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:text-[#717B7A] before:float-left before:pointer-events-none"
      })
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[400px] p-4 md:p-8 focus:outline-none text-white"
      }
    }
  });

  const getMarkdown = () => {
    if (!editor) return "";
    return turndown
      .turndown(editor.getHTML())
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const handleSave = async () => {
    if (!editor || isSaving) return;
    setIsSaving(true);
    try {
      const safeName = fileName.trim().replace(/[/\\?%*:|"<>]/g, "-") || "document";
      await opfsApi.save(`/my-workspace/${safeName}.md`, getMarkdown());
      setLastSaved(true);
      setTimeout(() => setLastSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !editor) return null;

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-4 bg-[#050505] text-white">
      
      {/* HEADER */}
      <div className="flex justify-between items-center gap-3 bg-[#0A0A0A] p-3 rounded-lg border border-[#262626]">

        <div className="relative w-64">
          <FileText className="absolute left-2 top-2.5 text-[#717B7A]" size={14} />
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full pl-7 pr-8 py-1.5 text-sm bg-[#111] border border-[#262626] rounded-md text-white focus:border-[#00E5FF] focus:outline-none transition-colors"
          />
          <span className="absolute right-2 top-2 text-xs text-[#717B7A]">.md</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Edit/Preview */}
          <div className="flex bg-[#111] p-1 rounded-md border border-[#262626]">
            <button 
              onClick={() => setActiveTab("edit")}
              className={`p-1.5 rounded transition-all ${activeTab === "edit" ? "bg-[#00E5FF] text-black" : "text-[#717B7A] hover:text-white"}`}
            >
              <PenLine size={16} />
            </button>
            <button 
              onClick={() => setActiveTab("preview")}
              className={`p-1.5 rounded transition-all ${activeTab === "preview" ? "bg-[#00E5FF] text-black" : "text-[#717B7A] hover:text-white"}`}
            >
              <Eye size={16} />
            </button>
          </div>

          {/* Save Button */}
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center justify-center p-2.5 rounded-md bg-[#006064] hover:bg-[#00E5FF] text-white hover:text-black transition-all disabled:opacity-50 border border-[#00E5FF]/20"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : lastSaved ? (
              <CheckCircle2 size={16} className="text-[#00E5FF] group-hover:text-black" />
            ) : (
              <Save size={16} />
            )}
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 border border-[#262626] rounded-xl overflow-hidden bg-[#0A0A0A] shadow-2xl">
        {activeTab === "edit" ? (
          <EditorPane editor={editor} />
        ) : (
          <PreviewPane markdown={getMarkdown()} />
        )}
      </div>
    </div>
  );
}