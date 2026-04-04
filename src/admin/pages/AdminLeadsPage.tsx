import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { AdminInquiryRow } from "@/types/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InquiryDetailModal } from "@/admin/components/InquiryDetailModal";
import { inquiryStatusLabel } from "@/lib/inquiryStatusLabel";
import { cn } from "@/lib/utils";

export default function AdminLeadsPage() {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<AdminInquiryRow | null>(null);
  const [open, setOpen] = useState(false);

  const q = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, trips(id, title, image)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminInquiryRow[];
    },
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("admin.leadsSubtitle")}</p>

      <Card className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-zinc-100">{t("admin.inbox")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {q.isLoading ? (
            <Skeleton className="h-40 w-full bg-slate-200 dark:bg-zinc-800" />
          ) : (
            (q.data ?? []).map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors",
                  "hover:border-primary/30 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-800/60",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900 dark:text-zinc-100">{row.name}</p>
                  <p className="truncate text-xs text-slate-600 dark:text-zinc-400">{row.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.status?.trim() ? (
                    <Badge className="border border-primary/25 bg-primary/10 text-slate-800 dark:text-zinc-200">
                      {inquiryStatusLabel(row.status, t)}
                    </Badge>
                  ) : null}
                  <span className="text-xs text-slate-500 dark:text-zinc-500">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : ""}
                  </span>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <InquiryDetailModal
        inquiry={selected}
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setSelected(null);
        }}
      />
    </div>
  );
}
