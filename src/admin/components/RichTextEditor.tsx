import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style/text-style";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { cn } from "@/lib/utils";
import { RichTextEditorToolbar } from "@/admin/components/RichTextEditorToolbar";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Minimal: borderless until focus-within; default: always bordered */
  variant?: "default" | "minimal";
  showToolbar?: boolean;
  t: (key: string) => string;
  "aria-label"?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  variant = "default",
  showToolbar = true,
  t,
  ...rest
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
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
          "admin-prose max-w-none px-3 py-2 text-sm focus:outline-none",
          variant === "minimal"
            ? cn(
                "min-h-[120px] rounded-b-xl border-0 border-transparent bg-transparent text-slate-900",
                "focus-visible:outline-none",
                "dark:text-zinc-100",
              )
            : cn(
                "min-h-[140px] rounded-xl border border-slate-200 bg-white text-slate-900",
                "focus-visible:ring-2 focus-visible:ring-primary/40 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100",
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

  if (!editor) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl",
          shellMinimal
            ? "border border-transparent bg-slate-50/50 dark:bg-zinc-900/40"
            : "border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-zinc-900/60",
        )}
      >
        {showToolbar ? (
          <div className="h-9 border-b border-slate-200 dark:border-white/10" aria-hidden />
        ) : null}
        <div className="min-h-[120px] animate-pulse bg-slate-100/80 dark:bg-zinc-800/50" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl transition-[box-shadow,border-color]",
        shellMinimal
          ? cn(
              "border border-transparent bg-white/80 shadow-none",
              "focus-within:border-slate-200 focus-within:shadow-sm focus-within:ring-2 focus-within:ring-primary/25",
              "dark:bg-zinc-950/50 dark:focus-within:border-white/10 dark:focus-within:ring-primary/30",
            )
          : "border border-slate-200 bg-white dark:border-white/10 dark:bg-zinc-950",
      )}
    >
      {showToolbar ? <RichTextEditorToolbar editor={editor as Editor} t={t} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}
