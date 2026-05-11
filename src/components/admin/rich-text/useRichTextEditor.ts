"use client";

import { useEditor } from "@tiptap/react";
import { useEffect, useMemo, useRef } from "react";

import { createRichTextExtensions } from "./rich-text-extensions";
import { cn } from "@/lib/cn";

export type UseRichTextEditorOptions = Readonly<{
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeightClass?: string;
}>;

export function useRichTextEditor(options: UseRichTextEditorOptions) {
  const placeholder = options.placeholder ?? "";
  const onChangeRef = useRef(options.onChange);
  onChangeRef.current = options.onChange;

  const extensions = useMemo(() => createRichTextExtensions(placeholder), [placeholder]);

  const editor = useEditor(
    {
      extensions,
      content: options.value || "",
      editable: !options.disabled,
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          class: cn(
            "tiptap pd-rich-editor-prose max-w-none text-[length:inherit] leading-[inherit] outline-none",
            options.minHeightClass ?? "min-h-[6rem]",
          ),
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChangeRef.current(ed.getHTML());
      },
    },
    [extensions],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!options.disabled);
  }, [editor, options.disabled]);

  useEffect(() => {
    if (!editor) return;
    const next = options.value || "";
    if (next === editor.getHTML()) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, options.value]);

  return editor;
}
