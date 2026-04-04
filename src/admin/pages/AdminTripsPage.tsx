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
import { cn } from "@/lib/utils";

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
        header: t("admin.tripTablePhoto"),
        cell: ({ row }) => {
          const img = row.original.image as string | null | undefined;
          return (
            <div className="flex justify-center">
              {img ? (
                <img src={img} alt="" className="h-12 w-20 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-20 rounded-lg bg-muted" />
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor((r) => titleOf(r, lang, t("admin.untitled")), {
        id: "title",
        header: t("admin.name"),
        cell: (i) => (
          <span className="block break-words text-center font-medium leading-snug">{i.getValue()}</span>
        ),
      }),
      columnHelper.accessor((r) => Number(r.click_count ?? 0), {
        id: "clicks",
        header: t("admin.clicks"),
        cell: (i) => <span className="block text-center tabular-nums">{i.getValue()}</span>,
      }),
      columnHelper.accessor((r) => Number(r.inquiry_count ?? 0), {
        id: "subs",
        header: t("admin.forms"),
        cell: (i) => <span className="block text-center tabular-nums">{i.getValue()}</span>,
      }),
      columnHelper.accessor((r) => Boolean(r.is_featured), {
        id: "feat",
        header: t("admin.featured"),
        cell: ({ row }) => {
          const id = tripId(row.original);
          const busy = featuredPendingId === id;
          return (
            <div className="flex justify-center">
              <Switch
                checked={Boolean(row.original.is_featured)}
                disabled={busy}
                onCheckedChange={(v) => featuredMut.mutate({ id, next: v })}
              />
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "act",
        header: t("admin.tripTableEdit"),
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              aria-label={t("admin.tripTableEdit")}
              onClick={() => setEditId(tripId(row.original))}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      }),
    ],
    [columnHelper, t, lang, featuredPendingId, featuredMut],
  );

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600 dark:text-zinc-400">{t("admin.tripsSubtitle")}</p>
      <Card className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/90">
        <CardHeader>
          <CardTitle className="text-base text-slate-900 dark:text-zinc-100">{t("admin.catalog")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-64 w-full bg-slate-200 dark:bg-zinc-800" />
          ) : (
            <table className="w-full min-w-[760px] border-collapse text-sm text-slate-900 dark:text-zinc-100">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr
                    key={hg.id}
                    className="border-b border-slate-200 bg-slate-100 text-center text-slate-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className={cn(
                          "px-3 py-3 align-middle text-center text-sm font-medium text-slate-600 dark:text-zinc-400",
                          h.column.id === "thumb" && "w-[112px] min-w-[112px] max-w-[112px]",
                          h.column.id === "title" && "min-w-[200px] max-w-[min(28rem,40vw)]",
                          h.column.id === "clicks" && "w-24 min-w-[5.5rem]",
                          h.column.id === "subs" && "w-28 min-w-[6.5rem]",
                          h.column.id === "feat" && "w-32 min-w-[8rem]",
                          h.column.id === "act" && "w-24 min-w-[6rem]",
                        )}
                      >
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-200 transition-colors hover:bg-muted/50 dark:border-white/10"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          "px-3 py-3 align-middle text-center",
                          cell.column.id === "thumb" && "w-[112px] min-w-[112px] max-w-[112px]",
                          cell.column.id === "title" && "min-w-[200px] max-w-[min(28rem,40vw)]",
                          cell.column.id === "clicks" && "w-24 min-w-[5.5rem]",
                          cell.column.id === "subs" && "w-28 min-w-[6.5rem]",
                          cell.column.id === "feat" && "w-32 min-w-[8rem]",
                          cell.column.id === "act" && "w-24 min-w-[6rem]",
                        )}
                      >
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-elev3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
          <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            {t("admin.editTrip")}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-slate-600 dark:text-zinc-400">
            {t("admin.editTripDesc")}
          </Dialog.Description>
          {q.isLoading ? (
            <Skeleton className="mt-4 h-40 w-full bg-slate-200 dark:bg-zinc-800" />
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
                <RichTextEditor value={desc} onChange={setDesc} t={t} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.descriptionEl")}</Label>
                <RichTextEditor value={descEl} onChange={setDescEl} t={t} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.programEn")}</Label>
                <RichTextEditor value={prog} onChange={setProg} t={t} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.programEl")}</Label>
                <RichTextEditor value={progEl} onChange={setProgEl} t={t} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.includedEn")}</Label>
                <RichTextEditor value={inc} onChange={setInc} t={t} />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.includedEl")}</Label>
                <RichTextEditor value={incEl} onChange={setIncEl} t={t} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("admin.cancel")}
                </Button>
                <Button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
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
