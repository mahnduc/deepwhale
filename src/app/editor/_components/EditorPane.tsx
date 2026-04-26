"use client";

import React from "react";
import { EditorContent, Editor } from "@tiptap/react";
import EditorToolbar from "./EditorToolbar";

type Props = {
  editor: Editor;
};

function EditorPane({ editor }: Props) {
  return (
    <>
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </>
  );
}

export default React.memo(EditorPane);