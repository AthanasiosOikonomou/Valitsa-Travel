import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { DepartureWindowFormRow } from "@/lib/tripAdminForm";
import type { PricingSegmentFormRow } from "@/lib/tripPricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnsavedCloseAlert } from "@/admin/components/UnsavedCloseAlert";
import { useUnsavedDialogClose } from "@/admin/hooks/useUnsavedDialogClose";
import { useRegisterAdminEditingDirty } from "@/admin/context/AdminEditingContext";
import { cn, scrollContainerToAlignChildTop } from "@/lib/utils";
import {
  departureDaysUnionForMonth,
  departureMonthsWithSelectedDays,
} from "@/lib/departureWindows";

function emptyRow(): PricingSegmentFormRow {
  return {
    month: 1,
    days: [],
    departure_city: "",
    departure_city_el: "",
    hotel_en: "",
    hotel_el: "",
    duration_days: null,
    price_double: null,
    price_single: null,
    price_triple: null,
    price_child: null,
  };
}

function clampPricingRowToDepartures(
  row: PricingSegmentFormRow,
  departureWindows: DepartureWindowFormRow[],
): PricingSegmentFormRow {
  const months = departureMonthsWithSelectedDays(departureWindows);
  if (months.length === 0) return row;
  let month = row.month;
  if (!months.includes(month)) month = months[0];
  const union = new Set(departureDaysUnionForMonth(departureWindows, month));
  if (union.size === 0) return { ...row, month, days: [] };
  const filtered = row.days.filter((d) => union.has(d));
  return { ...row, month, days: filtered };
}

function emptyRowFromDepartures(departureWindows: DepartureWindowFormRow[]): PricingSegmentFormRow {
  const base = emptyRow();
  const months = departureMonthsWithSelectedDays(departureWindows);
  if (months.length === 0) return base;
  return { ...base, month: months[0], days: [] };
}

