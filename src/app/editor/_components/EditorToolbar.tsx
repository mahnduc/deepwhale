"use client";

import React, { useCallback } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  Type, List, Quote, ListOrdered, Undo, Redo,
  Terminal, Underline as UnderlineIcon, Highlighter, LucideIcon
} from "lucide-react";

interface Props {
  editor: Editor;
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
  // Hàm kiểm tra trạng thái active được tối ưu hóa
  const checkActive = useCallback((extension: string, attributes?: Record<string, any>) => {
    return attributes ? editor.isActive(extension, attributes) : editor.isActive(extension);
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[var(--color-ui-border)] bg-[var(--color-ui-card)] sticky top-0 z-10">
      {toolbarConfig.map((item, index) => {
        if (item.type === "separator") {
          return <div key={index} className="w-[1px] h-4 bg-[var(--color-ui-border)] mx-1" />;
        }

        const isActive = checkActive(item.extension, item.attributes);

        return (
          <button
            key={index}
            type="button"
            onClick={() => item.command(editor)}
            title={item.title}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              isActive
                ? "bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] ring-1 ring-[var(--color-brand-primary)]/30 shadow-sm font-bold"
                : "text-[var(--color-ui-text-muted)] hover:bg-[var(--color-ui-bg)] hover:text-[var(--color-ui-text-main)]"
            }`}
          >
            <item.icon 
              size={16} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={`transition-transform ${isActive ? "scale-110" : "scale-100"}`}
            />
          </button>
        );
      })}
    </div>
  );
}