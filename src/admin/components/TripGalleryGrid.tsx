import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, Loader2 } from "lucide-react";
import { uploadTripImage } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
  dropHint: string;
  /** Short label on thumbnail (e.g. "Remove") */
  removeButtonLabel: string;
  className?: string;
};

const MAX = 4;

export function TripGalleryGrid({
  urls,
  onChange,
  dropHint,
  removeButtonLabel,
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const remaining = MAX - urls.length;
  const canAdd = remaining > 0;

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const cap = Math.min(acceptedFiles.length, remaining);
      if (cap <= 0) return;
      const batch = acceptedFiles.slice(0, cap);
      setErr(null);
      setBusy(true);
      try {
        const results = await Promise.all(batch.map((file) => uploadTripImage(file)));
        const next = [...urls, ...results.map((r) => r.url)].slice(0, MAX);
        onChange(next);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange, remaining, urls],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"] },
    maxFiles: remaining,
    multiple: true,
    disabled: busy || !canAdd,
    noClick: !canAdd,
    noKeyboard: !canAdd,
  });

  const removeAt = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {Array.from({ length: MAX }, (_, i) => {
          const url = urls[i];
          const isDropSlot = url === undefined && i === urls.length && canAdd;

          if (url !== undefined) {
            return (
              <div
                key={`g-${i}-${url.slice(-20)}`}
                className="group relative aspect-square max-h-[5.5rem] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:max-h-[6rem]"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/55 to-transparent p-1 pt-4 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 max-w-[calc(100%-4px)] truncate px-2 text-[10px] font-medium shadow-md sm:text-xs"
                    onClick={() => removeAt(i)}
                    aria-label={removeButtonLabel}
                  >
                    {removeButtonLabel}
                  </Button>
                </div>
              </div>
            );
          }

          if (isDropSlot) {
            return (
              <div
                key="drop-add"
                {...getRootProps()}
                className={cn(
                  "relative flex aspect-square max-h-[5.5rem] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-1 py-2 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-zinc-950/50 dark:hover:bg-zinc-900/50 sm:max-h-[6rem]",
                  isDragActive && "border-primary bg-primary/5",
                  busy && "pointer-events-none opacity-70",
                )}
              >
                <input {...getInputProps()} />
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                )}
                <p className="line-clamp-2 px-0.5 text-center text-[9px] leading-tight text-slate-600 dark:text-zinc-400 sm:text-[10px]">
                  {dropHint}
                </p>
              </div>
            );
          }

          return (
            <div
              key={`empty-${i}`}
              className="aspect-square max-h-[5.5rem] rounded-xl border border-dashed border-slate-100 bg-slate-50/50 dark:border-white/5 dark:bg-zinc-950/30 sm:max-h-[6rem]"
              aria-hidden
            />
          );
        })}
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
