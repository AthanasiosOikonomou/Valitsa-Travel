import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function dedupeTrimmed(items: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of items) {
    const s = raw.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function StringArrayField({ value, onChange, placeholder, disabled, className }: Props) {
  const [draft, setDraft] = useState("");

  const commitDraft = useCallback(() => {
    const s = draft.trim();
    if (!s) return;
    onChange(dedupeTrimmed([...value, s]));
    setDraft("");
  }, [draft, onChange, value]);

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitDraft();
    }
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      removeAt(value.length - 1);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex min-h-10 flex-wrap gap-2 rounded-xl border border-slate-200 bg-white px-2 py-2 dark:border-white/10 dark:bg-zinc-950">
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
          >
            <span className="truncate" title={tag}>
              {tag}
            </span>
            <button
              type="button"
              disabled={disabled}
              className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-zinc-100"
              onClick={() => removeAt(i)}
              aria-label="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <Input
          disabled={disabled}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => commitDraft()}
          placeholder={placeholder}
          className="min-w-[8rem] flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
    </div>
  );
}
