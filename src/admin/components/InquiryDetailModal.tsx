import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminInquiryRow, InquiryCommentRow } from "@/types/admin";
import {
  fetchInquiryComments,
  patchInquiry,
  postInquiryComment,
} from "@/lib/adminInquiryApi";
import { formatAbsoluteDateTime, formatRelativeTime } from "@/lib/formatRelativeTime";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { cn } from "@/lib/utils";

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

function statusLabel(s: string, t: (key: string) => string): string {
  if (s === "new") return t("admin.statusNew");
  if (s === "contacted") return t("admin.statusContacted");
  if (s === "resolved") return t("admin.statusResolved");
  return s;
}

type TimelineItem =
  | { key: string; kind: "customer"; at: string; author: string; plain: string }
  | { key: string; kind: "legacy"; at: string; author: string; html: string }
  | { key: string; kind: "comment"; at: string; author: string; html: string; row: InquiryCommentRow };

function isCustomerBubble(item: TimelineItem): boolean {
  return item.kind === "customer";
}

export function InquiryDetailModal({ inquiry, open, onOpenChange }: Props) {
  const { t, lang } = useLanguage();
  const qc = useQueryClient();
  const inquiryId = inquiry?.id ?? null;

  const [status, setStatus] = useState<string>("new");
  const [draft, setDraft] = useState("");
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const prevTimelineLenRef = useRef(0);

  useEffect(() => {
    if (!inquiry) return;
    setStatus((inquiry.status as string) || "new");
    setDraft("");
  }, [inquiry?.id, inquiry, open]);

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
  });

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
    const legacy = inquiry.admin_notes?.trim();
    if (legacy) {
      items.push({
        key: "legacy",
        kind: "legacy",
        at: inquiry.updated_at ?? inquiry.created_at ?? "",
        author: t("admin.timelineLegacy"),
        html: legacy,
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
    const el = timelineScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useLayoutEffect(() => {
    const el = timelineScrollRef.current;
    if (!el || !open) return;
    if (commentsQ.isLoading) return;

    const len = timeline.length;
    const grew = len > prevTimelineLenRef.current;
    const hadItems = prevTimelineLenRef.current > 0;
    prevTimelineLenRef.current = len;

    requestAnimationFrame(() => {
      scrollTimelineToBottom(grew && hadItems ? "smooth" : "auto");
    });
  }, [open, timeline, commentsQ.isLoading, scrollTimelineToBottom]);

  const postMut = useMutation({
    mutationFn: (html: string) => postInquiryComment(inquiry!.id, html),
    onMutate: async (html) => {
      if (!inquiryId) return;
      await qc.cancelQueries({ queryKey: ["inquiry-comments", inquiryId] });
      const prev = qc.getQueryData<InquiryCommentRow[]>(["inquiry-comments", inquiryId]);
      const optimistic: InquiryCommentRow = {
        id: `temp-${Date.now()}`,
        inquiry_id: inquiryId,
        admin_id: "optimistic",
        content: html,
        created_at: new Date().toISOString(),
        author_label: t("admin.timelineYou"),
      };
      qc.setQueryData<InquiryCommentRow[]>(["inquiry-comments", inquiryId], (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      return { prev };
    },
    onError: (err, _html, ctx) => {
      if (inquiryId && ctx?.prev !== undefined) {
        qc.setQueryData(["inquiry-comments", inquiryId], ctx.prev);
      }
      const msg = err instanceof Error ? err.message : "";
      toast.error(t("admin.commentFailed"), { description: msg });
    },
    onSuccess: (serverRow) => {
      if (!inquiryId) return;
      qc.setQueryData<InquiryCommentRow[]>(["inquiry-comments", inquiryId], (old) => {
        const list = old ?? [];
        const idx = list.findIndex((c) => String(c.id).startsWith("temp-"));
        if (idx === -1) {
          return [...list.filter((c) => !String(c.id).startsWith("temp-")), serverRow];
        }
        const next = [...list];
        next[idx] = serverRow;
        return next;
      });
      setDraft("");
      toast.success(t("admin.commentPosted"));
      void qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onSettled: () => {
      if (inquiryId) void qc.invalidateQueries({ queryKey: ["inquiry-comments", inquiryId] });
    },
  });

  const patchStatusMut = useMutation({
    mutationFn: () =>
      patchInquiry(inquiry!.id, { status: status as "new" | "contacted" | "resolved" }),
    onSuccess: () => {
      toast.success(t("admin.statusSaved"));
      void qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : "";
      toast.error(t("admin.statusSaveFailed"), { description: msg });
    },
  });

  if (!inquiry) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
                            {statusLabel(s, t)}
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
                          return (
                            <li
                              key={item.key}
                              className={cn("flex w-full", customer ? "justify-start" : "justify-end")}
                            >
                              <div
                                className={cn(
                                  "max-w-[min(100%,20rem)] sm:max-w-[min(100%,24rem)]",
                                  customer
                                    ? "rounded-2xl rounded-tl-md border border-slate-200/80 bg-slate-100 px-3.5 py-2.5 dark:border-white/10 dark:bg-zinc-800/80"
                                    : "rounded-2xl rounded-tr-md border border-primary/25 bg-primary/10 px-3.5 py-2.5 dark:border-primary/30 dark:bg-primary/15",
                                )}
                              >
                                <div
                                  className={cn(
                                    "mb-1.5 flex flex-col gap-0.5",
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
                                {item.kind === "customer" ? (
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-zinc-100">
                                    {item.plain}
                                  </p>
                                ) : (
                                  <div
                                    className={cn(
                                      "admin-prose inquiry-timeline-html max-w-none text-sm leading-relaxed text-slate-800 dark:text-zinc-100",
                                      "[&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-4",
                                    )}
                                    dangerouslySetInnerHTML={{ __html: item.html }}
                                  />
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </motion.div>
              </div>

              <footer className="relative z-10 shrink-0 space-y-3 border-t border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-zinc-950">
                <p className="text-sm font-medium leading-none text-slate-900 dark:text-zinc-100">
                  {t("admin.postComment")}
                </p>
                <RichTextEditor
                  value={draft}
                  onChange={setDraft}
                  placeholder={t("admin.commentPlaceholder")}
                  variant="minimal"
                  t={t}
                  aria-label={t("admin.postComment")}
                />
                <Button
                  type="button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={postMut.isPending || isHtmlEmpty(draft)}
                  onClick={() => {
                    if (!inquiry || isHtmlEmpty(draft)) return;
                    postMut.mutate(draft);
                  }}
                >
                  {postMut.isPending ? t("admin.postingComment") : t("admin.postComment")}
                </Button>
              </footer>
            </motion.div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
