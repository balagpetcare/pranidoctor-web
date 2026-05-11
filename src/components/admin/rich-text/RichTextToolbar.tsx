"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import { memo } from "react";

import { clearRichTextFormatting } from "./clear-rich-formatting";
import { cn } from "@/lib/cn";

function ToolbarDivider() {
  return (
    <span
      className="mx-1 hidden h-7 w-px shrink-0 bg-zinc-200/80 sm:mx-1.5 sm:block dark:bg-zinc-700/80"
      aria-hidden
      role="presentation"
    />
  );
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
  title,
  "aria-label": ariaLabel,
}: Readonly<{
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
  title: string;
  "aria-label": string;
}>) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={Boolean(active)}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 outline-none",
        "transition-all duration-150 ease-out",
        "hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.95]",
        "focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
        "disabled:pointer-events-none disabled:opacity-30",
        "dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        "dark:focus-visible:ring-emerald-400/60 dark:focus-visible:ring-offset-zinc-900",
        active &&
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-800/60",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-zinc-50/80 p-0.5 ring-1 ring-zinc-200/70 dark:bg-zinc-900/60 dark:ring-zinc-700/60">
      {children}
    </div>
  );
}

export type RichTextToolbarProps = Readonly<{
  editor: Editor;
  disabled?: boolean;
}>;

export const RichTextToolbar = memo(function RichTextToolbar(props: RichTextToolbarProps) {
  const { editor, disabled } = props;
  const d = Boolean(disabled);

  const fmt = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed.isActive("bold"),
      italic: ed.isActive("italic"),
      underline: ed.isActive("underline"),
      h2: ed.isActive("heading", { level: 2 }),
      h3: ed.isActive("heading", { level: 3 }),
      bullet: ed.isActive("bulletList"),
      ordered: ed.isActive("orderedList"),
      quote: ed.isActive("blockquote"),
      canUndo: ed.can().undo(),
      canRedo: ed.can().redo(),
    }),
  });

  return (
    <div
      className={cn(
        "shrink-0 border-b px-3 py-2.5 sm:px-4 sm:py-3",
        "border-zinc-200/90 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/40",
        "flex flex-wrap items-center gap-2 sm:gap-3",
      )}
      role="toolbar"
      aria-label="টেক্সট ফরম্যাটিং টুলবার"
      aria-orientation="horizontal"
    >
      <ToolbarGroup>
        <ToolbarButton
          title="বোল্ড (Ctrl+B)"
          aria-label="বোল্ড"
          active={fmt.bold}
          disabled={d}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          title="ইটালিক (Ctrl+I)"
          aria-label="ইটালিক"
          active={fmt.italic}
          disabled={d}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          title="আন্ডারলাইন (Ctrl+U)"
          aria-label="আন্ডারলাইন"
          active={fmt.underline}
          disabled={d}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" aria-hidden />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          title="শিরোনাম স্তর ২"
          aria-label="শিরোনাম স্তর ২"
          active={fmt.h2}
          disabled={d}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          title="শিরোনাম স্তর ৩"
          aria-label="শিরোনাম স্তর ৩"
          active={fmt.h3}
          disabled={d}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" aria-hidden />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          title="বুলেট তালিকা"
          aria-label="বুলেট তালিকা"
          active={fmt.bullet}
          disabled={d}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          title="সংখ্যায়িত তালিকা"
          aria-label="সংখ্যায়িত তালিকা"
          active={fmt.ordered}
          disabled={d}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          title="ব্লক উদ্ধৃতি"
          aria-label="ব্লক উদ্ধৃতি"
          active={fmt.quote}
          disabled={d}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" aria-hidden />
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          title="পূর্বাবস্থা (Ctrl+Z)"
          aria-label="পূর্বাবস্থা"
          disabled={d || !fmt.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          title="পুনরায় (Ctrl+Y)"
          aria-label="পুনরায়"
          disabled={d || !fmt.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" aria-hidden />
        </ToolbarButton>
        <ToolbarButton
          title="ফরম্যাট মুছুন"
          aria-label="ফরম্যাট মুছুন"
          disabled={d}
          onClick={() => clearRichTextFormatting(editor)}
        >
          <Eraser className="h-4 w-4" aria-hidden />
        </ToolbarButton>
      </ToolbarGroup>
    </div>
  );
});

RichTextToolbar.displayName = "RichTextToolbar";
