import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, Loader2, Plus, X } from "lucide-react";
import { uploadTripImage } from "@/lib/adminApi";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
  dropHint: string;
  /** Short label on thumbnail (e.g. "Remove") */
  removeButtonLabel: string;
  className?: string;
};

const MAX = 4;

async function downloadImageUrl(url: string, filename: string) {
  try {
    const r = await fetch(url, { mode: "cors" });
    if (!r.ok) throw new Error("fetch failed");
    const blob = await r.blob();
    const a = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function TripGalleryGrid({
  urls,
  onChange,
  dropHint,
  removeButtonLabel,
  className,
}: Props) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleDownload = (e: React.MouseEvent, url: string, index: number) => {
    e.stopPropagation();
    const ext = url.split(".").pop()?.split("?")[0] || "webp";
    void downloadImageUrl(url, `trip-gallery-${index + 1}.${ext}`);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: MAX }, (_, i) => {
          const url = urls[i];
          const isDropSlot = url === undefined && i === urls.length && canAdd;
          const isFutureEmpty = url === undefined && i > urls.length;

          if (url !== undefined) {
            return (
              <div
                key={`g-${i}-${url.slice(-20)}`}
                className="group relative aspect-square max-h-[5.75rem] overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-sm ring-1 ring-slate-200/50 dark:border-white/10 dark:bg-zinc-900 dark:ring-white/5 sm:max-h-[6.25rem]"
              >
                <button
                  type="button"
                  className="relative block h-full w-full cursor-zoom-in"
                  onClick={() => setPreviewUrl(url)}
                  aria-label={t("admin.tripGalleryPreviewOpen")}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
                <div className="absolute right-1 top-1 z-10 flex gap-0.5">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-lg border border-white/30 bg-black/45 text-white shadow-md backdrop-blur-sm hover:bg-black/60"
                    onClick={(e) => handleDownload(e, url, i)}
                    aria-label={t("admin.tripGalleryDownload")}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/55 to-transparent p-1 pt-4 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-7 max-w-[calc(100%-4px)] truncate px-2 text-[10px] font-medium shadow-md sm:text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(i);
                    }}
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
                  "relative flex aspect-square max-h-[5.75rem] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/80 px-1 py-2 transition-colors hover:border-primary/50 hover:bg-slate-100 dark:border-white/20 dark:bg-zinc-950/50 dark:hover:border-primary/40 dark:hover:bg-zinc-900/50 sm:max-h-[6.25rem]",
                  isDragActive && "border-primary bg-primary/5",
                  busy && "pointer-events-none opacity-70",
                )}
              >
                <input {...getInputProps()} />
                {busy ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <Plus className="h-6 w-6 text-slate-500 dark:text-zinc-400" strokeWidth={2} />
                )}
                <p className="line-clamp-2 px-0.5 text-center text-[9px] font-medium leading-tight text-slate-600 dark:text-zinc-400 sm:text-[10px]">
                  {dropHint}
                </p>
              </div>
            );
          }

          return (
            <div
              key={`empty-${i}`}
              className="flex aspect-square max-h-[5.75rem] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-200/90 bg-slate-50/60 text-slate-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-500 sm:max-h-[6.25rem]"
              aria-hidden
            >
              <Plus className="h-5 w-5 opacity-60" strokeWidth={1.75} />
              <span className="text-[9px] font-medium sm:text-[10px]">{t("admin.tripGalleryEmptySlot")}</span>
            </div>
          );
        })}
      </div>
      {err ? <p className="text-xs text-destructive">{err}</p> : null}

      <Dialog.Root open={previewUrl !== null} onOpenChange={(o) => !o && setPreviewUrl(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-[601] flex max-h-[min(92vh,900px)] w-[min(96vw,1100px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl outline-none"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 sm:px-4">
              <Dialog.Title className="text-sm font-medium text-white">
                {t("admin.tripGalleryPreviewTitle")}
              </Dialog.Title>
              <div className="flex items-center gap-1">
                {previewUrl ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() =>
                      void downloadImageUrl(
                        previewUrl,
                        `trip-gallery-preview.${previewUrl.split(".").pop()?.split("?")[0] || "webp"}`,
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    {t("admin.tripGalleryDownload")}
                  </Button>
                ) : null}
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/10">
                    <X className="h-5 w-5" />
                    <span className="sr-only">{t("admin.tripGalleryPreviewClose")}</span>
                  </Button>
                </Dialog.Close>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-6">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="max-h-[min(80vh,820px)] max-w-full object-contain"
                />
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
