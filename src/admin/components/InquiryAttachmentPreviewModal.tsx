import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CloudDownload, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createInquiryAttachmentSignedUrl,
  INQUIRY_ATTACHMENT_DOWNLOAD_TTL_SEC,
  INQUIRY_ATTACHMENT_PREVIEW_TTL_SEC,
} from "@/lib/inquiryAttachmentUpload";
import type { InquiryCommentAttachment } from "@/types/admin";

export type InquiryAttachmentPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachments: InquiryCommentAttachment[];
  initialIndex: number;
  t: (key: string) => string;
};

function isImageType(type: string) {
  return type.startsWith("image/");
}

function isPdfType(type: string) {
  return type === "application/pdf";
}

export default function InquiryAttachmentPreviewModal({
  open,
  onOpenChange,
  attachments,
  initialIndex,
  t,
}: InquiryAttachmentPreviewModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [mediaLoaded, setMediaLoaded] = useState(false);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const clampedIndex = attachments.length ? Math.min(Math.max(0, index), attachments.length - 1) : 0;
  const current = attachments[clampedIndex];

  useEffect(() => {
    if (!open || !current) {
      setSignedUrl(null);
      setUrlLoading(false);
      setMediaLoaded(false);
      return;
    }
    let cancelled = false;
    setSignedUrl(null);
    setUrlLoading(true);
    setMediaLoaded(false);
    void (async () => {
      try {
        const url = await createInquiryAttachmentSignedUrl(
          current.path,
          INQUIRY_ATTACHMENT_PREVIEW_TTL_SEC,
        );
        if (cancelled) return;
        if (!url) {
          toast.error(t("admin.inquiryAttachmentPreviewLoadFailed"));
          onOpenChange(false);
          return;
        }
        setSignedUrl(url);
      } finally {
        if (!cancelled) setUrlLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when storage path changes; object identity is unstable
  }, [open, current?.path, onOpenChange, t]);

  useEffect(() => {
    if (!open || !signedUrl || !current || !isPdfType(current.type) || mediaLoaded) return;
    const id = window.setTimeout(() => setMediaLoaded(true), 5000);
    return () => window.clearTimeout(id);
  }, [open, signedUrl, current, mediaLoaded]);

  const handleDownload = useCallback(async () => {
    if (!current) return;
    try {
      const url = await createInquiryAttachmentSignedUrl(
        current.path,
        INQUIRY_ATTACHMENT_DOWNLOAD_TTL_SEC,
      );
      if (!url) {
        toast.error(t("admin.inquiryAttachmentDownloadFailed"));
        return;
      }
      window.location.assign(url);
    } catch {
      toast.error(t("admin.inquiryAttachmentDownloadFailed"));
    }
  }, [current, t]);

  const showSpinner =
    urlLoading ||
    (signedUrl &&
      current &&
      !mediaLoaded &&
      (isImageType(current.type) || isPdfType(current.type)));
  const canPrev = clampedIndex > 0;
  const canNext = clampedIndex < attachments.length - 1;
  const multi = attachments.length > 1;

  if (!current) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <div
            className={cn(
              "fixed left-1/2 top-1/2 z-[201] flex w-[min(96vw,920px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex-col outline-none",
            )}
          >
            <motion.div
              className="flex max-h-[90vh] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-elev3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            >
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
                <Dialog.Title className="min-w-0 truncate text-base font-semibold text-slate-900 dark:text-zinc-100">
                  {t("admin.inquiryAttachmentPreviewTitle")}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  {current.name}
                </Dialog.Description>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 gap-1.5 border border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100"
                    onClick={() => void handleDownload()}
                  >
                    <CloudDownload className="h-4 w-4" aria-hidden />
                    {t("admin.inquiryAttachmentDownload")}
                  </Button>
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-slate-600 dark:text-zinc-300"
                      aria-label={t("admin.inquiryAttachmentPreviewCloseAria")}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </Dialog.Close>
                </div>
              </header>

              <div className="relative flex min-h-[min(70vh,520px)] flex-1 items-center justify-center bg-slate-950/5 px-4 py-6 dark:bg-black/30">
                {multi ? (
                  <button
                    type="button"
                    disabled={!canPrev}
                    aria-label={t("admin.inquiryAttachmentPreviewPrevAria")}
                    className={cn(
                      "absolute left-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200/90 bg-white/95 text-slate-800 shadow-md transition-colors",
                      "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      "disabled:pointer-events-none disabled:opacity-30",
                      "dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-100 dark:hover:bg-zinc-800",
                    )}
                    onClick={() => canPrev && setIndex((i) => Math.max(0, i - 1))}
                  >
                    <ChevronLeft className="h-6 w-6" aria-hidden />
                  </button>
                ) : null}
                {multi ? (
                  <button
                    type="button"
                    disabled={!canNext}
                    aria-label={t("admin.inquiryAttachmentPreviewNextAria")}
                    className={cn(
                      "absolute right-2 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200/90 bg-white/95 text-slate-800 shadow-md transition-colors",
                      "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      "disabled:pointer-events-none disabled:opacity-30",
                      "dark:border-white/10 dark:bg-zinc-900/95 dark:text-zinc-100 dark:hover:bg-zinc-800",
                    )}
                    onClick={() =>
                      canNext && setIndex((i) => Math.min(attachments.length - 1, i + 1))
                    }
                  >
                    <ChevronRight className="h-6 w-6" aria-hidden />
                  </button>
                ) : null}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.path}
                    className="relative flex max-h-[min(65vh,480px)] w-full max-w-full items-center justify-center"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  >
                    {signedUrl && isImageType(current.type) ? (
                      <img
                        src={signedUrl}
                        alt={current.name}
                        className="max-h-[min(65vh,480px)] max-w-full object-contain shadow-lg"
                        onLoad={() => setMediaLoaded(true)}
                        onError={() => {
                          toast.error(t("admin.inquiryAttachmentPreviewLoadFailed"));
                          onOpenChange(false);
                        }}
                      />
                    ) : null}
                    {signedUrl && isPdfType(current.type) ? (
                      <iframe
                        title={current.name}
                        src={signedUrl}
                        className="h-[min(65vh,480px)] w-full max-w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-white/10"
                        onLoad={() => setMediaLoaded(true)}
                      />
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {showSpinner ? (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/10 dark:bg-black/40"
                    aria-busy
                    aria-live="polite"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
                  </div>
                ) : null}
              </div>

              <footer className="shrink-0 border-t border-slate-200 px-4 py-2 text-center text-xs text-slate-500 dark:border-white/10 dark:text-zinc-400">
                <span className="truncate" title={current.name}>
                  {current.name}
                </span>
                {multi ? (
                  <span className="ml-2 text-slate-400 dark:text-zinc-500">
                    {clampedIndex + 1} / {attachments.length}
                  </span>
                ) : null}
              </footer>
            </motion.div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
