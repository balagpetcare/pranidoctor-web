import type { Editor } from "@tiptap/react";

/**
 * Clears inline marks and normalizes common block structures for the current selection/caret.
 * Avoids select-all replacement to reduce accidental blank-document edits.
 */
export function clearRichTextFormatting(editor: Editor): void {
  editor.chain().focus().unsetAllMarks().run();

  let guard = 0;
  while (editor.can().liftListItem("listItem") && guard < 32) {
    editor.chain().focus().liftListItem("listItem").run();
    guard += 1;
  }

  if (editor.isActive("blockquote")) {
    editor.chain().focus().toggleBlockquote().run();
  }

  if (editor.isActive("heading")) {
    editor.chain().focus().setParagraph().run();
  }
}
