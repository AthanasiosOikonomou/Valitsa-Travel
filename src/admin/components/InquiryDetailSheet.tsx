import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
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
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Inquiry</SheetTitle>
        </SheetHeader>
        {inquiry ? (
          <ScrollArea className="mt-4 h-[calc(100vh-8rem)] pr-4">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">From</p>
                <p className="font-semibold">{inquiry.name}</p>
                <a className="text-primary hover:underline" href={`mailto:${inquiry.email}`}>
                  {inquiry.email}
                </a>
                {inquiry.phone ? <p className="text-muted-foreground">{inquiry.phone}</p> : null}
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Trip</p>
                <p>{inquiry.trips?.title ?? "—"}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Message</p>
                <p className="whitespace-pre-wrap text-muted-foreground">{inquiry.message}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="inq-status">Status</Label>
                <select
                  id="inq-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Internal notes</Label>
                <RichTextEditor value={notes} onChange={setNotes} placeholder="Private notes…" />
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
