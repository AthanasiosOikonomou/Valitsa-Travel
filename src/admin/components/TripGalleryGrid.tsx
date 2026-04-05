import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, Loader2, X } from "lucide-react";
import { uploadTripImage } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
  dropHint: string;
  removeLabel: string;
  className?: string;
};

const MAX = 4;

export function TripGalleryGrid({ urls, onChange, dropHint, removeLabel, className }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const appendImage = useCallback(
    async (file: File) => {
      if (urls.length >= MAX) return;
      setErr(null);
      setBusy(true);
      try {
        const { url } = await uploadTripImage(file);
        onChange([...urls, url]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange, urls],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (!f) return;
      await appendImage(f);
    },
    [appendImage],
  );

  const nextSlot = urls.length;
  const canAdd = nextSlot < MAX;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"] },
    maxFiles: 1,
    disabled: busy || !canAdd,
    noClick: !canAdd,
    noKeyboard: !canAdd,
  });

  const removeAt = (index: number) => {
    onChange(urls.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: MAX }, (_, i) => {
          const url = urls[i];
          const isDropSlot = url === undefined && i === nextSlot && canAdd;

          if (url !== undefined) {
            return (
              <div
                key={`g-${i}-${url.slice(-12)}`}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-zinc-900"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full border border-white/20 bg-black/50 text-white shadow-lg backdrop-blur-sm hover:bg-black/65"
                    onClick={() => removeAt(i)}
                    aria-label={removeLabel}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            );
          }

          if (isDropSlot) {
            return (
              <div
                key={`drop-${i}`}
                {...getRootProps()}
                className={cn(
                  "relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-4 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-zinc-950/50 dark:hover:bg-zinc-900/50",
                  isDragActive && "border-primary bg-primary/5",
                  busy && "pointer-events-none opacity-70",
                )}
              >
                <input {...getInputProps()} />
                {busy ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-slate-400 dark:text-zinc-500" />
                )}
                <p className="px-1 text-center text-xs text-slate-600 dark:text-zinc-400">{dropHint}</p>
              </div>
            );
          }

          return (
            <div
              key={`empty-${i}`}
              className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-slate-100 bg-slate-50/50 dark:border-white/5 dark:bg-zinc-950/30"
              aria-hidden
            />
          );
        })}
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
