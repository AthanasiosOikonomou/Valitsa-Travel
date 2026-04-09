import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PricingSegmentFormRow } from "@/lib/tripPricing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { isValidDayForMonth } from "@/lib/departureWindows";
import { DepartureDayPickerPure } from "./DepartureDayPickerPure";

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

export function PricingSegmentsModal({
  open,
  onOpenChange,
  rows,
  onSave,
  t,
  lang,
  tripInputClass,
  hasEnglish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: PricingSegmentFormRow[];
  onSave: (rows: PricingSegmentFormRow[]) => void;
  t: (key: string) => string;
  lang: "gr" | "en";
  tripInputClass: string;
  hasEnglish: boolean;
}) {
  const [draft, setDraft] = useState<PricingSegmentFormRow[]>([]);
  const snapshotRef = useRef<string>("");
  const [unsavedOpen, setUnsavedOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const init = structuredClone(rows);
    setDraft(init);
    snapshotRef.current = JSON.stringify(init);
  }, [open, rows]);

  const tryClose = useCallback(() => {
    if (JSON.stringify(draft) === snapshotRef.current) {
      onOpenChange(false);
      return;
    }
    setUnsavedOpen(true);
  }, [draft, onOpenChange]);

  const handleSave = useCallback(() => {
    onSave(draft);
  }, [draft, onSave]);

  const handleDialogOpenChange = useCallback(
    (next: boolean) => {
      if (next) onOpenChange(true);
      else tryClose();
    },
    [onOpenChange, tryClose],
  );

  const discardAndClose = () => {
    setUnsavedOpen(false);
    onOpenChange(false);
  };

  const saveFromAlertAndClose = () => {
    setUnsavedOpen(false);
    onSave(draft);
  };

  const locale = lang === "gr" ? "el-GR" : "en-GB";

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleDialogOpenChange}>
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

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
              <p className="pb-3 text-xs text-slate-600 dark:text-zinc-400">{t("admin.tripPricingSegmentsHint")}</p>
              <div className="flex flex-wrap items-center justify-end gap-2 pb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setDraft((prev) => [...prev, emptyRow()])}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t("admin.tripPricingSegmentAdd")}
                </Button>
              </div>
              {draft.length === 0 ? (
                <p className="pb-2 text-sm text-slate-600 dark:text-zinc-400">{t("admin.tripPricingSegmentsEmpty")}</p>
              ) : null}
              <div className="space-y-3">
                {draft.map((row, index) => (
                  <div
                    key={index}
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
                        <select
                          id={`ps-modal-month-${index}`}
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
                              const days = (cur.days ?? []).filter((d) => isValidDayForMonth(month, d));
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
                ))}
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

      <AlertDialog open={unsavedOpen} onOpenChange={setUnsavedOpen}>
        <AlertDialogContent overlayClassName="z-[120]" className="z-[121] max-w-2xl min-w-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="break-words pr-1">{t("admin.tripPricingUnsavedTitle")}</AlertDialogTitle>
            <AlertDialogDescription className="break-words text-pretty">
              {t("admin.tripPricingUnsavedDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 [&>*]:h-auto [&>*]:min-h-10 [&>*]:w-full [&>*]:whitespace-normal [&>*]:px-3 [&>*]:py-2 [&>*]:text-left">
            <AlertDialogCancel>{t("admin.tripPricingUnsavedKeepEditing")}</AlertDialogCancel>
            <Button type="button" variant="outline" onClick={discardAndClose}>
              {t("admin.tripPricingUnsavedDiscard")}
            </Button>
            <AlertDialogAction onClick={saveFromAlertAndClose}>
              {t("admin.tripPricingUnsavedSaveAndClose")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
