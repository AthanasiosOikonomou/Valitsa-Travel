import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Save, Trash2, X } from "lucide-react";
import {
  deleteSeasonalConfig,
  getAdminSeasonalConfigs,
  postSeasonalConfig,
  putSeasonalConfig,
  type SeasonalConfigRow,
} from "@/lib/adminApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { UnsavedCloseAlert } from "@/admin/components/UnsavedCloseAlert";
import { useUnsavedDialogClose } from "@/admin/hooks/useUnsavedDialogClose";

const SEASONAL_KEY_REGEX = /^[a-z0-9_-]+$/;

function CreateNewSeasonDialog({
  open,
  onOpenChange,
  configs,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  configs: SeasonalConfigRow[];
  onCreated: () => void;
}) {
  const { t } = useLanguage();
  const [seasonalKey, setSeasonalKey] = useState("");
  const [navEl, setNavEl] = useState("");
  const [navEn, setNavEn] = useState("");

  const displayOrder = useMemo(() => {
    if (configs.length === 0) return 0;
    return Math.max(...configs.map((c) => c.display_order)) + 1;
  }, [configs]);

  useEffect(() => {
    if (!open) {
      setSeasonalKey("");
      setNavEl("");
      setNavEn("");
    }
  }, [open]);

  const keyTrimmed = seasonalKey.trim();
  const keyInvalid = keyTrimmed.length > 0 && !SEASONAL_KEY_REGEX.test(keyTrimmed);
  const keyValid = keyTrimmed.length > 0 && SEASONAL_KEY_REGEX.test(keyTrimmed);
  const canSubmit = keyValid && Boolean(navEl.trim() && navEn.trim());
  const isDirty = Boolean(keyTrimmed || navEl.trim() || navEn.trim());

  const mut = useMutation({
    mutationFn: () =>
      postSeasonalConfig({
        seasonal_key: keyTrimmed,
        nav_label_el: navEl.trim(),
        nav_label_en: navEn.trim(),
        display_order: displayOrder,
        is_active: true,
      }),
    onSuccess: () => {
      toast.success(t("admin.navigationCreated"));
      onOpenChange(false);
      onCreated();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t("admin.navigationSaveFailed"), { description: msg });
    },
  });

  const onSaveAndClose = useCallback(async () => {
    if (!canSubmit) {
      if (keyInvalid) {
        toast.error(t("admin.navigationKeyInvalid"));
      } else {
        toast.error(t("admin.navigationSaveFailed"));
      }
      throw new Error("validation");
    }
    await mut.mutateAsync();
  }, [canSubmit, keyInvalid, mut, t]);

  const closeDialog = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const { handleOpenChange, tryClose, unsavedAlert } = useUnsavedDialogClose({
    isDirty,
    onClose: closeDialog,
    onSaveAndClose,
  });

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[101] max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="relative pr-10">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
              {t("admin.navigationNewSeasonTitle")}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              {t("admin.navigationNewSeasonDesc")}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-0 top-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                aria-label={t("admin.close")}
              >
                <X className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit || mut.isPending) return;
              mut.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="new-season-key">{t("admin.navigationNewSeasonKey")}</Label>
              <Input
                id="new-season-key"
                value={seasonalKey}
                onChange={(e) => setSeasonalKey(e.target.value)}
                onBlur={() => setSeasonalKey((s) => s.trim().toLowerCase())}
                placeholder={t("admin.navigationNewSeasonKeyPlaceholder")}
                className="min-h-11 font-mono"
                autoComplete="off"
                spellCheck={false}
              />
              {keyInvalid ? (
                <p className="text-xs text-destructive" role="alert">
                  {t("admin.navigationKeyInvalid")}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-season-el">{t("admin.navigationLabelEl")}</Label>
              <Input
                id="new-season-el"
                value={navEl}
                onChange={(e) => setNavEl(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-season-en">{t("admin.navigationLabelEn")}</Label>
              <Input
                id="new-season-en"
                value={navEn}
                onChange={(e) => setNavEn(e.target.value)}
                className="min-h-11"
              />
            </div>
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={mut.isPending}
                onClick={tryClose}
              >
                {t("admin.cancel")}
              </Button>
              <Button type="submit" disabled={!canSubmit || mut.isPending}>
                {t("admin.navigationCreate")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
      <UnsavedCloseAlert {...unsavedAlert} />
    </Dialog.Root>
  );
}

function OrphanCreateRow({
  seasonalKey,
  onCreated,
}: {
  seasonalKey: string;
  onCreated: () => void;
}) {
  const { t } = useLanguage();
  const [navEl, setNavEl] = useState(seasonalKey.replace(/[-_]/g, " "));
  const [navEn, setNavEn] = useState(seasonalKey.replace(/[-_]/g, " "));
  const [order, setOrder] = useState(0);
  const [active, setActive] = useState(true);

  const mut = useMutation({
    mutationFn: () =>
      postSeasonalConfig({
        seasonal_key: seasonalKey,
        nav_label_el: navEl.trim(),
        nav_label_en: navEn.trim(),
        display_order: order,
        is_active: active,
      }),
    onSuccess: () => {
      toast.success(t("admin.navigationCreated"));
      onCreated();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t("admin.navigationSaveFailed"), { description: msg });
    },
  });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/50 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[8rem] text-sm font-mono text-slate-600 dark:text-zinc-400">{seasonalKey}</div>
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`orph-el-${seasonalKey}`}>{t("admin.navigationLabelEl")}</Label>
          <Input
            id={`orph-el-${seasonalKey}`}
            value={navEl}
            onChange={(e) => setNavEl(e.target.value)}
            className="min-h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`orph-en-${seasonalKey}`}>{t("admin.navigationLabelEn")}</Label>
          <Input
            id={`orph-en-${seasonalKey}`}
            value={navEn}
            onChange={(e) => setNavEn(e.target.value)}
            className="min-h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`orph-ord-${seasonalKey}`}>{t("admin.navigationDisplayOrder")}</Label>
          <Input
            id={`orph-ord-${seasonalKey}`}
            type="number"
            inputMode="numeric"
            value={order}
            onChange={(e) => setOrder(Math.trunc(Number(e.target.value)) || 0)}
            className="min-h-11"
          />
        </div>
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 dark:border-white/10">
          <span className="text-sm text-slate-700 dark:text-zinc-300">{t("admin.navigationActive")}</span>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>
      </div>
      <Button
        type="button"
        onClick={() => mut.mutate()}
        disabled={mut.isPending || !navEl.trim() || !navEn.trim()}
      >
        {t("admin.navigationCreate")}
      </Button>
    </div>
  );
}

