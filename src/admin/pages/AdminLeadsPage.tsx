import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import type { AdminInquiryRow } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InquiryDetailSheet } from "@/admin/components/InquiryDetailSheet";

export default function AdminLeadsPage() {
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted-foreground">Inquiries and follow-ups.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inbox</CardTitle>
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
                className="flex w-full items-center justify-between gap-4 rounded-xl border border-border/80 bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.status ? (
                    <Badge className="capitalize">{String(row.status)}</Badge>
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
