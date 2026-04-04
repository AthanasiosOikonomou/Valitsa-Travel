import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { uploadTripImage } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  /** Shown under the control (e.g. single-photo rule). */
  hint?: string;
  removeLabel?: string;
  className?: string;
};

export function TripImageDropzone({ value, onChange, hint, removeLabel, className }: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (!f) return;
      setErr(null);
      setBusy(true);
      try {
        const { url } = await uploadTripImage(f);
        onChange(url);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"] },
    maxFiles: 1,
    disabled: busy || !!value,
    noClick: !!value,
    noKeyboard: !!value,
  });

  if (value) {
    return (
      <div className={cn("space-y-2", className)}>
        {hint ? (
          <p className="text-sm text-slate-600 dark:text-zinc-400" role="note">
            {hint}
          </p>
        ) : null}
        <div className="space-y-3">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <div className="aspect-[21/9] w-full max-h-[min(40vh,22rem)] sm:aspect-[2.4/1]">
              <img src={value} alt="" className="h-full w-full object-cover" />
            </div>
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 transition-opacity",
                "group-hover:opacity-100 group-focus-within:opacity-100",
              )}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shadow-lg"
                onClick={() => onChange(null)}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {removeLabel ? <span className="ml-1.5">{removeLabel}</span> : null}
              </Button>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-slate-200 sm:hidden dark:border-white/15"
            onClick={() => onChange(null)}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            {removeLabel ? <span className="ml-2">{removeLabel}</span> : null}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {hint ? (
        <p className="text-sm text-slate-600 dark:text-zinc-400" role="note">
          {hint}
        </p>
      ) : null}
      <div
        {...getRootProps()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 transition-colors hover:bg-slate-100 dark:border-white/15 dark:bg-zinc-950/50 dark:hover:bg-zinc-900/50",
          isDragActive && "border-primary bg-primary/5",
          busy && "pointer-events-none opacity-70",
        )}
      >
        <input {...getInputProps()} />
        {busy ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : (
          <ImageIcon className="h-10 w-10 text-slate-400 dark:text-zinc-500" />
        )}
        <p className="text-center text-sm text-slate-600 dark:text-zinc-400">
          Drop an image here, or click to browse
        </p>
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}
    </div>
  );
}