export function PricingSegmentsModal({
  open,
  onOpenChange,
  rows,
  departureWindows,
  onSave,
  t,
  lang,
  tripInputClass,
  hasEnglish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: PricingSegmentFormRow[];
  departureWindows: DepartureWindowFormRow[];
  onSave: (rows: PricingSegmentFormRow[]) => void;
  t: (key: string) => string;
  lang: "gr" | "en";
  tripInputClass: string;
  hasEnglish: boolean;
}) {
  const [draft, setDraft] = useState<PricingSegmentFormRow[]>([]);
  const snapshotRef = useRef<string>("");
  const pricingScrollBodyRef = useRef<HTMLDivElement>(null);
  const lastAddedRowCardRef = useRef<HTMLDivElement | null>(null);
  const scrollToEndAfterAddRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    const init = structuredClone(rows).map((r) => clampPricingRowToDepartures(r, departureWindows));
    setDraft(init);
    snapshotRef.current = JSON.stringify(init);
  }, [open, rows, departureWindows]);

  useEffect(() => {
    if (!scrollToEndAfterAddRef.current) return;
    scrollToEndAfterAddRef.current = false;
    const container = pricingScrollBodyRef.current;
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
    setDraft((prev) => [...prev, emptyRowFromDepartures(departureWindows)]);
  }, [departureWindows]);

  const isDirty = JSON.stringify(draft) !== snapshotRef.current;
  useRegisterAdminEditingDirty(open && isDirty);

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
  const allowedMonths = departureMonthsWithSelectedDays(departureWindows);
  const canAddPricing = allowedMonths.length > 0;

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[112] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[113] flex max-h-[min(90vh,800px)] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-elev3 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100",
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5">
              <Dialog.Title className="pr-2 text-base font-semibold leading-snug sm:text-lg">
                {t("admin.tripPricingModalTitle")}
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
            <Dialog.Description className="sr-only">{t("admin.tripPricingModalTitle")}</Dialog.Description>

            <div
              ref={pricingScrollBodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5"
            >
              <p className="pb-3 text-xs text-slate-600 dark:text-zinc-400">{t("admin.tripPricingSegmentsHint")}</p>
              {canAddPricing ? (
                <p className="pb-2 text-xs text-slate-600 dark:text-zinc-400">
                  {t("admin.tripPricingOnlyDeparturesHint")}
                </p>
              ) : (
                <p className="pb-2 text-sm text-amber-800 dark:text-amber-200/90">
                  {t("admin.tripPricingNeedDeparturesFirst")}
                </p>
              )}
              {draft.length === 0 ? (
                <div className="flex flex-wrap items-center justify-end gap-2 pb-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={!canAddPricing}
                    onClick={addRow}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t("admin.tripPricingSegmentAdd")}
                  </Button>
                </div>
              ) : null}
              {draft.length === 0 ? (
                <p className="pb-2 text-sm text-slate-600 dark:text-zinc-400">{t("admin.tripPricingSegmentsEmpty")}</p>
              ) : null}
              <div className="space-y-3">
                {draft.map((row, index) => {
                  const unionDaysForMonth = departureDaysUnionForMonth(departureWindows, row.month);
                  const monthSelectValue = allowedMonths.includes(row.month)
                    ? row.month
                    : allowedMonths[0] ?? row.month;

                  return (
                  <Fragment key={index}>
                  <div
                    ref={index === draft.length - 1 ? lastAddedRowCardRef : undefined}
                    className="space-y-3 rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDraft((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t("admin.tripPricingSegmentRemove")}</span>
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`ps-modal-month-${index}`}>{t("admin.tripDepartureMonth")}</Label>
                        {allowedMonths.length === 0 ? (
                          <select
                            id={`ps-modal-month-${index}`}
                            className={cn(
                              tripInputClass,
                              "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 opacity-80",
                            )}
                            disabled
                            value={monthSelectValue}
                          >
                            <option value={monthSelectValue}>
                              {new Intl.DateTimeFormat(locale, { month: "long" }).format(
                                new Date(2000, monthSelectValue - 1, 1),
                              )}
                            </option>
                          </select>
                        ) : (
                          <select
                            id={`ps-modal-month-${index}`}
                            className={cn(
                              tripInputClass,
                              "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2",
                            )}
                            value={monthSelectValue}
                            disabled={!canAddPricing}
                            onChange={(e) => {
                              const month = Number(e.target.value);
                              setDraft((prev) => {
                                const copy = [...prev];
                                copy[index] = {
                                  ...copy[index],
                                  month,
                                  days: [],
                                };
                                return copy;
                              });
                            }}
                          >
                            {allowedMonths.map((m) => (
                              <option key={m} value={m}>
                                {new Intl.DateTimeFormat(locale, { month: "long" }).format(
                                  new Date(2000, m - 1, 1),
                                )}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      {unionDaysForMonth.length > 0 ? (
                        <div className="space-y-2 sm:col-span-2">
                          <Label>{t("admin.tripDepartureDaysPick")}</Label>
                          <p className="text-xs text-slate-500 dark:text-zinc-500">
                            {t("admin.tripPricingDaysMultiHint")}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {unionDaysForMonth.map((day) => {
                              const selected = row.days.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  className={cn(
                                    "min-h-9 min-w-9 rounded-md border text-xs font-medium transition-colors",
                                    selected
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-background hover:bg-muted",
                                  )}
                                  onClick={() => {
                                    setDraft((prev) => {
                                      const copy = [...prev];
                                      const cur = { ...copy[index] };
                                      const next = new Set(cur.days);
                                      if (next.has(day)) next.delete(day);
                                      else next.add(day);
                                      cur.days = [...next].sort((a, b) => a - b);
                                      copy[index] = cur;
                                      return copy;
                                    });
                                  }}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`ps-modal-dc-el-${index}`}>{t("admin.tripDepartureCityEl")}</Label>
                        <Input
                          id={`ps-modal-dc-el-${index}`}
                          className={tripInputClass}
                          value={row.departure_city_el}
                          onChange={(e) =>
                            setDraft((prev) => {
                              const copy = [...prev];
                              copy[index] = { ...copy[index], departure_city_el: e.target.value };
                              return copy;
                            })
                          }
                          autoComplete="off"
                        />
                      </div>
                      {hasEnglish ? (
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor={`ps-modal-dc-en-${index}`}>{t("admin.tripDepartureCityEn")}</Label>
                          <Input
                            id={`ps-modal-dc-en-${index}`}
                            className={tripInputClass}
                            value={row.departure_city}
                            onChange={(e) =>
                              setDraft((prev) => {
                                const copy = [...prev];
                                copy[index] = { ...copy[index], departure_city: e.target.value };
                                return copy;
                              })
                            }
                            autoComplete="off"
                          />
                        </div>
                      ) : null}
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`ps-modal-hotel-el-${index}`}>{t("admin.tripPricingHotelEl")}</Label>
                        <Input
                          id={`ps-modal-hotel-el-${index}`}
                          className={tripInputClass}
                          value={row.hotel_el}
                          onChange={(e) =>
                            setDraft((prev) => {
                              const copy = [...prev];
                              copy[index] = { ...copy[index], hotel_el: e.target.value };
                              return copy;
                            })
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor={`ps-modal-hotel-en-${index}`}>{t("admin.tripPricingHotelEn")}</Label>
                        <Input
                          id={`ps-modal-hotel-en-${index}`}
                          className={tripInputClass}
                          value={row.hotel_en}
                          onChange={(e) =>
                            setDraft((prev) => {
                              const copy = [...prev];
                              copy[index] = { ...copy[index], hotel_en: e.target.value };
                              return copy;
                            })
                          }
                          autoComplete="off"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ps-modal-dur-${index}`}>{t("admin.tripDurationDays")}</Label>
                        <Input
                          id={`ps-modal-dur-${index}`}
                          type="number"
                          inputMode="numeric"
                          step={1}
                          min={0}
                          className={tripInputClass}
                          value={row.duration_days ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((prev) => {
                              const copy = [...prev];
                              const n =
                                v === "" ? null : Math.trunc(Number(v));
                              copy[index] = {
                                ...copy[index],
                                duration_days: n != null && Number.isFinite(n) ? n : null,
                              };
                              return copy;
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ps-modal-pd-${index}`}>{t("admin.tripPricingDouble")}</Label>
                        <Input
                          id={`ps-modal-pd-${index}`}
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min={0}
                          className={tripInputClass}
                          value={row.price_double ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((prev) => {
                              const copy = [...prev];
                              const n = v === "" ? null : Number(v);
                              copy[index] = {
                                ...copy[index],
                                price_double: n != null && Number.isFinite(n) ? n : null,
                              };
                              return copy;
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ps-modal-ps-${index}`}>{t("admin.tripPricingSingle")}</Label>
                        <Input
                          id={`ps-modal-ps-${index}`}
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min={0}
                          className={tripInputClass}
                          value={row.price_single ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((prev) => {
                              const copy = [...prev];
                              const n = v === "" ? null : Number(v);
                              copy[index] = {
                                ...copy[index],
                                price_single: n != null && Number.isFinite(n) ? n : null,
                              };
                              return copy;
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ps-modal-pt-${index}`}>{t("admin.tripPricingTriple")}</Label>
                        <Input
                          id={`ps-modal-pt-${index}`}
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min={0}
                          className={tripInputClass}
                          value={row.price_triple ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((prev) => {
                              const copy = [...prev];
                              const n = v === "" ? null : Number(v);
                              copy[index] = {
                                ...copy[index],
                                price_triple: n != null && Number.isFinite(n) ? n : null,
                              };
                              return copy;
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`ps-modal-pc-${index}`}>{t("admin.tripPricingChild")}</Label>
                        <Input
                          id={`ps-modal-pc-${index}`}
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min={0}
                          className={tripInputClass}
                          value={row.price_child ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((prev) => {
                              const copy = [...prev];
                              const n = v === "" ? null : Number(v);
                              copy[index] = {
                                ...copy[index],
                                price_child: n != null && Number.isFinite(n) ? n : null,
                              };
                              return copy;
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                    {index === draft.length - 1 ? (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="shrink-0"
                          disabled={!canAddPricing}
                          onClick={addRow}
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          {t("admin.tripPricingSegmentAdd")}
                        </Button>
                      </div>
                    ) : null}
                  </Fragment>
                  );
                })}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-zinc-950/80 sm:px-5">
              <Button type="button" variant="outline" onClick={tryClose}>
                {t("admin.tripPricingModalCancel")}
              </Button>
              <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSave}
              >
                {t("admin.tripPricingModalSave")}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <UnsavedCloseAlert {...unsavedAlert} overlayClassName="z-[120]" />
    </>
  );
}
