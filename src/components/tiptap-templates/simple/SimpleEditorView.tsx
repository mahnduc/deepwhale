"use client"

import { useEffect } from "react"
import {
  EditorContent,
  EditorContext,
  useEditor,
} from "@tiptap/react"

// --- Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Markdown } from "@tiptap/markdown"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"

// --- Nodes ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

type SimpleA4EditorProps = {
  content?: string
}

export default function SimpleA4Editor({
  content = "",
}: SimpleA4EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,

    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "simple-editor",
      },
    },

    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),

      Markdown,
      HorizontalRule,

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      TaskList,

      TaskItem.configure({
        nested: true,
      }),

      Highlight.configure({
        multicolor: true,
      }),

      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
    ],

    content,
  })

  useEffect(() => {
    if (!editor) return

    const current = editor.getMarkdown()

    if (current !== content) {
      editor.commands.setContent(content || "", {
        contentType: "markdown",
      })
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <EditorContext.Provider value={{ editor }}>
      <main className="flex-1 overflow-auto bg-neutral-45 py-10">
        <div className="mx-auto simple-editor-content">
          <EditorContent
            editor={editor}
            className="editor-page"
          />
        </div>
      </main>
    </EditorContext.Provider>
  )
}
