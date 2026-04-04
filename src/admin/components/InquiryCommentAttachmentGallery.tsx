import { lazy, Suspense, useEffect, useState } from "react";
import {
  CloudDownload,
  Eye,
  FileText,
  File as FileIcon,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  createInquiryAttachmentSignedUrl,
  INQUIRY_ATTACHMENT_DOWNLOAD_TTL_SEC,
  INQUIRY_ATTACHMENT_THUMB_TTL_SEC,
} from "@/lib/inquiryAttachmentUpload";
import type { InquiryCommentAttachment } from "@/types/admin";

const InquiryAttachmentPreviewModal = lazy(() => import("./InquiryAttachmentPreviewModal"));

type Props = {
  attachments: InquiryCommentAttachment[];
  t: (key: string) => string;
  alignEnd?: boolean;
  className?: string;
};

function iconForMime(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type === "application/pdf") return FileText;
  return FileIcon;
}

function isPreviewableType(type: string) {
  return type.startsWith("image/") || type === "application/pdf";
}

function AttachmentThumb({ path, type, name }: { path: string; type: string; name: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!type.startsWith("image/")) return;
    let cancelled = false;
    void (async () => {
      const url = await createInquiryAttachmentSignedUrl(path, INQUIRY_ATTACHMENT_THUMB_TTL_SEC);
      if (!cancelled && url) setSrc(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [path, type]);

  if (!type.startsWith("image/")) return null;
  if (!src) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-100/80 dark:border-white/10 dark:bg-zinc-800/80">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-zinc-500" aria-hidden />
      </div>
    );
  }
  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200/90 dark:border-white/10">
      <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}

export function InquiryCommentAttachmentGallery({ attachments, t, alignEnd, className }: Props) {
  const [downloadingPath, setDownloadingPath] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  if (!attachments?.length) return null;

  const onDownload = async (path: string) => {
    setDownloadingPath(path);
    try {
      const url = await createInquiryAttachmentSignedUrl(path, INQUIRY_ATTACHMENT_DOWNLOAD_TTL_SEC);
      if (!url) {
        toast.error(t("admin.inquiryAttachmentDownloadFailed"));
        return;
      }
      window.location.assign(url);
    } catch {
      toast.error(t("admin.inquiryAttachmentDownloadFailed"));
    } finally {
      setDownloadingPath(null);
    }
  };

  return (
    <>
      <ul
        className={cn(
          "mt-2 flex min-h-[3rem] shrink-0 flex-wrap gap-2",
          alignEnd ? "justify-end" : "justify-start",
          className,
        )}
        aria-label={t("admin.inquiryAttachmentGalleryLabel")}
      >
        {attachments.map((a, i) => {
          const Icon = iconForMime(a.type);
          const busy = downloadingPath === a.path;
          const isImage = a.type.startsWith("image/");
          const previewable = isPreviewableType(a.type);

          const cardMain = (
            <>
              <div className="relative shrink-0">
                {isImage ? (
                  <AttachmentThumb path={a.path} type={a.type} name={a.name} />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800">
                    <Icon className="h-5 w-5 text-slate-600 dark:text-zinc-300" aria-hidden />
                  </div>
                )}
                {previewable ? (
                  <div className="pointer-events-none absolute inset-0 hidden items-center justify-center rounded-lg bg-black/45 group-hover:flex">
                    <Eye className="h-6 w-6 text-white drop-shadow-sm" aria-hidden />
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p
                  className="truncate text-xs font-medium text-slate-800 dark:text-zinc-100"
                  title={a.name}
                >
                  {a.name}
                </p>
              </div>
            </>
          );

          return (
            <li
              key={a.path}
              className={cn(
                "flex max-w-[min(100%,16rem)] items-center gap-1 rounded-xl border border-slate-200/90 bg-white/90 px-2 py-2 shadow-sm dark:border-white/10 dark:bg-zinc-900/90",
              )}
            >
              {previewable ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-slate-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:bg-white/5"
                      aria-label={t("admin.inquiryAttachmentPreviewTooltip")}
                      onClick={() => setPreviewIndex(i)}
                    >
                      {cardMain}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("admin.inquiryAttachmentPreviewTooltip")}</TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      disabled={busy}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-slate-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 dark:hover:bg-white/5"
                      aria-label={`${t("admin.inquiryAttachmentDownload")}: ${a.name}`}
                      onClick={() => void onDownload(a.path)}
                    >
                      {cardMain}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("admin.inquiryAttachmentDownload")}</TooltipContent>
                </Tooltip>
              )}

              {previewable ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={busy}
                      className="h-8 w-8 shrink-0 text-slate-600 dark:text-zinc-300"
                      aria-label={t("admin.inquiryAttachmentPreviewDownloadAria")}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onDownload(a.path);
                      }}
                    >
                      {busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <CloudDownload className="h-4 w-4" aria-hidden />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{t("admin.inquiryAttachmentDownload")}</TooltipContent>
                </Tooltip>
              ) : null}
            </li>
          );
        })}
      </ul>

      {previewIndex !== null ? (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
              aria-busy
              aria-label={t("admin.inquiryAttachmentLinkLoading")}
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          }
        >
          <InquiryAttachmentPreviewModal
            open
            attachments={attachments}
            initialIndex={previewIndex}
            t={t}
            onOpenChange={(next) => {
              if (!next) setPreviewIndex(null);
            }}
          />
        </Suspense>
      ) : null}
    </>
  );
}
