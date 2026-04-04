import { useEffect, useMemo, useState } from "react";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Pencil } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { patchTripFeatured, putTrip } from "@/lib/adminApi";
import type { AdminTripViewRow } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { TripImageDropzone } from "@/admin/components/TripImageDropzone";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function tripId(row: AdminTripViewRow) { return String(row.id ?? row.trip_id ?? ""); }
function titleOf(row: AdminTripViewRow) { return String(row.title ?? row.name ?? "Untitled"); }
function asHtml(v: unknown): string { return typeof v === "string" ? v : ""; }

export default function AdminTripsPage() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin-trips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_trips_view").select("*");
      if (error) throw error;
      return (data ?? []) as AdminTripViewRow[];
    },
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
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["admin-trips"], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["admin-trips"] }),
  });
  const [editId, setEditId] = useState<string | null>(null);
  const columnHelper = createColumnHelper<AdminTripViewRow>();
  const columns = useMemo(() => [
    columnHelper.display({ id: "thumb", header: "", cell: ({ row }) => {
      const img = row.original.image as string | null | undefined;
      return img ? <img src={img} alt="" className="h-12 w-20 rounded-lg object-cover" /> : <div className="h-12 w-20 rounded-lg bg-muted" />;
    }}),
    columnHelper.accessor((r) => titleOf(r), { id: "title", header: "Name", cell: (i) => <span className="font-medium">{i.getValue()}</span> }),
    columnHelper.accessor((r) => Number(r.click_count ?? 0), { id: "clicks", header: "Clicks", cell: (i) => <span className="tabular-nums">{i.getValue()}</span> }),
    columnHelper.accessor((r) => Number(r.inquiry_count ?? 0), { id: "subs", header: "Forms", cell: (i) => <span className="tabular-nums">{i.getValue()}</span> }),
    columnHelper.accessor((r) => Boolean(r.is_featured), { id: "feat", header: "Featured", cell: ({ row }) => {
      const id = tripId(row.original);
      return <Switch checked={Boolean(row.original.is_featured)} disabled={featuredMut.isPending} onCheckedChange={(v) => featuredMut.mutate({ id, next: v })} />;
    }}),
    columnHelper.display({ id: "act", header: "", cell: ({ row }) => (
      <Button type="button" variant="outline" size="sm" onClick={() => setEditId(tripId(row.original))}><Pencil className="h-4 w-4" /></Button>
    )}),
  ], [columnHelper, featuredMut]);
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-semibold tracking-tight">Trips</h1><p className="text-sm text-muted-foreground">Manage listings and analytics.</p></div>
      <Card><CardHeader><CardTitle className="text-base">Catalog</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">{isLoading ? <Skeleton className="h-64 w-full" /> : (
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>{table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border text-left text-muted-foreground">
              {hg.headers.map((h) => (<th key={h.id} className="pb-3 pr-4 font-medium">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</th>))}
            </tr>))}</thead>
          <tbody>{table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60">{row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="py-3 pr-4 align-middle">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}</tr>
          ))}</tbody>
        </table>
      )}</CardContent></Card>
      {editId ? <TripEditDialog tripId={editId} open onClose={() => setEditId(null)} /> : null}
    </div>
  );
}

function TripEditDialog({ tripId, open, onClose }: { tripId: string; open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-trip", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: open && !!tripId,
  });
  const [title, setTitle] = useState(""); const [titleEl, setTitleEl] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [desc, setDesc] = useState(""); const [descEl, setDescEl] = useState("");
  const [prog, setProg] = useState(""); const [progEl, setProgEl] = useState("");
  const [inc, setInc] = useState(""); const [incEl, setIncEl] = useState("");
  useEffect(() => {
    const t = q.data; if (!t) return;
    setTitle(String(t.title ?? "")); setTitleEl(String(t.title_el ?? ""));
    setImage((t.image as string | null) ?? null);
    setDesc(asHtml(t.description)); setDescEl(asHtml(t.description_el));
    setProg(asHtml(t.program)); setProgEl(asHtml(t.program_el));
    setInc(asHtml(t.included)); setIncEl(asHtml(t.included_el));
  }, [q.data]);
  const save = useMutation({
    mutationFn: async () => {
      await putTrip(tripId, { title, title_el: titleEl || null, image, description: desc, description_el: descEl || null, program: prog, program_el: progEl || null, included: inc, included_el: incEl || null });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-trips"] }); qc.invalidateQueries({ queryKey: ["admin-trip", tripId] }); onClose(); },
  });
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}><Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-elev3">
        <Dialog.Title className="text-lg font-semibold">Edit trip</Dialog.Title>
        <Dialog.Description className="text-sm text-muted-foreground">HTML fields.</Dialog.Description>
        {q.isLoading ? <Skeleton className="mt-4 h-40 w-full" /> : (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Title EL</Label><Input value={titleEl} onChange={(e) => setTitleEl(e.target.value)} /></div></div>
            <div className="space-y-2"><Label>Hero image</Label><TripImageDropzone value={image} onChange={setImage} /></div>
            <div className="space-y-2"><Label>Description</Label><RichTextEditor value={desc} onChange={setDesc} /></div>
            <div className="space-y-2"><Label>Description EL</Label><RichTextEditor value={descEl} onChange={setDescEl} /></div>
            <div className="space-y-2"><Label>Program</Label><RichTextEditor value={prog} onChange={setProg} /></div>
            <div className="space-y-2"><Label>Program EL</Label><RichTextEditor value={progEl} onChange={setProgEl} /></div>
            <div className="space-y-2"><Label>Included</Label><RichTextEditor value={inc} onChange={setInc} /></div>
            <div className="space-y-2"><Label>Included EL</Label><RichTextEditor value={incEl} onChange={setIncEl} /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving…" : "Save"}</Button></div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Portal></Dialog.Root>
  );
}
