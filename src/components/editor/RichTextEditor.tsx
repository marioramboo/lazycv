"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Undo, Redo } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Click to edit…", className }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: "outline-none min-h-[60px] prose prose-sm max-w-none text-foreground",
      },
    },
  });

  // Sync external content updates (e.g. reset-to-AI)
  useEffect(() => {
    if (editor && !editor.isFocused && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <div className={cn("group relative", className)}>
      {isFocused && (
        <div className="flex items-center gap-1 mb-1.5 p-1 rounded border bg-popover shadow-sm">
          <Button
            type="button" variant="ghost" size="icon"
            className="h-6 w-6"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-6 w-6"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            type="button" variant="ghost" size="icon"
            className="h-6 w-6"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            aria-label="Undo"
          >
            <Undo className="h-3 w-3" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon"
            className="h-6 w-6"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            aria-label="Redo"
          >
            <Redo className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div
        className={cn(
          "rounded border cursor-text transition-colors px-2 py-1.5",
          isFocused ? "border-primary ring-1 ring-primary/30" : "border-transparent group-hover:border-border",
        )}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
