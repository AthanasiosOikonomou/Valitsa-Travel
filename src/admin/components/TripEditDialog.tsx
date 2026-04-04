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
import {
  formStepsToDbPayload,
  programDbToFormSteps,
  stringListDbToForm,
  type ProgramFormStep,
} from "@/lib/tripAdminForm";
import {
  mergeTransportSlugsFromColumns,
  slugsToCsvEl,
  slugsToCsvEn,
} from "@/lib/tripTransportModes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { TripImageDropzone } from "@/admin/components/TripImageDropzone";
import { ProgramTimelineEditor } from "@/admin/components/trip-edit/ProgramTimelineEditor";
import { StringArrayField } from "@/admin/components/trip-edit/StringArrayField";
import { TransportMultiSelect } from "@/admin/components/trip-edit/TransportMultiSelect";
import { cn } from "@/lib/utils";

function asHtml(v: unknown): string {
  return typeof v === "string" ? v : "";
}

const transportModeEnum = z.enum(["bus", "plane", "ship", "train"]);

function buildTripFormSchema(t: (key: string) => string) {
  const fieldReq = t("admin.tripFieldRequired");
  const richReq = t("admin.tripRichFieldRequired");
  const daysInvalid = t("admin.tripDaysInvalid");
  const programStepSchema = z.object({
    days: z.string().trim().regex(/^\d+(?:-\d+)?$/, daysInvalid),
    title: z.string(),
    description: z.string(),
  });
  return z.object({
    title_el: z.string().trim().min(1, fieldReq),
    location_el: z.string().trim().min(1, fieldReq),
    country_el: z.string().trim().min(1, fieldReq),
    type_el: z.string().trim().min(1, fieldReq),
    category_el: z.string().trim().min(1, fieldReq),
    transport_mode_slugs: z.array(transportModeEnum).min(1, fieldReq),
    date_range_el: z.string().trim().min(1, fieldReq),
    departure_city_el: z.string().trim().min(1, fieldReq),
    description_el: z.string().refine((h) => !isHtmlEmpty(h), { message: richReq }),
    program_el: z
      .array(programStepSchema)
      .min(1, t("admin.tripProgramMinDay"))
      .refine(
        (steps) => steps.some((s) => s.title.trim().length > 0 || s.description.trim().length > 0),
        { message: t("admin.tripProgramNeedsContent") },
      ),
    included_el: z
      .array(z.string())
      .min(1, fieldReq)
      .refine((arr) => arr.some((s) => s.trim().length > 0), { message: t("admin.tripIncludedMin") }),
    tags_el: z.array(z.string()),

    title: z.string(),
    description: z.string(),
    location: z.string(),
    country: z.string(),
    type: z.string(),
    category: z.string(),
    date_range: z.string(),
    departure_city: z.string(),
    program: z.array(programStepSchema),
    included: z.array(z.string()),
    tags: z.array(z.string()),

    image: z.string().nullable(),
    price_num: z.number().nullable(),
    duration_days: z.number().int().nullable(),
  });
}

export type TripFormValues = z.infer<ReturnType<typeof buildTripFormSchema>>;

const GREEK_FIELD_ORDER = [
  "title_el",
  "location_el",
  "country_el",
  "type_el",
  "category_el",
  "transport_mode_slugs",
  "date_range_el",
  "departure_city_el",
  "description_el",
  "program_el",
  "included_el",
] as const satisfies readonly (keyof TripFormValues)[];

type Props = { tripId: string; open: boolean; onClose: () => void };

