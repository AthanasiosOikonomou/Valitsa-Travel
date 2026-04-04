import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AdminInquiryRow } from "@/types/admin";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const STATUSES = ["new", "contacted", "resolved"] as const;

type Props = {
  inquiry: AdminInquiryRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InquiryDetailSheet({ inquiry, open, onOpenChange }: Props) {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("new");

  useEffect(() => {
    if (!inquiry) return;
    setNotes(inquiry.admin_notes ?? "");
    setStatus((inquiry.status as string) || "new");
  }, [inquiry]);

  const save = useMutation({
    mutationFn: async () => {
      if (!inquiry) return;
      const { error } = await supabase
        .from("inquiries")
        .update({ admin_notes: notes, status })
        .eq("id", inquiry.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
      onOpenChange(false);
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-slate-200 bg-white text-slate-900 sm:max-w-xl dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
        <SheetHeader className="border-slate-200 dark:border-white/10">
          <SheetTitle className="text-slate-900 dark:text-zinc-100">{t("admin.inquiry")}</SheetTitle>
        </SheetHeader>
        {inquiry ? (
          <ScrollArea className="mt-4 h-[calc(100vh-8rem)] pr-4">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500 dark:text-zinc-400">{t("admin.from")}</p>
                <p className="font-semibold">{inquiry.name}</p>
                <a className="text-primary hover:underline" href={`mailto:${inquiry.email}`}>
                  {inquiry.email}
                </a>
                {inquiry.phone ? (
                  <p className="text-slate-600 dark:text-zinc-400">{inquiry.phone}</p>
                ) : null}
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase text-slate-500 dark:text-zinc-400">{t("admin.trip")}</p>
                <p>{inquiry.trips?.title ?? "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase text-slate-500 dark:text-zinc-400">{t("admin.message")}</p>
                <p className="whitespace-pre-wrap text-slate-600 dark:text-zinc-400">{inquiry.message}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="inq-status">{t("admin.status")}</Label>
                <select
                  id="inq-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.internalNotes")}</Label>
                <RichTextEditor value={notes} onChange={setNotes} placeholder={t("admin.notesPlaceholder")} />
              </div>
              <Button
                type="button"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                {save.isPending ? t("admin.saving") : t("admin.save")}
              </Button>
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
