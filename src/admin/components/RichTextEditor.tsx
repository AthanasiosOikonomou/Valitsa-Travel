import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style/text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { cn } from "@/lib/utils";
import { RichTextEditorToolbar } from "@/admin/components/RichTextEditorToolbar";

export type RichTextEditorHandle = {
  insertContent: (html: string) => void;
  focus: () => void;
};

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "minimal";
  showToolbar?: boolean;
  /** When false, the editor is read-only (no typing / toolbar actions). */
  disabled?: boolean;
  t: (key: string) => string;
  /** When set, toolbar shows attachment picker for this inquiry. */
  attachmentContext?: { inquiryId: string } | null;
  onInquiryAttachmentFilesSelected?: (files: File[]) => void;
  attachmentPickerDisabled?: boolean;
  "aria-label"?: string;
};

export const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(function RichTextEditor(
  {
    value,
    onChange,
    placeholder,
    className,
    variant = "default",
    showToolbar = true,
    disabled = false,
    t,
    attachmentContext = null,
    onInquiryAttachmentFilesSelected,
    attachmentPickerDisabled,
    ...rest
  },
  ref,
) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        bulletList: { HTMLAttributes: { class: "list-disc pl-5" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-5" } },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto"],
        defaultProtocol: "https",
        linkOnPaste: true,
        HTMLAttributes: {
          class: "font-medium text-indigo-600 underline decoration-indigo-600/80 underline-offset-2 hover:text-indigo-700 dark:text-indigo-300 dark:decoration-indigo-300/80 dark:hover:text-indigo-200",
          rel: "noopener noreferrer nofollow",
        },
      }),
      TextStyle,
      FontSize,
      Underline,
      Placeholder.configure({ placeholder: placeholder ?? "…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "admin-prose prose prose-sm max-w-none px-3 py-2 text-sm text-slate-900 focus:outline-none dark:prose-invert dark:text-zinc-100",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "prose-a:text-indigo-600 prose-a:underline prose-a:decoration-indigo-600/80 dark:prose-a:text-indigo-300",
          variant === "minimal"
            ? cn(
                "min-h-0 rounded-none border-0 border-transparent bg-transparent",
                "focus-visible:outline-none",
              )
            : cn(
                "min-h-0 rounded-xl border border-slate-200 bg-white",
                "focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-zinc-950",
              ),
          className,
        ),
        ...("aria-label" in rest ? { "aria-label": rest["aria-label"] } : {}),
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      insertContent: (html: string) => {
        editor?.chain().focus("end").insertContent(html).run();
      },
      focus: () => {
        editor?.chain().focus("end").run();
      },
    }),
    [editor],
  );

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const next = value || "";
    const current = editor.getHTML();
    if (current === next) return;
    const isEmptyHtml = (h: string) => h === "" || h === "<p></p>";
    if (isEmptyHtml(current) && isEmptyHtml(next)) return;
    editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const shellMinimal = variant === "minimal";

  const shellHeight = showToolbar ? "h-[236px]" : "h-[200px]";

  if (!editor) {
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-xl",
          shellHeight,
          shellMinimal
            ? "border border-transparent bg-slate-50/50 dark:bg-zinc-900/40"
            : "border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-zinc-900/60",
        )}
      >
        {showToolbar ? (
          <div
            className="h-9 shrink-0 border-b border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-950"
            aria-hidden
          />
        ) : null}
        <div className="min-h-0 flex-1 w-full overflow-y-auto scrollbar-inquiry">
          <div className="min-h-full animate-pulse bg-slate-100/80 dark:bg-zinc-800/50" />
        </div>
      </div>
    );
  }

  const focusShellFromPointer = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const el = e.target as HTMLElement;
    if (el.closest('[role="toolbar"]')) return;
    if (el.closest(".ProseMirror")) return;
    editor.chain().focus("end").run();
  };

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl transition-[box-shadow,border-color]",
        shellHeight,
        disabled && "pointer-events-none opacity-60",
        shellMinimal
          ? cn(
              "cursor-text border border-transparent bg-white/80 shadow-none",
              "focus-within:border-purple-500/50 focus-within:shadow-sm focus-within:ring-2 focus-within:ring-purple-500",
              "dark:bg-zinc-950/50 dark:focus-within:border-purple-400/45 dark:focus-within:ring-purple-400",
            )
          : "border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-950",
      )}
      onMouseDown={disabled ? undefined : focusShellFromPointer}
    >
      {showToolbar ? (
        <div className="sticky top-0 z-10 shrink-0 bg-white dark:bg-zinc-950">
          <RichTextEditorToolbar
            editor={editor as Editor}
            t={t}
            attachmentContext={attachmentContext}
            onInquiryAttachmentFilesSelected={onInquiryAttachmentFilesSelected}
            attachmentPickerDisabled={attachmentPickerDisabled}
          />
        </div>
      ) : null}
      <div className="min-h-0 flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-inquiry">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

export default RichTextEditor;