const defaultForm = (): TripFormValues => ({
  title_el: "",
  location_el: "",
  country_el: "",
  type_el: "",
  category_el: "",
  transport_mode_slugs: [],
  date_range_el: "",
  departure_city_el: "",
  description_el: "",
  program_el: [{ days: "1", title: "", description: "" }],
  included_el: [],
  tags_el: [],
  title: "",
  description: "",
  location: "",
  country: "",
  type: "",
  category: "",
  date_range: "",
  departure_city: "",
  program: [],
  included: [],
  tags: [],
  image: null,
  price_num: null,
  duration_days: null,
});

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
    defaultValues: defaultForm(),
  });

  useEffect(() => {
    if (open) setTab("el");
  }, [open, tripId]);

  useEffect(() => {
    const row = q.data;
    if (!row) return;
    const priceRaw = row.price_num;
    const durRaw = row.duration_days;
    let programEl = programDbToFormSteps(row.program_el);
    if (programEl.length === 0) {
      programEl = [{ days: "1", title: "", description: "" }];
    }
    let programEn = programDbToFormSteps(row.program);
    reset({
      title_el: String(row.title_el ?? ""),
      location_el: String(row.location_el ?? ""),
      country_el: String(row.country_el ?? ""),
      type_el: String(row.type_el ?? ""),
      category_el: String(row.category_el ?? ""),
      transport_mode_slugs: mergeTransportSlugsFromColumns(
        String(row.transport_el ?? ""),
        String(row.transport ?? ""),
      ),
      date_range_el: String(row.date_range_el ?? ""),
      departure_city_el: String(row.departure_city_el ?? ""),
      description_el: asHtml(row.description_el),
      program_el: programEl,
      included_el: stringListDbToForm(row.included_el),
      tags_el: stringListDbToForm(row.tags_el),
      title: String(row.title ?? ""),
      description: asHtml(row.description),
      location: String(row.location ?? ""),
      country: String(row.country ?? ""),
      type: String(row.type ?? ""),
      category: String(row.category ?? ""),
      date_range: String(row.date_range ?? ""),
      departure_city: String(row.departure_city ?? ""),
      program: programEn,
      included: stringListDbToForm(row.included),
      tags: stringListDbToForm(row.tags),
      image: (row.image as string | null) ?? null,
      price_num: typeof priceRaw === "number" && Number.isFinite(priceRaw) ? priceRaw : null,
      duration_days:
        typeof durRaw === "number" && Number.isFinite(durRaw) ? Math.trunc(durRaw) : null,
    });
  }, [q.data, reset]);

  const save = useMutation({
    mutationFn: async (values: TripFormValues) => {
      const progEn = values.program.filter(
        (s) => s.title.trim().length > 0 || s.description.trim().length > 0,
      );
      const incEn = values.included.map((s) => s.trim()).filter(Boolean);
      const tagsEn = values.tags.map((s) => s.trim()).filter(Boolean);
      const tagsEl = values.tags_el.map((s) => s.trim()).filter(Boolean);
      const slugs = values.transport_mode_slugs;
      await putTrip(tripId, {
        title: values.title.trim() || null,
        title_el: values.title_el.trim(),
        location: values.location.trim() || null,
        location_el: values.location_el.trim(),
        country: values.country.trim() || null,
        country_el: values.country_el.trim(),
        type: values.type.trim() || null,
        type_el: values.type_el.trim(),
        category: values.category.trim() || null,
        category_el: values.category_el.trim(),
        transport: slugsToCsvEn(slugs),
        transport_el: slugsToCsvEl(slugs),
        date_range: values.date_range.trim() || null,
        date_range_el: values.date_range_el.trim(),
        departure_city: values.departure_city.trim() || null,
        departure_city_el: values.departure_city_el.trim(),
        description: values.description.trim() ? values.description : null,
        description_el: values.description_el || null,
        program_el: formStepsToDbPayload(values.program_el),
        program: progEn.length > 0 ? formStepsToDbPayload(progEn) : null,
        included_el: values.included_el.map((s) => s.trim()).filter(Boolean),
        included: incEn.length > 0 ? incEn : null,
        tags_el: tagsEl,
        tags: tagsEn.length > 0 ? tagsEn : null,
        price_num: values.price_num,
        duration_days: values.duration_days,
        image: values.image,
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
        if (name === "title_el" || name === "transport_mode_slugs") {
          setFocus(name);
        }
        document
          .getElementById(`trip-field-${name}`)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }
      if (errs.program) {
        setTab("en");
        document
          .getElementById("trip-field-program")
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  };

  const fieldClass = (name: keyof TripFormValues) =>
    cn(errors[name] && "rounded-xl ring-2 ring-destructive/50 border-destructive/40");

  type GreekTextKey =
    | "location_el"
    | "country_el"
    | "type_el"
    | "category_el"
    | "date_range_el"
    | "departure_city_el";

  const GreekTextField = ({
    name,
    sectionId,
    label,
  }: {
    name: GreekTextKey;
    sectionId: string;
    label: string;
  }) => {
    const inputId = `inp-${name}`;
    return (
      <div className={cn(fieldClass(name), "space-y-2")} id={sectionId}>
        <Label htmlFor={inputId}>{label}</Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input id={inputId} className="mt-1.5" {...field} value={field.value} autoComplete="off" />
          )}
        />
        {errors[name] ? (
          <p className="mt-1 text-xs text-destructive">{(errors[name] as { message?: string })?.message}</p>
        ) : null}
      </div>
    );
  };

  type EnTextKey = "location" | "country" | "type" | "category" | "date_range" | "departure_city";

  const EnglishTextField = ({
    name,
    sectionId,
    label,
  }: {
    name: EnTextKey;
    sectionId: string;
    label: string;
  }) => {
    const inputId = `inp-${name}`;
    return (
      <div className={cn(fieldClass(name), "space-y-2")} id={sectionId}>
        <Label htmlFor={inputId}>{label}</Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input id={inputId} className="mt-1.5" {...field} value={field.value} autoComplete="off" />
          )}
        />
      </div>
    );
  };

  const programEditorProps = {
    addDayLabel: t("admin.tripAddDay"),
    removeDayAriaLabel: t("admin.tripRemoveDay"),
    daysFieldLabel: t("admin.tripProgramDays"),
    daysPlaceholder: t("admin.tripDaysPlaceholder"),
    dayTitleLabel: t("admin.tripDayTitle"),
    dayDescriptionLabel: t("admin.tripDayDescription"),
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] flex max-h-[90vh] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-elev3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100">
          <div className="shrink-0 border-b border-slate-100 px-6 pb-4 pt-6 dark:border-white/5">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
              {t("admin.editTrip")}
            </Dialog.Title>
            <Dialog.Description className="sr-only">{t("admin.editTrip")}</Dialog.Description>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
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
                  <div className="space-y-2">
                    <Label htmlFor="trip-price">{t("admin.tripPriceNum")}</Label>
                    <Controller
                      name="price_num"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="trip-price"
                          type="number"
                          inputMode="decimal"
                          step="any"
                          min={0}
                          className="mt-1.5"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              field.onChange(null);
                              return;
                            }
                            const n = Number(v);
                            field.onChange(Number.isFinite(n) ? n : null);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trip-duration">{t("admin.tripDurationDays")}</Label>
                    <Controller
                      name="duration_days"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="trip-duration"
                          type="number"
                          inputMode="numeric"
                          step={1}
                          min={0}
                          className="mt-1.5"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            if (v === "") {
                              field.onChange(null);
                              return;
                            }
                            const n = Math.trunc(Number(v));
                            field.onChange(Number.isFinite(n) ? n : null);
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="mt-8">
                  <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-auto">
                    <TabsTrigger value="el">{t("admin.tabGreek")}</TabsTrigger>
                    <TabsTrigger value="en">{t("admin.tabEnglish")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="el" forceMount className="data-[state=inactive]:hidden">
                    <div className="space-y-5 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className={fieldClass("title_el")} id="trip-field-title_el">
                          <Label htmlFor="inp-title_el">{t("admin.titleEl")}</Label>
                          <Controller
                            name="title_el"
                            control={control}
                            render={({ field }) => (
                              <Input id="inp-title_el" className="mt-1.5" {...field} autoComplete="off" />
                            )}
                          />
                          {errors.title_el ? (
                            <p className="mt-1 text-xs text-destructive">{errors.title_el.message}</p>
                          ) : null}
                        </div>
                        <GreekTextField
                          name="location_el"
                          sectionId="trip-field-location_el"
                          label={t("admin.tripLocationEl")}
                        />
                        <GreekTextField
                          name="country_el"
                          sectionId="trip-field-country_el"
                          label={t("admin.tripCountryEl")}
                        />
                        <GreekTextField
                          name="type_el"
                          sectionId="trip-field-type_el"
                          label={t("admin.tripTypeEl")}
                        />
                        <GreekTextField
                          name="category_el"
                          sectionId="trip-field-category_el"
                          label={t("admin.tripCategoryEl")}
                        />
                        <div
                          className={cn(fieldClass("transport_mode_slugs"), "space-y-2 sm:col-span-2")}
                          id="trip-field-transport_mode_slugs"
                        >
                          <Label htmlFor="trip-transport-el">{t("admin.tripTransportEl")}</Label>
                          <Controller
                            name="transport_mode_slugs"
                            control={control}
                            render={({ field }) => (
                              <TransportMultiSelect
                                ref={field.ref}
                                id="trip-transport-el"
                                value={field.value}
                                onChange={field.onChange}
                                lang="gr"
                                placeholder={t("admin.transportPlaceholder")}
                                menuLabel={t("admin.transportMenu")}
                                aria-invalid={!!errors.transport_mode_slugs}
                              />
                            )}
                          />
                          {errors.transport_mode_slugs ? (
                            <p className="mt-1 text-xs text-destructive">
                              {(errors.transport_mode_slugs as { message?: string }).message}
                            </p>
                          ) : null}
                        </div>
                        <GreekTextField
                          name="date_range_el"
                          sectionId="trip-field-date_range_el"
                          label={t("admin.tripDateRangeEl")}
                        />
                        <GreekTextField
                          name="departure_city_el"
                          sectionId="trip-field-departure_city_el"
                          label={t("admin.tripDepartureCityEl")}
                        />
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
                        <Label className="mb-2 block">{t("admin.tripProgramTimeline")}</Label>
                        <Controller
                          name="program_el"
                          control={control}
                          render={({ field }) => (
                            <ProgramTimelineEditor
                              value={field.value as ProgramFormStep[]}
                              onChange={field.onChange}
                              {...programEditorProps}
                            />
                          )}
                        />
                        {errors.program_el ? (
                          <p className="mt-1 text-xs text-destructive">
                            {(errors.program_el as { message?: string }).message}
                          </p>
                        ) : null}
                      </div>
                      <div className={fieldClass("included_el")} id="trip-field-included_el">
                        <Label>{t("admin.tripIncludedEl")}</Label>
                        <Controller
                          name="included_el"
                          control={control}
                          render={({ field }) => (
                            <StringArrayField
                              className="mt-1.5"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t("admin.tripArrayHint")}
                            />
                          )}
                        />
                        {errors.included_el ? (
                          <p className="mt-1 text-xs text-destructive">
                            {(errors.included_el as { message?: string }).message}
                          </p>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.tripTagsEl")}</Label>
                        <Controller
                          name="tags_el"
                          control={control}
                          render={({ field }) => (
                            <StringArrayField
                              className="mt-1.5"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t("admin.tripArrayHint")}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="en" forceMount className="data-[state=inactive]:hidden">
                    <div className="space-y-5 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className={fieldClass("title")} id="trip-field-title">
                          <Label htmlFor="trip-title-en">{t("admin.titleEn")}</Label>
                          <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                              <Input id="trip-title-en" className="mt-1.5" {...field} autoComplete="off" />
                            )}
                          />
                        </div>
                        <EnglishTextField
                          name="location"
                          sectionId="trip-field-location"
                          label={t("admin.tripLocationEn")}
                        />
                        <EnglishTextField
                          name="country"
                          sectionId="trip-field-country"
                          label={t("admin.tripCountryEn")}
                        />
                        <EnglishTextField
                          name="type"
                          sectionId="trip-field-type"
                          label={t("admin.tripTypeEn")}
                        />
                        <EnglishTextField
                          name="category"
                          sectionId="trip-field-category"
                          label={t("admin.tripCategoryEn")}
                        />
                        <div
                          className={cn(fieldClass("transport_mode_slugs"), "space-y-2 sm:col-span-2")}
                          id="trip-field-transport_mode_slugs-en"
                        >
                          <Label htmlFor="trip-transport-en">{t("admin.tripTransportEn")}</Label>
                          <Controller
                            name="transport_mode_slugs"
                            control={control}
                            render={({ field }) => (
                              <TransportMultiSelect
                                ref={field.ref}
                                id="trip-transport-en"
                                value={field.value}
                                onChange={field.onChange}
                                lang="en"
                                placeholder={t("admin.transportPlaceholder")}
                                menuLabel={t("admin.transportMenu")}
                                aria-invalid={!!errors.transport_mode_slugs}
                              />
                            )}
                          />
                          {errors.transport_mode_slugs ? (
                            <p className="mt-1 text-xs text-destructive">
                              {(errors.transport_mode_slugs as { message?: string }).message}
                            </p>
                          ) : null}
                        </div>
                        <EnglishTextField
                          name="date_range"
                          sectionId="trip-field-date_range"
                          label={t("admin.tripDateRangeEn")}
                        />
                        <EnglishTextField
                          name="departure_city"
                          sectionId="trip-field-departure_city"
                          label={t("admin.tripDepartureCityEn")}
                        />
                      </div>
                      <div className={fieldClass("description")} id="trip-field-description">
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
                      <div className={fieldClass("program")} id="trip-field-program">
                        <Label className="mb-2 block">{t("admin.programEn")}</Label>
                        <Controller
                          name="program"
                          control={control}
                          render={({ field }) => (
                            <ProgramTimelineEditor
                              value={field.value as ProgramFormStep[]}
                              onChange={field.onChange}
                              {...programEditorProps}
                            />
                          )}
                        />
                        {errors.program ? (
                          <p className="mt-1 text-xs text-destructive">
                            {(errors.program as { message?: string }).message}
                          </p>
                        ) : null}
                      </div>
                      <div className={fieldClass("included")} id="trip-field-included">
                        <Label>{t("admin.tripIncludedEn")}</Label>
                        <Controller
                          name="included"
                          control={control}
                          render={({ field }) => (
                            <StringArrayField
                              className="mt-1.5"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t("admin.tripArrayHint")}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("admin.tripTagsEn")}</Label>
                        <Controller
                          name="tags"
                          control={control}
                          render={({ field }) => (
                            <StringArrayField
                              className="mt-1.5"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder={t("admin.tripArrayHint")}
                            />
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
