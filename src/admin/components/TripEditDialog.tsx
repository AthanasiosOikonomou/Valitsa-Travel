import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { putTrip } from "@/lib/adminApi";
import { isHtmlEmpty } from "@/lib/isHtmlEmpty";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { TripImageDropzone } from "@/admin/components/TripImageDropzone";
import { cn } from "@/lib/utils";

function asHtml(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function buildTripFormSchema(t: (key: string) => string) {
  const richReq = t("admin.tripRichFieldRequired");
  const fieldReq = t("admin.tripFieldRequired");
  return z.object({
    title_el: z.string().trim().min(1, fieldReq),
    description_el: z.string().refine((h) => !isHtmlEmpty(h), { message: richReq }),
    program_el: z.string().refine((h) => !isHtmlEmpty(h), { message: richReq }),
    included_el: z.string().refine((h) => !isHtmlEmpty(h), { message: richReq }),
    title: z.string(),
    description: z.string(),
    program: z.string(),
    included: z.string(),
    image: z.string().nullable(),
  });
}

export type TripFormValues = z.infer<ReturnType<typeof buildTripFormSchema>>;

const GREEK_FIELD_ORDER = ["title_el", "description_el", "program_el", "included_el"] as const;

type Props = { tripId: string; open: boolean; onClose: () => void };

export function TripEditDialog({ tripId, open, onClose }: Props) {
  const qc = useQueryClient();
  const { t } = useLanguage();
  const [tab, setTab] = useState("el");

  const schema = useMemo(() => buildTripFormSchema(t), [t]);

  const q = useQuery({
    queryKey: ["admin-trip", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: open && !!tripId,
  });

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      title_el: "",
      description: "",
      description_el: "",
      program: "",
      program_el: "",
      included: "",
      included_el: "",
      image: null,
    },
  });

  useEffect(() => {
    if (open) setTab("el");
  }, [open, tripId]);

  useEffect(() => {
    const row = q.data;
    if (!row) return;
    reset({
      title: String(row.title ?? ""),
      title_el: String(row.title_el ?? ""),
      image: (row.image as string | null) ?? null,
      description: asHtml(row.description),
      description_el: asHtml(row.description_el),
      program: asHtml(row.program),
      program_el: asHtml(row.program_el),
      included: asHtml(row.included),
      included_el: asHtml(row.included_el),
    });
  }, [q.data, reset]);

  const save = useMutation({
    mutationFn: async (values: TripFormValues) => {
      await putTrip(tripId, {
        title: values.title,
        title_el: values.title_el.trim() || null,
        image: values.image,
        description: values.description,
        description_el: values.description_el || null,
        program: values.program,
        program_el: values.program_el || null,
        included: values.included,
        included_el: values.included_el || null,
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

  const onValid = (values: TripFormValues) => {
    save.mutate(values);
  };

  const onInvalid = (errs: FieldErrors<TripFormValues>) => {
    setTab("el");
    requestAnimationFrame(() => {
      for (const name of GREEK_FIELD_ORDER) {
        if (!errs[name]) continue;
        if (name === "title_el") {
          setFocus("title_el");
        }
        const scrollId = name === "title_el" ? "trip-title-el" : `trip-field-${name}`;
        document.getElementById(scrollId)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        break;
      }
    });
  };

  const fieldClass = (name: keyof TripFormValues) =>
    cn(errors[name] && "ring-2 ring-destructive/50 rounded-xl border-destructive/40");

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] flex max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-elev3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
          <div className="shrink-0 border-b border-slate-100 px-6 pb-4 pt-6 dark:border-white/5">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
              {t("admin.editTrip")}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-slate-600 dark:text-zinc-400">
              {t("admin.editTripDesc")}
            </Dialog.Description>
          </div>

          {q.isLoading ? (
            <Skeleton className="m-6 h-40 w-auto bg-slate-200 dark:bg-zinc-800" />
          ) : (
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={handleSubmit(onValid, onInvalid)}
              noValidate
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-2">
                  <Label>{t("admin.heroImage")}</Label>
                  <Controller
                    name="image"
                    control={control}
                    render={({ field }) => (
                      <TripImageDropzone
                        value={field.value}
                        onChange={field.onChange}
                        hint={t("admin.tripSinglePhotoHint")}
                        removeLabel={t("admin.tripRemoveImage")}
                      />
                    )}
                  />
                </div>

                <Tabs value={tab} onValueChange={setTab} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
                    <TabsTrigger value="el">{t("admin.tabGreek")}</TabsTrigger>
                    <TabsTrigger value="en">{t("admin.tabEnglish")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="el" forceMount className="data-[state=inactive]:hidden">
                    <div className="space-y-5 pt-1">
                      <div className={fieldClass("title_el")}>
                        <Label htmlFor="trip-title-el">{t("admin.titleEl")}</Label>
                        <Controller
                          name="title_el"
                          control={control}
                          render={({ field }) => (
                            <Input id="trip-title-el" className="mt-1.5" {...field} autoComplete="off" />
                          )}
                        />
                        {errors.title_el ? (
                          <p className="mt-1 text-xs text-destructive">{errors.title_el.message}</p>
                        ) : null}
                      </div>
                      <div className={fieldClass("description_el")} id="trip-field-description_el">
                        <Label>{t("admin.descriptionEl")}</Label>
                        <Controller
                          name="description_el"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-1.5">
                              <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                            </div>
                          )}
                        />
                        {errors.description_el ? (
                          <p className="mt-1 text-xs text-destructive">{errors.description_el.message}</p>
                        ) : null}
                      </div>
                      <div className={fieldClass("program_el")} id="trip-field-program_el">
                        <Label>{t("admin.programEl")}</Label>
                        <Controller
                          name="program_el"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-1.5">
                              <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                            </div>
                          )}
                        />
                        {errors.program_el ? (
                          <p className="mt-1 text-xs text-destructive">{errors.program_el.message}</p>
                        ) : null}
                      </div>
                      <div className={fieldClass("included_el")} id="trip-field-included_el">
                        <Label>{t("admin.includedEl")}</Label>
                        <Controller
                          name="included_el"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-1.5">
                              <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                            </div>
                          )}
                        />
                        {errors.included_el ? (
                          <p className="mt-1 text-xs text-destructive">{errors.included_el.message}</p>
                        ) : null}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="en" forceMount className="data-[state=inactive]:hidden">
                    <div className="space-y-5 pt-1">
                      <div>
                        <Label htmlFor="trip-title-en">{t("admin.titleEn")}</Label>
                        <Controller
                          name="title"
                          control={control}
                          render={({ field }) => (
                            <Input id="trip-title-en" className="mt-1.5" {...field} autoComplete="off" />
                          )}
                        />
                      </div>
                      <div>
                        <Label>{t("admin.descriptionEn")}</Label>
                        <Controller
                          name="description"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-1.5">
                              <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                            </div>
                          )}
                        />
                      </div>
                      <div>
                        <Label>{t("admin.programEn")}</Label>
                        <Controller
                          name="program"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-1.5">
                              <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                            </div>
                          )}
                        />
                      </div>
                      <div>
                        <Label>{t("admin.includedEn")}</Label>
                        <Controller
                          name="included"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-1.5">
                              <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                            </div>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/90 px-6 py-4 dark:border-white/10 dark:bg-zinc-950/80">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("admin.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={save.isPending}
                >
                  {save.isPending ? t("admin.saving") : t("admin.save")}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
