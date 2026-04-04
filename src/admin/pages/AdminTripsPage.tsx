import { useEffect, useMemo, useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { patchTripFeatured, putTrip } from "@/lib/adminApi";
import { buildTripMetricsMap } from "@/admin/lib/tripMetrics";
import type { AdminTripViewRow } from "@/types/admin";
import type { Lang } from "@/contexts/LanguageContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { TripImageDropzone } from "@/admin/components/TripImageDropzone";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function tripId(row: AdminTripViewRow) {
  return String(row.id ?? row.trip_id ?? "");
}

function titleOf(row: AdminTripViewRow, lang: Lang, untitled: string) {
  if (lang === "gr") {
    const s = row.title_el ?? row.title ?? row.name;
    return s != null && String(s).trim() ? String(s) : untitled;
  }
  const s = row.title ?? row.title_el ?? row.name;
  return s != null && String(s).trim() ? String(s) : untitled;
}

function asHtml(v: unknown): string {
  return typeof v === "string" ? v : "";
}

async function fetchAdminTripsWithMetrics(): Promise<AdminTripViewRow[]> {
  const { data: trips, error: tripsError } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });
  if (tripsError) throw tripsError;
  const list = trips ?? [];
  if (list.length === 0) return [];

  const ids = list.map((t) => t.id).filter((id): id is string => id != null && String(id).length > 0);
  const { data: axRows, error: axError } = await supabase
    .from("analytics_events")
    .select("*")
    .in("trip_id", ids);

  if (axError) {
    console.warn("[admin] analytics_events:", axError.message);
    return list.map((row) => ({
      ...row,
      click_count: 0,
      inquiry_count: 0,
    })) as AdminTripViewRow[];
  }

  const metrics = buildTripMetricsMap(axRows ?? []);
  return list.map((row) => {
    const id = String(row.id);
    const m = metrics.get(id) ?? { click_count: 0, inquiry_count: 0 };
    return {
      ...row,
      click_count: m.click_count,
      inquiry_count: m.inquiry_count,
    } as AdminTripViewRow;
  });
}

