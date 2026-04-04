import { useEffect, useState } from "react";
import { FileText, File as FileIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createInquiryAttachmentSignedUrl,
  INQUIRY_ATTACHMENT_DOWNLOAD_TTL_SEC,
  INQUIRY_ATTACHMENT_THUMB_TTL_SEC,
} from "@/lib/inquiryAttachmentUpload";
import type { InquiryCommentAttachment } from "@/types/admin";

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
    <ul
      className={cn(
        "mt-2 flex min-h-[3rem] shrink-0 flex-wrap gap-2",
        alignEnd ? "justify-end" : "justify-start",
        className,
      )}
      aria-label={t("admin.inquiryAttachmentGalleryLabel")}
    >
      {attachments.map((a) => {
        const Icon = iconForMime(a.type);
        const busy = downloadingPath === a.path;
        const isImage = a.type.startsWith("image/");
        return (
          <li
            key={a.path}
            className={cn(
              "flex max-w-[min(100%,14rem)] items-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-2.5 py-2 shadow-sm dark:border-white/10 dark:bg-zinc-900/90",
            )}
          >
            {isImage ? (
              <AttachmentThumb path={a.path} type={a.type} name={a.name} />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800">
                <Icon className="h-5 w-5 text-slate-600 dark:text-zinc-300" aria-hidden />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-800 dark:text-zinc-100" title={a.name}>
                {a.name}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                className="mt-1 h-7 px-2 text-xs text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:bg-primary/20"
                onClick={() => void onDownload(a.path)}
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-1 h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                    {t("admin.inquiryAttachmentLinkLoading")}
                  </>
                ) : (
                  t("admin.inquiryAttachmentDownload")
                )}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
