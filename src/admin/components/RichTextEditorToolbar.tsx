import type { Editor } from "@tiptap/react";
import { Bold, Italic, Underline as UnderlineIcon, List } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  editor: Editor | null;
  t: (key: string) => string;
  className?: string;
};

const FONT_SIZES = [
  { value: "", labelKey: "admin.editor.sizeDefault" },
  { value: "0.875rem", labelKey: "admin.editor.sizeSmall" },
  { value: "1rem", labelKey: "admin.editor.sizeNormal" },
  { value: "1.125rem", labelKey: "admin.editor.sizeLarge" },
  { value: "1.25rem", labelKey: "admin.editor.sizeXl" },
] as const;

function ToolbarBtn({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-600 transition-colors disabled:opacity-40 dark:text-zinc-300",
        active
          ? "bg-primary/15 text-primary dark:bg-primary/25"
          : "hover:bg-slate-100 dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditorToolbar({ editor, t, className }: Props) {
  if (!editor) return null;

  const fontSize = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  return (
    <div
      className={cn(
        "flex flex-nowrap items-center gap-1 overflow-x-auto overflow-y-hidden border-b border-slate-200/80 px-1 py-1.5 dark:border-white/10",
        "scrollbar-inquiry",
        "sm:flex-wrap sm:overflow-x-visible",
        className,
      )}
      role="toolbar"
      aria-label={t("admin.editor.toolbar")}
    >
      <ToolbarBtn
        label={t("admin.editor.bold")}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label={t("admin.editor.italic")}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label={t("admin.editor.underline")}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarBtn>
      <ToolbarBtn
        label={t("admin.editor.bulletList")}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarBtn>
      <label className="sr-only" htmlFor="rte-font-size">
        {t("admin.editor.fontSize")}
      </label>
      <select
        id="rte-font-size"
        value={fontSize}
        aria-label={t("admin.editor.fontSize")}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) {
            editor.chain().focus().unsetFontSize().run();
          } else {
            editor.chain().focus().setFontSize(v).run();
          }
        }}
        className="ml-1 h-8 min-w-[7.5rem] max-w-[9rem] shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {FONT_SIZES.map((s) => (
          <option key={s.value || "default"} value={s.value}>
            {t(s.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
