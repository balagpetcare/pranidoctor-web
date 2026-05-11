"use client";

import type { Editor } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";

import { cn } from "@/lib/cn";

export type RichTextContentProps = Readonly<{
  editor: Editor | null;
  id?: string;
  labelledBy?: string;
  className?: string;
}>;

export function RichTextContent(props: RichTextContentProps) {
  const { editor, id, labelledBy, className } = props;
  return (
    <div
      id={id}
      className={cn("pd-rich-editor-content", className)}
      aria-labelledby={labelledBy}
      role="group"
    >
      <EditorContent editor={editor} />
    </div>
  );
}
