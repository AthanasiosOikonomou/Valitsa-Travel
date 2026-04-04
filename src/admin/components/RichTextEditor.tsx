import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

export function RichTextEditor({ value, onChange, placeholder, className, ...rest }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Write here…" }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "admin-prose min-h-[140px] max-w-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100",
          className,
        ),
        ...("aria-label" in rest ? { "aria-label": rest["aria-label"] } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
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

  if (!editor) {
    return (
      <div className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-zinc-900/60" />
    );
  }

  return <EditorContent editor={editor} />;
}
