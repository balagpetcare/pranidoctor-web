"use client";

import { memo, useId } from "react";

import { RichTextContent } from "./RichTextContent";
import { RichTextToolbar } from "./RichTextToolbar";
import { useRichTextEditor } from "./useRichTextEditor";
import { cn } from "@/lib/cn";

import "./rich-text.css";

export type RichTextEditorProps = Readonly<{
  id?: string;
  label: string;
  labelHint?: string;
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  minHeightClass?: string;
  sizeVariant?: "compact" | "default" | "large";
}>;

export const RichTextEditor = memo(function RichTextEditor(props: RichTextEditorProps) {
  const editorLabelId = useId();
  const editorBodyId = useId();
  const editor = useRichTextEditor({
    value: props.value,
    onChange: props.onChange,
    disabled: props.disabled,
    placeholder: props.placeholder,
    minHeightClass: props.minHeightClass,
  });
  const d = props.disabled;
  const sizeVariant = props.sizeVariant ?? "default";

  const sizeContentClass =
    sizeVariant === "compact"
      ? "pd-rich-editor-content--compact"
      : sizeVariant === "large"
        ? "pd-rich-editor-content--large"
        : "";

  return (
    <div className={cn("pd-rich-editor-wrapper flex flex-col", props.className)}>
      <label id={editorLabelId} className="pd-rich-editor-label">
        {props.label}
        {props.labelHint ? <span className="pd-rich-editor-label-hint">{props.labelHint}</span> : null}
      </label>
      <div
        className={cn(
          "pd-rich-editor flex flex-col overflow-visible bg-white dark:bg-zinc-950",
          d && "pointer-events-none opacity-[0.58] saturate-[0.92]",
        )}
      >
        {editor ? (
          <RichTextToolbar editor={editor} disabled={d} />
        ) : (
          <div
            className="h-[52px] shrink-0 animate-pulse rounded-t-[inherit] border-b border-zinc-200/85 bg-gradient-to-r from-zinc-100 via-white to-zinc-100 dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900"
            aria-hidden
          />
        )}
        <RichTextContent
          id={props.id ?? editorBodyId}
          labelledBy={editorLabelId}
          editor={editor}
          className={sizeContentClass}
        />
      </div>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";