function ConfigEditRow({ row, onSaved }: { row: SeasonalConfigRow; onSaved: () => void }) {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [navEl, setNavEl] = useState(row.nav_label_el);
  const [navEn, setNavEn] = useState(row.nav_label_en);
  const [order, setOrder] = useState(row.display_order);
  const [active, setActive] = useState(row.is_active);
  useEffect(() => {
    setNavEl(row.nav_label_el);
    setNavEn(row.nav_label_en);
    setOrder(row.display_order);
    setActive(row.is_active);
  }, [row]);

  const mut = useMutation({
    mutationFn: () =>
      putSeasonalConfig(row.seasonal_key, {
        nav_label_el: navEl.trim(),
        nav_label_en: navEn.trim(),
        display_order: order,
        is_active: active,
      }),
    onSuccess: () => {
      toast.success(t("admin.navigationUpdated"));
      onSaved();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t("admin.navigationSaveFailed"), { description: msg });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteSeasonalConfig(row.seasonal_key),
    onSuccess: (data) => {
      toast.success(t("admin.navigationDeleted"), {
        description: t("admin.navigationDeletedTrips").replace(
          "{n}",
          String(data.unlinkedTrips),
        ),
      });
      void qc.invalidateQueries({ queryKey: ["admin-trips"] });
      onSaved();
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(t("admin.navigationDeleteFailed"), { description: msg });
    },
  });

  const dirty =
    navEl.trim() !== row.nav_label_el ||
    navEn.trim() !== row.nav_label_en ||
    order !== row.display_order ||
    active !== row.is_active;

  const tripCount = row.trip_count ?? 0;
  const deleteBody = t("admin.navigationDeleteConfirmBody").replace(
    "{n}",
    String(tripCount),
  );

  return (
    <tr className="border-b border-slate-100 dark:border-white/10">
      <td className="px-3 py-3 font-mono text-sm text-slate-700 dark:text-zinc-300">{row.seasonal_key}</td>
      <td className="px-3 py-2">
        <Input value={navEl} onChange={(e) => setNavEl(e.target.value)} className="min-h-10" />
      </td>
      <td className="px-3 py-2">
        <Input value={navEn} onChange={(e) => setNavEn(e.target.value)} className="min-h-10" />
      </td>
      <td className="px-3 py-2">
        <Input
          type="number"
          inputMode="numeric"
          value={order}
          onChange={(e) => setOrder(Math.trunc(Number(e.target.value)) || 0)}
          className="min-h-10 w-24"
        />
      </td>
      <td className="px-3 py-2">
        <Switch checked={active} onCheckedChange={setActive} />
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={!dirty || mut.isPending}
            onClick={() => mut.mutate()}
            className={cn(
              "h-9 w-9 shrink-0",
              dirty
                ? "text-primary hover:bg-primary/10 hover:text-primary"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-500 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-400",
            )}
            aria-label={t("admin.navigationSave")}
          >
            <Save className="h-4 w-4" aria-hidden />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={deleteMut.isPending}
                className="h-9 w-9 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                aria-label={t("admin.navigationDelete")}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("admin.navigationDeleteConfirmTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{deleteBody}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteMut.mutate();
                  }}
                  disabled={deleteMut.isPending}
                >
                  {t("admin.navigationDelete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}

export default function AdminNavigationPage() {
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [createSeasonOpen, setCreateSeasonOpen] = useState(false);
  const refetch = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["admin-seasonal-configs"] });
    void qc.invalidateQueries({ queryKey: ["seasonal-nav"] });
  }, [qc]);

  const q = useQuery({
    queryKey: ["admin-seasonal-configs"],
    queryFn: getAdminSeasonalConfigs,
  });

  const loadErrorMessage = q.error instanceof Error ? q.error.message : String(q.error ?? "");
  const loadErrorDisplay =
    loadErrorMessage === "SEASONAL_API_UNREACHABLE_HTML"
      ? t("admin.navigationLoadErrorApiUnreachableBody")
      : loadErrorMessage === "SEASONAL_API_INVALID_JSON"
        ? t("admin.navigationLoadErrorInvalidJsonBody")
        : loadErrorMessage;
  const loadErrorHint = (() => {
    if (loadErrorMessage === "SEASONAL_API_UNREACHABLE_HTML") {
      return t("admin.navigationLoadErrorHintApiUnreachable");
    }
    if (loadErrorMessage === "SEASONAL_API_INVALID_JSON") {
      return t("admin.navigationLoadErrorHint");
    }
    if (/seasonal_configs|table is not available/i.test(loadErrorMessage)) {
      return t("admin.navigationLoadErrorHintTableMissing");
    }
    if (/not configured/i.test(loadErrorMessage)) {
      return t("admin.navigationLoadErrorHintEnv");
    }
    return t("admin.navigationLoadErrorHint");
  })();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-zinc-100">{t("admin.navigationTitle")}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{t("admin.navigationSubtitle")}</p>
      </div>

      {q.isLoading ? (
        <Skeleton className="h-40 w-full rounded-xl bg-slate-200 dark:bg-zinc-800" />
      ) : q.isError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive dark:bg-destructive/10"
        >
          <p className="font-medium">{t("admin.navigationLoadErrorTitle")}</p>
          <p className="mt-1 whitespace-pre-wrap break-words">{loadErrorDisplay}</p>
          <p className="mt-2 text-xs text-destructive/90">{loadErrorHint}</p>
        </div>
      ) : (
        <>
          <Button
            type="button"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => setCreateSeasonOpen(true)}
          >
            {t("admin.navigationAddSeasonButton")}
          </Button>

          <CreateNewSeasonDialog
            open={createSeasonOpen}
            onOpenChange={setCreateSeasonOpen}
            configs={q.data?.configs ?? []}
            onCreated={refetch}
          />

          <Card className="border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">{t("admin.navigationOrphansHeading")}</CardTitle>
              <CardDescription>{t("admin.navigationOrphansHint")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(q.data?.orphanSeasonalNames?.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-500">{t("admin.navigationOrphansEmpty")}</p>
              ) : (
                q.data!.orphanSeasonalNames.map((key) => (
                  <OrphanCreateRow key={key} seasonalKey={key} onCreated={refetch} />
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">{t("admin.navigationConfigsHeading")}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {(q.data?.configs?.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500 dark:text-zinc-500">{t("admin.navigationConfigsEmpty")}</p>
              ) : (
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 dark:border-white/10 dark:text-zinc-400">
                      <th className="px-3 py-2 font-medium">{t("admin.navigationKey")}</th>
                      <th className="px-3 py-2 font-medium">{t("admin.navigationLabelEl")}</th>
                      <th className="px-3 py-2 font-medium">{t("admin.navigationLabelEn")}</th>
                      <th className="px-3 py-2 font-medium">{t("admin.navigationDisplayOrder")}</th>
                      <th className="px-3 py-2 font-medium">{t("admin.navigationActive")}</th>
                      <th className="px-3 py-2 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {q.data!.configs.map((row) => (
                      <ConfigEditRow key={row.seasonal_key} row={row} onSaved={refetch} />
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
