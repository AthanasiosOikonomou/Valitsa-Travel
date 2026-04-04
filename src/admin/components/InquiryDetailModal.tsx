import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Copy, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminInquiryRow, InquiryCommentAttachment, InquiryCommentRow } from "@/types/admin";
import {
  fetchInquiryComments,
  normalizeInquiryCommentRow,
  patchInquiry,
  postInquiryComment,
} from "@/lib/adminInquiryApi";
import { formatAbsoluteDateTime, formatRelativeTime } from "@/lib/formatRelativeTime";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import RichTextEditor, { type RichTextEditorHandle } from "@/admin/components/RichTextEditor";
import { inquiryStatusLabel } from "@/lib/inquiryStatusLabel";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { InquiryCommentAttachmentGallery } from "@/admin/components/InquiryCommentAttachmentGallery";
import { InquiryTimelineHtml } from "@/admin/components/InquiryTimelineHtml";
import {
  extractImageUrlsFromHtml,
  inquiryHtmlToPlainText,
  sanitizeInquiryHtml,
} from "@/lib/sanitizeInquiryHtml";
import { INQUIRY_ATTACHMENT_MAX_FILES, validateAttachmentPick } from "@/lib/inquiryAttachmentLimits";
import {
  removeInquiryAttachmentsFromStorage,
  uploadInquiryAttachment,
} from "@/lib/inquiryAttachmentUpload";

const STATUSES = ["new", "contacted", "resolved"] as const;

