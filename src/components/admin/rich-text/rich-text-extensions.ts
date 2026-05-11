import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";

/**
 * Shared TipTap extensions for admin rich fields.
 * Keeps HTML compatible with existing stored content (h2/h3, lists, paragraphs).
 */
export function createRichTextExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: false,
      horizontalRule: false,
      blockquote: {},
      underline: {},
    }),
    Placeholder.configure({
      placeholder,
      showOnlyWhenEditable: true,
    }),
  ];
}
