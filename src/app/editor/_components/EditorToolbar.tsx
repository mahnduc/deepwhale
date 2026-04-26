"use client";

import React, { useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Type, List, Quote, ListOrdered, Undo, Redo,
  Terminal, Underline as UnderlineIcon, Highlighter, LucideIcon
} from "lucide-react";

interface Props {
  editor: Editor | null;
}

interface ToolbarAction {
  type: "action";
  icon: LucideIcon;
  title: string;
  extension: string;
  attributes?: Record<string, any>;
  command: (editor: Editor) => void;
}

interface ToolbarSeparator {
  type: "separator";
}

type ToolbarItem = ToolbarAction | ToolbarSeparator;

const toolbarConfig: ToolbarItem[] = [
  { type: "action", icon: Undo, title: "Hoàn tác", extension: "undo", command: (e) => e.chain().focus().undo().run() },
  { type: "action", icon: Redo, title: "Làm lại", extension: "redo", command: (e) => e.chain().focus().redo().run() },
  { type: "separator" },
  { type: "action", icon: Type, title: "Văn bản", extension: "paragraph", command: (e) => e.chain().focus().setParagraph().run() },
  { type: "action", icon: Heading1, title: "Tiêu đề 1", extension: "heading", attributes: { level: 1 }, command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { type: "action", icon: Heading2, title: "Tiêu đề 2", extension: "heading", attributes: { level: 2 }, command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { type: "action", icon: Heading3, title: "Tiêu đề 3", extension: "heading", attributes: { level: 3 }, command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { type: "separator" },
  { type: "action", icon: Bold, title: "In đậm", extension: "bold", command: (e) => e.chain().focus().toggleBold().run() },
  { type: "action", icon: Italic, title: "In nghiêng", extension: "italic", command: (e) => e.chain().focus().toggleItalic().run() },
  { type: "action", icon: UnderlineIcon, title: "Gạch chân", extension: "underline", command: (e) => e.chain().focus().toggleUnderline().run() },
  { type: "action", icon: Highlighter, title: "Làm nổi bật", extension: "highlight", command: (e) => e.chain().focus().toggleHighlight().run() },
  { type: "separator" },
  { type: "action", icon: List, title: "Danh sách", extension: "bulletList", command: (e) => e.chain().focus().toggleBulletList().run() },
  { type: "action", icon: ListOrdered, title: "Danh sách số", extension: "orderedList", command: (e) => e.chain().focus().toggleOrderedList().run() },
  { type: "separator" },
  { type: "action", icon: Quote, title: "Trích dẫn", extension: "blockquote", command: (e) => e.chain().focus().toggleBlockquote().run() },
  { type: "action", icon: Terminal, title: "Khối mã", extension: "codeBlock", command: (e) => e.chain().focus().toggleCodeBlock().run() },
];

export default function EditorToolbar({ editor }: Props) {
  const [, setUpdate] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const handler = () => setUpdate((p) => p + 1);
    editor.on("transaction", handler);
    return () => { editor.off("transaction", handler); };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#262626] bg-[#0A0A0A] sticky top-0 z-10">
      {toolbarConfig.map((item, index) => {
        if (item.type === "separator") {
          return <div key={`sep-${index}`} className="w-[1px] h-4 bg-[#262626] mx-1" />;
        }

        const isDisabled = 
          (item.extension === "undo" && !editor.can().undo()) || 
          (item.extension === "redo" && !editor.can().redo());

        const isActive = 
          item.extension !== "undo" && 
          item.extension !== "redo" && 
          (item.attributes ? editor.isActive(item.extension, item.attributes) : editor.isActive(item.extension));

        return (
          <button
            key={`action-${item.title}`}
            type="button"
            onClick={() => item.command(editor)}
            disabled={isDisabled}
            className={`
              p-2 rounded-md transition-all duration-200 relative group
              ${isActive 
                ? "bg-[#00E5FF] text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]" 
                : "text-[#717B7A] hover:bg-[#262626] hover:text-white"
              }
              ${isDisabled ? "opacity-20 cursor-not-allowed" : "active:scale-95"}
            `}
          >
            <item.icon 
              size={15} 
              strokeWidth={isActive ? 3 : 2} 
            />
            
            {/* Tooltip */}
            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#262626] text-white text-[10px] rounded border border-[#00E5FF]/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap shadow-xl">
              {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}