type Props = {
  inquiry: AdminInquiryRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function isHtmlEmpty(html: string): boolean {
  const stripped = html.replace(/<[^>]+>/g, "").replace(/\s|&nbsp;/g, "");
  return stripped.length === 0;
}

function escapeForHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type TimelineItem =
  | { key: string; kind: "customer"; at: string; author: string; plain: string }
  | { key: string; kind: "comment"; at: string; author: string; html: string; row: InquiryCommentRow };

function isCustomerBubble(item: TimelineItem): boolean {
  return item.kind === "customer";
}

type PendingUpload =
  | { clientId: string; status: "uploading"; name: string; file: File }
  | { clientId: string; status: "complete"; name: string; path: string; type: string; sizeBytes: number };

export function InquiryDetailModal({ inquiry, open, onOpenChange }: Props) {
  const { t, lang } = useLanguage();
  const qc = useQueryClient();
  /** Stable string id for queries, uploads, and API paths (avoids ref-identity churn on refetch). */
  const inquiryId =
    inquiry?.id != null && String(inquiry.id).trim() !== "" ? String(inquiry.id).trim() : null;

  const [status, setStatus] = useState<string>("new");
  const [draft, setDraft] = useState("");
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const pendingUploadsRef = useRef<PendingUpload[]>([]);
  pendingUploadsRef.current = pendingUploads;
  const uploadAbortByClientIdRef = useRef<Map<string, AbortController>>(new Map());
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);
  const prevTimelineLenRef = useRef(0);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!inquiry) return;
    setStatus((inquiry.status as string) || "new");
  }, [inquiry?.id, inquiry?.status]);

  /** Only reset the composer when switching inquiries or opening the modal — not when `inquiry` object identity changes. */
  useEffect(() => {
    if (!inquiryId || !open) return;
    for (const ac of uploadAbortByClientIdRef.current.values()) {
      ac.abort();
    }
    uploadAbortByClientIdRef.current.clear();
    setDraft("");
    setPendingUploads([]);
  }, [inquiryId, open]);

  useEffect(() => {
    if (!open) prevTimelineLenRef.current = 0;
  }, [open]);

  useEffect(() => {
    prevTimelineLenRef.current = 0;
  }, [inquiryId]);

  const commentsQ = useQuery({
    queryKey: ["inquiry-comments", inquiryId],
    queryFn: () => fetchInquiryComments(inquiryId!),
    enabled: open && !!inquiryId,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });

  const quickInserts = useMemo(
    () => [
      { label: t("admin.inquiryQuickPhone"), text: t("admin.inquiryQuickPhone") },
      { label: t("admin.inquiryQuickEmail"), text: t("admin.inquiryQuickEmail") },
      { label: t("admin.inquiryQuickFollowUp"), text: t("admin.inquiryQuickFollowUp") },
    ],
    [t],
  );

  useEffect(() => {
    if (commentsQ.isError && open) {
      toast.error(t("admin.commentsLoadFailed"));
    }
  }, [commentsQ.isError, open, t]);

  const timeline = useMemo((): TimelineItem[] => {
    if (!inquiry) return [];
    const items: TimelineItem[] = [];
    if (inquiry.message?.trim()) {
      items.push({
        key: "customer",
        kind: "customer",
        at: inquiry.created_at ?? "",
        author: t("admin.timelineCustomer"),
        plain: inquiry.message,
      });
    }
    const rows = commentsQ.data ?? [];
    for (const row of rows) {
      const author =
        row.author_label?.trim() ||
        (row.admin_id ? t("admin.timelineAdmin") : t("admin.timelineSystem"));
      items.push({
        key: row.id,
        kind: "comment",
        at: row.created_at,
        author,
        html: row.content,
        row,
      });
    }
    return items;
  }, [inquiry, commentsQ.data, t]);

  const scrollTimelineToBottom = useCallback((behavior: ScrollBehavior) => {
    timelineEndRef.current?.scrollIntoView({ block: "end", behavior });
  }, []);

  const timelineLen = timeline.length;

  useLayoutEffect(() => {
    if (!open || commentsQ.isLoading) return;
    const prevLen = prevTimelineLenRef.current;
    if (timelineLen === prevLen) return;
    prevTimelineLenRef.current = timelineLen;

    requestAnimationFrame(() => {
      scrollTimelineToBottom("smooth");
    });
  }, [open, timelineLen, commentsQ.isLoading, scrollTimelineToBottom]);

  const postMut = useMutation({
    mutationFn: (vars: { content: string; attachments: InquiryCommentAttachment[] }) => {
      if (!inquiryId) throw new Error("No inquiry");
      return postInquiryComment(inquiryId, vars);
    },
    onMutate: async (vars) => {
      if (!inquiryId) return;
      await qc.cancelQueries({ queryKey: ["inquiry-comments", inquiryId] });
      const prev = qc.getQueryData<InquiryCommentRow[]>(["inquiry-comments", inquiryId]);
      const optimistic: InquiryCommentRow = {
        id: `temp-${Date.now()}`,
        inquiry_id: inquiryId,
        admin_id: "optimistic",
        content: vars.content,
        created_at: new Date().toISOString(),
        author_label: t("admin.timelineYou"),
        attachments: vars.attachments.length ? vars.attachments : null,
      };
      qc.setQueryData<InquiryCommentRow[]>(["inquiry-comments", inquiryId], (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (inquiryId && ctx?.prev !== undefined) {
        qc.setQueryData(["inquiry-comments", inquiryId], ctx.prev);
      }
      const msg = err instanceof Error ? err.message : "";
      toast.error(t("admin.commentFailed"), { description: msg });
    },
    onSuccess: (serverRow, variables) => {
      if (!inquiryId) return;
      let row = normalizeInquiryCommentRow(serverRow);
      const sent = variables?.attachments ?? [];
      if (sent.length > 0 && !row.attachments?.length) {
        row = { ...row, attachments: sent };
      }
      qc.setQueryData<InquiryCommentRow[]>(["inquiry-comments", inquiryId], (old) => {
        const list = old ?? [];
        const idx = list.findIndex((c) => String(c.id).startsWith("temp-"));
        if (idx === -1) {
          return [...list.filter((c) => !String(c.id).startsWith("temp-")), row];
        }
        const next = [...list];
        next[idx] = row;
        return next;
      });
      for (const ac of uploadAbortByClientIdRef.current.values()) {
        ac.abort();
      }
      uploadAbortByClientIdRef.current.clear();
      setDraft("");
      setPendingUploads([]);
      toast.success(t("admin.commentPosted"));
      void qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
  });

  const patchStatusMut = useMutation({
    mutationFn: () => {
      if (!inquiryId) throw new Error("No inquiry");
      return patchInquiry(inquiryId, { status: status as "new" | "contacted" | "resolved" });
    },
    onSuccess: () => {
      toast.success(t("admin.statusSaved"));
      void qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "";
      toast.error(t("admin.statusSaveFailed"), { description: msg });
    },
  });

  const hasCompleteAttachment = pendingUploads.some((u) => u.status === "complete");
  const hasUploadingAttachment = pendingUploads.some((u) => u.status === "uploading");
  const canPostComment = !isHtmlEmpty(draft) || hasCompleteAttachment;

  const onInquiryAttachmentFilesSelected = useCallback(
    async (picked: File[]) => {
      if (!inquiryId) return;
      const files = Array.from(picked);
      const prev = pendingUploadsRef.current;
      const v = validateAttachmentPick(
        prev.map((p) => ({ size: p.status === "complete" ? p.sizeBytes : p.file.size })),
        files,
      );
      if (v.ok === false) {
        const key =
          v.error === "max_files"
            ? "admin.inquiryAttachmentErrMaxFiles"
            : v.error === "file_too_large"
              ? "admin.inquiryAttachmentErrFileTooLarge"
              : "admin.inquiryAttachmentErrTotalTooLarge";
        toast.error(t(key));
        return;
      }

      const entries = v.merged.map((file) => ({
        clientId: crypto.randomUUID(),
        file,
        abort: new AbortController(),
      }));
      for (const e of entries) {
        uploadAbortByClientIdRef.current.set(e.clientId, e.abort);
      }

      setPendingUploads((p) => [
        ...p,
        ...entries.map((e) => ({
          clientId: e.clientId,
          status: "uploading" as const,
          name: e.file.name,
          file: e.file,
        })),
      ]);

      await Promise.all(
        entries.map(async ({ clientId, file, abort }) => {
          try {
            const { path } = await uploadInquiryAttachment(file, inquiryId, { signal: abort.signal });
            setPendingUploads((list) => {
              const stillUploading = list.some((u) => u.clientId === clientId && u.status === "uploading");
              if (!stillUploading) {
                void removeInquiryAttachmentsFromStorage([path]).catch(() => {});
                return list;
              }
              return list.map((u) =>
                u.clientId === clientId && u.status === "uploading"
                  ? {
                      clientId,
                      status: "complete" as const,
                      name: file.name,
                      path,
                      type: file.type || "application/octet-stream",
                      sizeBytes: file.size,
                    }
                  : u,
              );
            });
          } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") return;
            const msg = err instanceof Error ? err.message : "";
            toast.error(t("admin.inquiryAttachmentUploadBatchFailed"), { description: msg });
            setPendingUploads((list) => list.filter((u) => u.clientId !== clientId));
          } finally {
            uploadAbortByClientIdRef.current.delete(clientId);
          }
        }),
      );
    },
    [inquiryId, t],
  );

  const removePendingUpload = useCallback(
    async (clientId: string) => {
      const row = pendingUploadsRef.current.find((u) => u.clientId === clientId);
      const ac = uploadAbortByClientIdRef.current.get(clientId);
      ac?.abort();
      uploadAbortByClientIdRef.current.delete(clientId);
      setPendingUploads((prev) => prev.filter((u) => u.clientId !== clientId));
      if (row?.status === "complete") {
        try {
          await removeInquiryAttachmentsFromStorage([row.path]);
        } catch {
          toast.error(t("admin.inquiryAttachmentDeleteFailed"));
        }
      }
    },
    [t],
  );

  const copyPlain = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("admin.copied"));
    } catch {
      toast.error(t("admin.commentFailed"));
    }
  };

  if (!inquiry) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (import.meta.env.DEV && !next) {
          console.log(
            "Modal Closing Triggered by:",
            "Radix Dialog.Root onOpenChange(false)",
            new Error().stack,
          );
        }
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <div className="fixed left-1/2 top-1/2 z-[101] flex w-[min(96vw,920px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 outline-none">
            <motion.div
              className="flex max-h-[90vh] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-elev3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <Dialog.Title className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                  {t("admin.inquiry")}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  {t("admin.inquiry")} — {inquiry.name}
                </Dialog.Description>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                    aria-label={t("admin.close")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </header>

              <div className="flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
                <aside
                  className={cn(
                    "shrink-0 space-y-4 border-b border-slate-200 px-5 py-4 md:flex md:max-w-sm md:flex-col md:border-b-0 md:border-r md:border-slate-200 dark:border-white/10",
                    "bg-slate-50/90 dark:bg-zinc-900/40",
                    "md:overflow-y-auto md:scrollbar-inquiry",
                    "max-md:sticky max-md:top-0 max-md:z-[5] max-md:border-b max-md:backdrop-blur-md max-md:supports-[backdrop-filter]:bg-slate-50/85 max-md:dark:supports-[backdrop-filter]:bg-zinc-900/80",
                  )}
                >
                  <div className="space-y-1 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                      {t("admin.from")}
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-zinc-100">{inquiry.name}</p>
                    <a className="text-primary hover:underline" href={`mailto:${inquiry.email}`}>
                      {inquiry.email}
                    </a>
                    {inquiry.phone ? (
                      <p className="text-slate-600 dark:text-zinc-400">{inquiry.phone}</p>
                    ) : null}
                  </div>
                  <Separator className="bg-slate-200 dark:bg-white/10" />
                  <div className="text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                      {t("admin.trip")}
                    </p>
                    <p className="mt-1 text-slate-800 dark:text-zinc-200">{inquiry.trips?.title ?? "—"}</p>
                  </div>
                  <Separator className="hidden bg-slate-200 md:block dark:bg-white/10" />
                  <div className="space-y-3 md:mt-auto">
                    <div className="space-y-2">
                      <Label htmlFor="inq-modal-status">{t("admin.status")}</Label>
                      <select
                        id="inq-modal-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {inquiryStatusLabel(s, t)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-slate-200 dark:border-white/15"
                      disabled={patchStatusMut.isPending}
                      onClick={() => patchStatusMut.mutate()}
                    >
                      {patchStatusMut.isPending ? t("admin.saving") : t("admin.saveStatus")}
                    </Button>
                  </div>
                </aside>

                <motion.div
                  key={inquiryId ?? "none"}
                  className="flex min-h-[220px] flex-1 flex-col bg-white dark:bg-zinc-950/35 md:min-h-0"
                  initial={{ opacity: 0, x: 24 }}
                  animate={open ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2
                    id="inq-timeline-heading"
                    className="shrink-0 border-b border-slate-100 px-4 py-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-white/5 dark:text-zinc-400"
                  >
                    {t("admin.activityFeed")}
                  </h2>
                  <div
                    ref={timelineScrollRef}
                    className={cn(
                      "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3",
                      "scrollbar-inquiry",
                    )}
                    role="region"
                    aria-labelledby="inq-timeline-heading"
                  >
                    {commentsQ.isLoading ? (
                      <p className="text-slate-500 dark:text-zinc-400">…</p>
                    ) : timeline.length === 0 ? (
                      <p className="text-center text-sm text-slate-500 dark:text-zinc-400">—</p>
                    ) : (
                      <ul className="flex flex-col gap-4">
                        {timeline.map((item) => {
                          const customer = isCustomerBubble(item);
                          const safeHtml =
                            item.kind === "comment" ? sanitizeInquiryHtml(item.html) : "";
                          const legacyPreviewUrls =
                            item.kind === "comment" ? extractImageUrlsFromHtml(item.html) : [];
                          const hasCommentText =
                            item.kind === "comment" &&
                            (!isHtmlEmpty(item.html) || legacyPreviewUrls.length > 0);
                          const commentAttachments =
                            item.kind === "comment" && item.row.attachments && item.row.attachments.length > 0
                              ? item.row.attachments
                              : null;
                          const showPosted =
                            item.kind === "comment" && !String(item.row.id).startsWith("temp-");
                          const isSending =
                            item.kind === "comment" && String(item.row.id).startsWith("temp-");
                          return (
                            <li
                              key={item.key}
                              className={cn("flex w-full", customer ? "justify-start" : "justify-end")}
                            >
                              <div
                                className={cn(
                                  "max-w-[min(100%,22rem)] sm:max-w-[min(100%,26rem)]",
                                  customer
                                    ? "rounded-2xl rounded-tl-md border border-slate-200/80 bg-slate-100 px-3.5 py-2.5 dark:border-white/10 dark:bg-zinc-800/80"
                                    : "rounded-2xl rounded-tr-md border border-primary/25 bg-primary/10 px-3.5 py-2.5 dark:border-primary/30 dark:bg-primary/15",
                                )}
                              >
                                <div
                                  className={cn(
                                    "mb-1.5 flex items-start justify-between gap-2",
                                    customer ? "flex-row" : "flex-row-reverse",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "flex min-w-0 flex-1 flex-col gap-0.5",
                                      customer ? "items-start text-left" : "items-end text-right",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "text-[11px] font-semibold uppercase tracking-wide",
                                        customer
                                          ? "text-slate-600 dark:text-zinc-400"
                                          : "text-primary dark:text-primary",
                                      )}
                                    >
                                      {customer ? t("admin.timelineCustomer") : item.author}
                                    </span>
                                    <span
                                      className="text-[10px] text-slate-500 dark:text-zinc-500"
                                      title={formatAbsoluteDateTime(item.at, lang)}
                                    >
                                      {formatRelativeTime(item.at, lang)}
                                    </span>
                                  </div>
                                  <div
                                    className={cn(
                                      "flex shrink-0 items-center gap-0.5",
                                      customer ? "" : "flex-row-reverse",
                                    )}
                                  >
                                    {!customer && isSending ? (
                                      <Loader2
                                        className="h-3.5 w-3.5 shrink-0 animate-spin text-primary/80"
                                        aria-hidden
                                      />
                                    ) : null}
                                    {!customer && showPosted ? (
                                      <span
                                        className="inline-flex"
                                        title={t("admin.commentPosted")}
                                        aria-label={t("admin.commentPosted")}
                                      >
                                        <CheckCheck
                                          className="h-3.5 w-3.5 text-primary/70 dark:text-primary/80"
                                          aria-hidden
                                        />
                                      </span>
                                    ) : null}
                                    <button
                                      type="button"
                                      className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-200/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                                      aria-label={t("admin.copyMessage")}
                                      onClick={() =>
                                        void copyPlain(
                                          item.kind === "customer"
                                            ? item.plain
                                            : inquiryHtmlToPlainText(item.html),
                                        )
                                      }
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                {item.kind === "customer" ? (
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-zinc-100">
                                    {item.plain}
                                  </p>
                                ) : (
                                  <div className="flex min-w-0 flex-col">
                                    {legacyPreviewUrls.length > 0 ? (
                                      <div
                                        className={cn(
                                          "mb-2 flex flex-wrap gap-2",
                                          customer ? "justify-start" : "justify-end",
                                        )}
                                      >
                                        {legacyPreviewUrls.slice(0, 4).map((src) => (
                                          <a
                                            key={src}
                                            href={src}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block overflow-hidden rounded-lg border border-slate-200/90 dark:border-white/10"
                                          >
                                            <img
                                              src={src}
                                              alt=""
                                              className="max-h-24 max-w-[7.5rem] object-cover"
                                              loading="lazy"
                                            />
                                          </a>
                                        ))}
                                      </div>
                                    ) : null}
                                    <InquiryTimelineHtml
                                      html={safeHtml}
                                      className={cn(
                                        "inquiry-timeline-prose-extras prose prose-sm max-w-none min-w-0 text-left text-sm leading-relaxed text-slate-800 dark:prose-invert dark:text-zinc-100",
                                        "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
                                        "prose-a:text-indigo-600 prose-a:underline prose-a:decoration-indigo-600/80 dark:prose-a:text-indigo-300",
                                      )}
                                      onClick={(e) => {
                                        const el = (e.target as HTMLElement).closest("a");
                                        if (!el) return;
                                        const href = el.getAttribute("href");
                                        if (!href || !href.startsWith("/admin")) return;
                                        e.preventDefault();
                                        navigate(href);
                                        onOpenChange(false);
                                      }}
                                    />
                                    {commentAttachments ? (
                                      <>
                                        {hasCommentText ? (
                                          <div
                                            className="mt-2 shrink-0 border-t border-slate-200/80 pt-2 dark:border-white/10"
                                            role="separator"
                                          />
                                        ) : null}
                                        <InquiryCommentAttachmentGallery
                                          attachments={commentAttachments}
                                          t={t}
                                          alignEnd={!customer}
                                          className={hasCommentText ? "mt-0" : undefined}
                                        />
                                      </>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <div ref={timelineEndRef} className="h-px w-full shrink-0" aria-hidden />
                  </div>
                </motion.div>
              </div>

              <footer className="relative z-10 shrink-0 space-y-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-zinc-950">
                <p className="text-sm font-medium leading-none text-slate-900 dark:text-zinc-100">
                  {t("admin.postComment")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickInserts.map((q) => (
                    <Button
                      key={q.label}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 border border-slate-200 bg-white text-xs font-normal text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      onClick={() =>
                        editorRef.current?.insertContent(`<p>${escapeForHtml(q.text)}</p>`)
                      }
                    >
                      {q.label}
                    </Button>
                  ))}
                </div>
                <RichTextEditor
                  ref={editorRef}
                  value={draft}
                  onChange={setDraft}
                  placeholder={t("admin.commentPlaceholder")}
                  variant="minimal"
                  t={t}
                  attachmentContext={inquiryId ? { inquiryId } : null}
                  onInquiryAttachmentFilesSelected={onInquiryAttachmentFilesSelected}
                  attachmentPickerDisabled={
                    postMut.isPending || pendingUploads.length >= INQUIRY_ATTACHMENT_MAX_FILES
                  }
                  aria-label={t("admin.postComment")}
                />
                {pendingUploads.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                      {t("admin.inquiryAttachmentPendingLabel")}
                    </p>
                    <ul className="flex flex-wrap gap-2" aria-label={t("admin.inquiryAttachmentPendingLabel")}>
                      {pendingUploads.map((u) => (
                        <li
                          key={u.clientId}
                          className="flex max-w-[min(100%,14rem)] shrink-0 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-2.5 py-2 shadow-sm dark:border-white/10 dark:bg-zinc-900/90"
                        >
                          {u.status === "uploading" ? (
                            <Loader2
                              className="h-4 w-4 shrink-0 animate-spin text-primary"
                              aria-hidden
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-xs font-medium text-slate-800 dark:text-zinc-100"
                              title={u.name}
                            >
                              {u.name}
                            </p>
                            {u.status === "uploading" ? (
                              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                                {t("admin.inquiryAttachmentUploading")}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="shrink-0 rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                            aria-label={t("admin.inquiryAttachmentRemove")}
                            onClick={() => void removePendingUpload(u.clientId)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <Button
                  type="button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={postMut.isPending || !canPostComment || hasUploadingAttachment}
                  onClick={() => {
                    if (!inquiry || !canPostComment || hasUploadingAttachment) return;
                    postMut.mutate({
                      content: draft,
                      attachments: pendingUploads
                        .filter((u): u is Extract<PendingUpload, { status: "complete" }> => u.status === "complete")
                        .map(({ name, path, type }) => ({ name, path, type })),
                    });
                  }}
                >
                  {postMut.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      {t("admin.postingComment")}
                    </>
                  ) : (
                    t("admin.postComment")
                  )}
                </Button>
              </footer>
            </motion.div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
