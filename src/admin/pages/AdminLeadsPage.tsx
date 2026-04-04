import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { AdminInquiryRow } from "@/types/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InquiryDetailSheet } from "@/admin/components/InquiryDetailSheet";

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
  });

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">{t("admin.leadsSubtitle")}</p>

      <Card className="border-violet-500/15">
        <CardHeader>
          <CardTitle className="text-base">{t("admin.inbox")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {q.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            (q.data ?? []).map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => {
                  setSelected(row);
                  setOpen(true);
                }}
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-violet-500/15 bg-card px-4 py-3 text-left transition-colors hover:border-violet-500/35 hover:bg-violet-950/20"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.status ? (
                    <Badge className="capitalize border-violet-500/25 bg-violet-950/40">{String(row.status)}</Badge>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : ""}
                  </span>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <InquiryDetailSheet
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
