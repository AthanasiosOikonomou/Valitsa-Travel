import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import type { TripFlightLeg } from "@/types/Trip";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnsavedCloseAlert } from "@/admin/components/UnsavedCloseAlert";
import { useUnsavedDialogClose } from "@/admin/hooks/useUnsavedDialogClose";
import { cn, scrollContainerToAlignChildTop } from "@/lib/utils";
import { normalizeFlightDetails } from "@/lib/tripFlightDetails";

const EMPTY_LEG: TripFlightLeg = {
  departure_el: "",
  departure_en: "",
  return_el: "",
  return_en: "",
};

export function FlightDetailsModal({
  open,
  onOpenChange,
  flightDetailsEnabled,
  legs,
  onSave,
  t,
  flightTextareaClass,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flightDetailsEnabled: boolean;
  legs: TripFlightLeg[];
  onSave: (payload: { flight_details_enabled: boolean; flight_details: TripFlightLeg[] }) => void;
  t: (key: string) => string;
  flightTextareaClass: string;
}) {
  const [draftEnabled, setDraftEnabled] = useState(false);
  const [draftLegs, setDraftLegs] = useState<TripFlightLeg[]>([]);
  const snapshotRef = useRef<string>("");
  const flightScrollBodyRef = useRef<HTMLDivElement>(null);
  const lastAddedLegCardRef = useRef<HTMLDivElement | null>(null);
  const scrollToEndAfterAddRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    const enabled = flightDetailsEnabled;
    const next = normalizeFlightDetails(legs).map((l) => ({ ...l }));
    setDraftEnabled(enabled);
    setDraftLegs(next);
    snapshotRef.current = JSON.stringify({ enabled, legs: next });
  }, [open, flightDetailsEnabled, legs]);

  useEffect(() => {
    if (!scrollToEndAfterAddRef.current) return;
    scrollToEndAfterAddRef.current = false;
    const container = flightScrollBodyRef.current;
    const segment = lastAddedLegCardRef.current;
    if (!container || !segment) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollContainerToAlignChildTop(container, segment);
      });
    });
  }, [draftLegs]);

  const snapshotPayload = JSON.stringify({ enabled: draftEnabled, legs: draftLegs });

  const buildPayload = useCallback((): {
    flight_details_enabled: boolean;
    flight_details: TripFlightLeg[];
  } => {
    return { flight_details_enabled: draftEnabled, flight_details: draftLegs.map((l) => ({ ...l })) };
  }, [draftEnabled, draftLegs]);

  const isDirty = snapshotPayload !== snapshotRef.current;

  const closeModal = useCallback(() => onOpenChange(false), [onOpenChange]);

  const onSaveAndClose = useCallback(() => {
    onSave(buildPayload());
  }, [buildPayload, onSave]);

  const { handleOpenChange, tryClose, unsavedAlert } = useUnsavedDialogClose({
    isDirty,
    onClose: closeModal,
    onSaveAndClose,
  });

  const handleSave = useCallback(() => {
    onSave(buildPayload());
  }, [buildPayload, onSave]);

  const setLegField = useCallback((index: number, field: keyof TripFlightLeg, value: string) => {
    setDraftLegs((prev) => {
      const copy = [...prev];
      while (copy.length <= index) copy.push({ ...EMPTY_LEG });
      copy[index] = { ...(copy[index] ?? { ...EMPTY_LEG }), [field]: value };
      return copy;
    });
  }, []);

  const removeLeg = (index: number) => {
    setDraftLegs((prev) => prev.filter((_, i) => i !== index));
  };

  const addLeg = () => {
    scrollToEndAfterAddRef.current = true;
    setDraftLegs((prev) => [...prev, { ...EMPTY_LEG }]);
  };

  const onToggleEnabled = (on: boolean) => {
    setDraftEnabled(on);
    if (on) {
      setDraftLegs((prev) => (prev.length === 0 ? [{ ...EMPTY_LEG }] : prev));
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[111] flex max-h-[min(90vh,760px)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-elev3 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100",
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-white/10 sm:px-5">
              <Dialog.Title className="pr-2 text-base font-semibold leading-snug sm:text-lg">
                {t("admin.tripFlightModalTitle")}
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
            <Dialog.Description className="sr-only">{t("admin.tripFlightModalTitle")}</Dialog.Description>

            <div
              ref={flightScrollBodyRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 dark:border-white/10 dark:bg-zinc-950/50">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                    {t("admin.tripFlightDetailsEnable")}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600 dark:text-zinc-400">
                    {t("admin.tripFlightDetailsHint")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                    {draftEnabled ? t("admin.tripFlightDetailsOn") : t("admin.tripFlightDetailsOff")}
                  </span>
                  <Switch checked={draftEnabled} onCheckedChange={onToggleEnabled} aria-label={t("admin.tripFlightDetailsEnable")} />
                </div>
              </div>

              {draftEnabled ? (
                <div className="mt-4 space-y-4">
                  {draftLegs.length === 0 ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-slate-600 dark:text-zinc-400">{t("admin.tripFlightModalLegsHint")}</p>
                      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addLeg}>
                        <Plus className="mr-1 h-4 w-4" aria-hidden />
                        {t("admin.tripFlightLegAdd")}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-zinc-400">{t("admin.tripFlightModalLegsHint")}</p>
                  )}
                  {draftLegs.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-zinc-400">{t("admin.tripFlightLegsEmpty")}</p>
                  ) : null}
                  {draftLegs.map((leg, index) => (
                    <Fragment key={index}>
                    <div
                      ref={index === draftLegs.length - 1 ? lastAddedLegCardRef : undefined}
                      className="space-y-3 rounded-xl border border-border bg-muted/20 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {t("admin.tripFlightLegLabel").replace("{n}", String(index + 1))}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="shrink-0 text-destructive hover:text-destructive"
                          onClick={() => removeLeg(index)}
                          aria-label={t("admin.tripFlightLegRemove")}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("admin.tripFlightLegRemove")}</span>
                        </Button>
                      </div>
                      <Tabs defaultValue="el" className="w-full" key={`fd-leg-${index}`}>
                        <TabsList className="grid h-11 w-full max-w-[16rem] grid-cols-2">
                          <TabsTrigger
                            value="el"
                            className="flex h-full min-h-0 w-full min-w-0 items-center justify-center"
                          >
                            {t("admin.tabGreek")}
                          </TabsTrigger>
                          <TabsTrigger
                            value="en"
                            className="flex h-full min-h-0 w-full min-w-0 items-center justify-center"
                          >
                            {t("admin.tabEnglish")}
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="el" className="mt-3 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`fd-modal-dep-el-${index}`}>{t("detail.flightDepartureLabel")}</Label>
                              <textarea
                                id={`fd-modal-dep-el-${index}`}
                                className={flightTextareaClass}
                                rows={3}
                                autoComplete="off"
                                value={leg.departure_el}
                                onChange={(e) => setLegField(index, "departure_el", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`fd-modal-ret-el-${index}`}>{t("detail.flightReturnLabel")}</Label>
                              <textarea
                                id={`fd-modal-ret-el-${index}`}
                                className={flightTextareaClass}
                                rows={3}
                                autoComplete="off"
                                value={leg.return_el}
                                onChange={(e) => setLegField(index, "return_el", e.target.value)}
                              />
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="en" className="mt-3 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor={`fd-modal-dep-en-${index}`}>{t("detail.flightDepartureLabel")}</Label>
                              <textarea
                                id={`fd-modal-dep-en-${index}`}
                                className={flightTextareaClass}
                                rows={3}
                                autoComplete="off"
                                value={leg.departure_en}
                                onChange={(e) => setLegField(index, "departure_en", e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`fd-modal-ret-en-${index}`}>{t("detail.flightReturnLabel")}</Label>
                              <textarea
                                id={`fd-modal-ret-en-${index}`}
                                className={flightTextareaClass}
                                rows={3}
                                autoComplete="off"
                                value={leg.return_en}
                                onChange={(e) => setLegField(index, "return_en", e.target.value)}
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    {index === draftLegs.length - 1 ? (
                      <div className="flex justify-end">
                        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={addLeg}>
                          <Plus className="mr-1 h-4 w-4" aria-hidden />
                          {t("admin.tripFlightLegAdd")}
                        </Button>
                      </div>
                    ) : null}
                    </Fragment>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-3 dark:border-white/10 dark:bg-zinc-950/80 sm:px-5">
              <Button type="button" variant="outline" onClick={tryClose}>
                {t("admin.tripFlightModalCancel")}
              </Button>
              <Button type="button" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                {t("admin.tripFlightModalSave")}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <UnsavedCloseAlert {...unsavedAlert} overlayClassName="z-[120]" />
    </>
  );
}