export default function AdminTripsPage() {
  const qc = useQueryClient();
  const { t, lang } = useLanguage();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-trips"],
    queryFn: fetchAdminTripsWithMetrics,
  });

  const featuredMut = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => patchTripFeatured(id, next),
    onMutate: async ({ id, next }) => {
      await qc.cancelQueries({ queryKey: ["admin-trips"] });
      const prev = qc.getQueryData<AdminTripViewRow[]>(["admin-trips"]);
      qc.setQueryData<AdminTripViewRow[]>(["admin-trips"], (old) =>
        (old ?? []).map((r) => (tripId(r) === id ? { ...r, is_featured: next } : r)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["admin-trips"], ctx.prev);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["admin-trips"] });
    },
  });

  const featuredPendingId =
    featuredMut.isPending && featuredMut.variables ? featuredMut.variables.id : null;

  const [editId, setEditId] = useState<string | null>(null);
  const columnHelper = createColumnHelper<AdminTripViewRow>();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "thumb",
        header: "",
        cell: ({ row }) => {
          const img = row.original.image as string | null | undefined;
          return img ? (
            <img src={img} alt="" className="h-12 w-20 rounded-lg object-cover" />
          ) : (
            <div className="h-12 w-20 rounded-lg bg-muted" />
          );
        },
      }),
      columnHelper.accessor((r) => titleOf(r, lang, t("admin.untitled")), {
        id: "title",
        header: t("admin.name"),
        cell: (i) => <span className="font-medium">{i.getValue()}</span>,
      }),
      columnHelper.accessor((r) => Number(r.click_count ?? 0), {
        id: "clicks",
        header: t("admin.clicks"),
        cell: (i) => <span className="tabular-nums">{i.getValue()}</span>,
      }),
      columnHelper.accessor((r) => Number(r.inquiry_count ?? 0), {
        id: "subs",
        header: t("admin.forms"),
        cell: (i) => <span className="tabular-nums">{i.getValue()}</span>,
      }),
      columnHelper.accessor((r) => Boolean(r.is_featured), {
        id: "feat",
        header: t("admin.featured"),
        cell: ({ row }) => {
          const id = tripId(row.original);
          const busy = featuredPendingId === id;
          return (
            <Switch
              checked={Boolean(row.original.is_featured)}
              disabled={busy}
              onCheckedChange={(v) => featuredMut.mutate({ id, next: v })}
            />
          );
        },
      }),
      columnHelper.display({
        id: "act",
        header: "",
        cell: ({ row }) => (
          <Button type="button" variant="outline" size="sm" onClick={() => setEditId(tripId(row.original))}>
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    [columnHelper, t, lang, featuredPendingId, featuredMut],
  );

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">{t("admin.tripsSubtitle")}</p>
      <Card className="border-violet-500/15">
        <CardHeader>
          <CardTitle className="text-base">{t("admin.catalog")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border text-left text-muted-foreground">
                    {hg.headers.map((h) => (
                      <th key={h.id} className="pb-3 pr-4 font-medium">
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 pr-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {editId ? <TripEditDialog tripId={editId} open onClose={() => setEditId(null)} /> : null}
    </div>
  );
}

function TripEditDialog({ tripId, open, onClose }: { tripId: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const { t } = useLanguage();
  const q = useQuery({
    queryKey: ["admin-trip", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: open && !!tripId,
  });

  const [title, setTitle] = useState("");
  const [titleEl, setTitleEl] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [descEl, setDescEl] = useState("");
  const [prog, setProg] = useState("");
  const [progEl, setProgEl] = useState("");
  const [inc, setInc] = useState("");
  const [incEl, setIncEl] = useState("");

  useEffect(() => {
    const row = q.data;
    if (!row) return;
    setTitle(String(row.title ?? ""));
    setTitleEl(String(row.title_el ?? ""));
    setImage((row.image as string | null) ?? null);
    setDesc(asHtml(row.description));
    setDescEl(asHtml(row.description_el));
    setProg(asHtml(row.program));
    setProgEl(asHtml(row.program_el));
    setInc(asHtml(row.included));
    setIncEl(asHtml(row.included_el));
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      await putTrip(tripId, {
        title,
        title_el: titleEl || null,
        image,
        description: desc,
        description_el: descEl || null,
        program: prog,
        program_el: progEl || null,
        included: inc,
        included_el: incEl || null,
      });
    },
    onSuccess: () => {
      toast.success(t("admin.tripSaved"));
      void qc.invalidateQueries({ queryKey: ["admin-trips"] });
      void qc.invalidateQueries({ queryKey: ["admin-trip", tripId] });
      onClose();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t("admin.tripSaveFailed"), { description: msg });
    },
  });

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-violet-500/20 bg-background p-6 shadow-elev3">
          <Dialog.Title className="text-lg font-semibold">{t("admin.editTrip")}</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground">{t("admin.editTripDesc")}</Dialog.Description>
          {q.isLoading ? (
            <Skeleton className="mt-4 h-40 w-full" />
          ) : (
            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("admin.titleEn")}</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.titleEl")}</Label>
                  <Input value={titleEl} onChange={(e) => setTitleEl(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.heroImage")}</Label>
                <TripImageDropzone value={image} onChange={setImage} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.descriptionEn")}</Label>
                <RichTextEditor value={desc} onChange={setDesc} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.descriptionEl")}</Label>
                <RichTextEditor value={descEl} onChange={setDescEl} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.programEn")}</Label>
                <RichTextEditor value={prog} onChange={setProg} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.programEl")}</Label>
                <RichTextEditor value={progEl} onChange={setProgEl} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.includedEn")}</Label>
                <RichTextEditor value={inc} onChange={setInc} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.includedEl")}</Label>
                <RichTextEditor value={incEl} onChange={setIncEl} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("admin.cancel")}
                </Button>
                <Button
                  type="button"
                  className="bg-violet-600 text-white hover:bg-violet-500"
                  disabled={save.isPending}
                  onClick={() => save.mutate()}
                >
                  {save.isPending ? t("admin.saving") : t("admin.save")}
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
