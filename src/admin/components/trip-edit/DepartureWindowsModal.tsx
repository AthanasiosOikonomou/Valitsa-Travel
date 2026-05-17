import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { DepartureWindowFormRow } from "@/lib/tripAdminForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnsavedCloseAlert } from "@/admin/components/UnsavedCloseAlert";
import { useUnsavedDialogClose } from "@/admin/hooks/useUnsavedDialogClose";
import { cn, scrollContainerToAlignChildTop } from "@/lib/utils";
import { isValidDayForMonth } from "@/lib/departureWindows";
import { DepartureDayPickerPure } from "./DepartureDayPickerPure";

function emptyRow(): DepartureWindowFormRow {
  return { month: 1, days: [], label_en: "", label_el: "" };
}

export function DepartureWindowsModal({
  open,
  onOpenChange,
  rows,
  onSave,
  t,
  lang,
  tripInputClass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: DepartureWindowFormRow[];
  onSave: (rows: DepartureWindowFormRow[]) => void;
  t: (key: string) => string;
  lang: "gr" | "en";
  tripInputClass: string;
}) {
  const [draft, setDraft] = useState<DepartureWindowFormRow[]>([]);
  const snapshotRef = useRef<string>("");
  const departureScrollBodyRef = useRef<HTMLDivElement>(null);
  const lastAddedRowCardRef = useRef<HTMLDivElement | null>(null);
  const scrollToEndAfterAddRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    const init = structuredClone(rows);
    setDraft(init);
    snapshotRef.current = JSON.stringify(init);
  }, [open, rows]);

  useEffect(() => {
    if (!scrollToEndAfterAddRef.current) return;
    scrollToEndAfterAddRef.current = false;
    const container = departureScrollBodyRef.current;
    const segment = lastAddedRowCardRef.current;
    if (!container || !segment) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollContainerToAlignChildTop(container, segment);
      });
    });
  }, [draft]);

  const addRow = useCallback(() => {
    scrollToEndAfterAddRef.current = true;
    setDraft((prev) => [...prev, emptyRow()]);
  }, []);

  const isDirty = JSON.stringify(draft) !== snapshotRef.current;

  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);

  const onSaveAndClose = useCallback(() => {
    onSave(draft);
  }, [draft, onSave]);

  const { handleOpenChange, tryClose, unsavedAlert } = useUnsavedDialogClose({
    isDirty,
    onClose: closeModal,
    onSaveAndClose,
  });

  const handleSave = useCallback(() => {
    onSave(draft);
  }, [draft, onSave]);

  const locale = lang === "gr" ? "el-GR" : "en-GB";

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[111] flex max-h-[min(90vh,720px)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-elev3 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100",
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5">
              <Dialog.Title className="pr-2 text-base font-semibold leading-snug sm:text-lg">
                {t("admin.tripDepartureModalTitle")}
              </Dialog.Title>
              <button
                type="button"
                className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-red-400"
                aria-label={t("admin.close")}
                onClick={tryClose}
              >
                <X className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            </div>
            <Dialog.Description className="sr-only">{t("admin.tripDepartureModalTitle")}</Dialog.Description>

            <div
              ref={departureScrollBodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5"
            >
              <div className="pb-3">
                {draft.length === 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label className="text-sm font-medium">{t("admin.tripDepartureDates")}</Label>
                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addRow}>
                      <Plus className="mr-1 h-4 w-4" />
                      {t("admin.tripDepartureAddRow")}
                    </Button>
                  </div>
                ) : (
                  <Label className="text-sm font-medium">{t("admin.tripDepartureDates")}</Label>
                )}
              </div>
              <div className="space-y-3">
                {draft.map((row, index) => (
                  <Fragment key={index}>
                  <div
                    ref={index === draft.length - 1 ? lastAddedRowCardRef : undefined}
                    className="space-y-3 rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex justify-end">
                      {draft.length > 1 ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            setDraft((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("admin.tripDepartureRemoveRow")}</span>
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`dep-modal-month-${index}`}>{t("admin.tripDepartureMonth")}</Label>
                        <select
                          id={`dep-modal-month-${index}`}
                          className={cn(
                            tripInputClass,
                            "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2",
                          )}
                          value={row.month}
                          onChange={(e) => {
                            const month = Number(e.target.value);
                            setDraft((prev) => {
                              const copy = [...prev];
                              const cur = { ...copy[index], month };
                              const days = (cur.days ?? []).filter((d) =>
                                isValidDayForMonth(month, d),
                              );
                              copy[index] = { ...cur, days };
                              return copy;
                            });
                          }}
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                            <option key={m} value={m}>
                              {new Intl.DateTimeFormat(locale, { month: "long" }).format(
                                new Date(2000, m - 1, 1),
                              )}
                            </option>
                          ))}
                        </select>
                      </div>
                      <DepartureDayPickerPure
                        month={row.month}
                        days={row.days}
                        onDaysChange={(next) =>
                          setDraft((prev) => {
                            const copy = [...prev];
                            copy[index] = { ...copy[index], days: next };
                            return copy;
                          })
                        }
                        daysPickLabel={t("admin.tripDepartureDaysPick")}
                      />
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`dep-modal-label-el-${index}`}>
                          {t("admin.tripDepartureLabelEl")}
                        </Label>
                        <Input
                          id={`dep-modal-label-el-${index}`}
                          className={tripInputClass}
                          value={row.label_el}
                          onChange={(e) =>
                            setDraft((prev) => {
                              const copy = [...prev];
                              copy[index] = { ...copy[index], label_el: e.target.value };
                              return copy;
                            })
                          }
                          autoComplete="off"
                          placeholder={t("admin.tripDepartureLabelOptional")}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`dep-modal-label-en-${index}`}>
                          {t("admin.tripDepartureLabelEn")}
                        </Label>
                        <Input
                          id={`dep-modal-label-en-${index}`}
                          className={tripInputClass}
                          value={row.label_en}
                          onChange={(e) =>
                            setDraft((prev) => {
                              const copy = [...prev];
                              copy[index] = { ...copy[index], label_en: e.target.value };
                              return copy;
                            })
                          }
                          autoComplete="off"
                          placeholder={t("admin.tripDepartureLabelOptional")}
                        />
                      </div>
                    </div>
                  </div>
                    {index === draft.length - 1 ? (
                      <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addRow}>
                          <Plus className="mr-1 h-4 w-4" />
                          {t("admin.tripDepartureAddRow")}
                        </Button>
                      </div>
                    ) : null}
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-zinc-950/80 sm:px-5">
              <Button type="button" variant="outline" onClick={tryClose}>
                {t("admin.tripDepartureModalCancel")}
              </Button>
              <Button type="button" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                {t("admin.tripDepartureModalSave")}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <UnsavedCloseAlert {...unsavedAlert} overlayClassName="z-[120]" />
    </>
  );
}
