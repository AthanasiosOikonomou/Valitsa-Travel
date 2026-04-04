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
          "admin-prose min-h-[140px] max-w-none rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
          className,
        ),
        ...("aria-label" in rest ? { "aria-label": rest["aria-label"] } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="min-h-[140px] rounded-xl border border-border bg-muted/40" />;
  }

  return <EditorContent editor={editor} />;
}
