import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Controller,
  useController,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { getAdminSeasonalConfigs, postTrip, putTrip } from "@/lib/adminApi";
import { isHtmlEmpty } from "@/lib/isHtmlEmpty";
import {
  formStepsToDbPayload,
  programDbToFormSteps,
  stringListDbToForm,
  type ProgramFormStep,
} from "@/lib/tripAdminForm";
import { mergeTransportSlugsFromColumns, slugsToLabelArray } from "@/lib/tripTransportModes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { TripImageDropzone } from "@/admin/components/TripImageDropzone";
import { TripGalleryGrid } from "@/admin/components/TripGalleryGrid";
import { ProgramTimelineEditor } from "@/admin/components/trip-edit/ProgramTimelineEditor";
import { StringArrayField } from "@/admin/components/trip-edit/StringArrayField";
import { TransportMultiSelect } from "@/admin/components/trip-edit/TransportMultiSelect";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function asHtml(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function coercePayloadNumber(n: number | null | undefined): number | null {
  if (n === null || n === undefined) return null;
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

function coercePayloadInt(n: number | null | undefined): number | null {
  if (n === null || n === undefined) return null;
  const x = Math.trunc(Number(n));
  return Number.isFinite(x) ? x : null;
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
  return z
    .object({
      title_el: z.string().trim().min(1, fieldReq),
      location_el: z.string().trim().min(1, fieldReq),
      country_el: z.string().trim().min(1, fieldReq),
      transport_mode_slugs: z.array(transportModeEnum).min(1, fieldReq),
      date_range_el: z.string().trim().min(1, fieldReq),
      departure_city_el: z.string().trim().min(1, fieldReq),
      description_el: z.string().refine((h) => !isHtmlEmpty(h), { message: richReq }),
      trip_notes_el: z.string(),
      program_el: z
        .array(programStepSchema)
        .min(1, t("admin.tripProgramMinDay"))
        .refine(
          (steps) => steps.some((s) => s.title.trim().length > 0 || !isHtmlEmpty(s.description)),
          { message: t("admin.tripProgramNeedsContent") },
        ),
      included_el: z
        .array(z.string())
        .min(1, fieldReq)
        .refine((arr) => arr.some((s) => s.trim().length > 0), { message: t("admin.tripIncludedMin") }),
      not_included_el: z.array(z.string()),
      tags_el: z.array(z.string()),

      hasEnglish: z.boolean(),
      status: z.enum(["active", "inactive"]),

      title: z.string(),
      description: z.string(),
      trip_notes: z.string(),
      location: z.string(),
      country: z.string(),
      date_range: z.string(),
      departure_city: z.string(),
      program: z.array(programStepSchema),
      included: z.array(z.string()),
      not_included: z.array(z.string()),
      tags: z.array(z.string()),

      image: z.string().nullable(),
      gallery: z.array(z.string()).max(4),
      price_num: z.number().nullable(),
      duration_days: z.number().int().nullable(),
      is_seasonal: z.boolean(),
      seasonal_name: z.string().nullable(),
    })
    .superRefine((data, ctx) => {
      if (data.is_seasonal && (!data.seasonal_name || !String(data.seasonal_name).trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("admin.tripSeasonalRequired"),
          path: ["seasonal_name"],
        });
      }
      if (!data.hasEnglish) return;
      if (!data.title.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: fieldReq, path: ["title"] });
      }
      if (isHtmlEmpty(data.description)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: richReq, path: ["description"] });
      }
      if (!data.location.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: fieldReq, path: ["location"] });
      }
      if (!data.country.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: fieldReq, path: ["country"] });
      }
    });
}

export type TripFormValues = z.infer<ReturnType<typeof buildTripFormSchema>>;

const GREEK_FIELD_ORDER = [
  "title_el",
  "location_el",
  "country_el",
  "transport_mode_slugs",
  "date_range_el",
  "departure_city_el",
  "description_el",
  "trip_notes_el",
  "program_el",
  "included_el",
  "not_included_el",
] as const satisfies readonly (keyof TripFormValues)[];

const ENGLISH_FIELD_ORDER = [
  "title",
  "location",
  "country",
  "date_range",
  "departure_city",
  "description",
  "trip_notes",
  "program",
  "included",
  "not_included",
] as const satisfies readonly (keyof TripFormValues)[];

export const ADMIN_TRIP_CREATE_ID = "new";

/** Greek/English tabs: full cell + brand purple active (overrides shared TabsTrigger dark zinc). */
const TRIP_LANG_TAB_TRIGGER_CLASS =
  "flex h-full min-h-0 w-full min-w-0 items-center justify-center px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground";

type Props = { tripId: string; open: boolean; onClose: () => void };

function buildTripPayload(values: TripFormValues) {
  const tagsEl = values.tags_el.map((s) => s.trim()).filter(Boolean);
  const notIncEl = values.not_included_el.map((s) => s.trim()).filter(Boolean);
  const slugs = values.transport_mode_slugs;
  const titleEl = values.title_el.trim();
  const base = {
    title_el: titleEl,
    location_el: values.location_el.trim(),
    country_el: values.country_el.trim(),
    transport: slugsToLabelArray(slugs, "en"),
    transport_el: slugsToLabelArray(slugs, "gr"),
    date_range_el: values.date_range_el.trim(),
    departure_city_el: values.departure_city_el.trim(),
    description_el: values.description_el || null,
    trip_notes_el: !isHtmlEmpty(values.trip_notes_el) ? values.trip_notes_el : null,
    program_el: formStepsToDbPayload(values.program_el),
    included_el: values.included_el.map((s) => s.trim()).filter(Boolean),
    not_included_el: notIncEl.length > 0 ? notIncEl : null,
    tags_el: tagsEl,
    price_num: coercePayloadNumber(values.price_num),
    duration_days: coercePayloadInt(values.duration_days),
    is_seasonal: values.is_seasonal,
    seasonal_name:
      values.is_seasonal && values.seasonal_name?.trim()
        ? values.seasonal_name.trim()
        : null,
    image: values.image,
    gallery: (() => {
      const g = values.gallery.map((s) => s.trim()).filter(Boolean).slice(0, 4);
      return g.length > 0 ? g : null;
    })(),
    status: values.status,
  };

  if (!values.hasEnglish) {
    return {
      ...base,
      title: titleEl || null,
      location: null,
      country: null,
      date_range: null,
      departure_city: null,
      description: null,
      program: null,
      included: null,
      not_included: null,
      tags: null,
      trip_notes: null,
    };
  }

  const titleEn = values.title.trim();
  const progEn = values.program.filter(
    (s) => s.title.trim().length > 0 || !isHtmlEmpty(s.description),
  );
  const incEn = values.included.map((s) => s.trim()).filter(Boolean);
  const notIncEn = values.not_included.map((s) => s.trim()).filter(Boolean);
  const tagsEn = values.tags.map((s) => s.trim()).filter(Boolean);
  return {
    ...base,
    title: titleEn || titleEl || null,
    location: values.location.trim() || null,
    country: values.country.trim() || null,
    date_range: values.date_range.trim() || null,
    departure_city: values.departure_city.trim() || null,
    description: !isHtmlEmpty(values.description) ? values.description : null,
    trip_notes: !isHtmlEmpty(values.trip_notes) ? values.trip_notes : null,
    program: progEn.length > 0 ? formStepsToDbPayload(progEn) : null,
    included: incEn.length > 0 ? incEn : null,
    not_included: notIncEn.length > 0 ? notIncEn : null,
    tags: tagsEn.length > 0 ? tagsEn : null,
  };
}

function deriveEnglishEnabledFromRow(row: Record<string, unknown>): boolean {
  if (String(row.title ?? "").trim()) return true;
  if (!isHtmlEmpty(asHtml(row.description))) return true;
  if (!isHtmlEmpty(asHtml(row.trip_notes))) return true;
  const programEn = programDbToFormSteps(row.program);
  if (programEn.some((s) => s.title.trim() || !isHtmlEmpty(s.description))) return true;
  const inc = stringListDbToForm(row.included);
  if (inc.some((s) => s.trim())) return true;
  if (String(row.location ?? "").trim() || String(row.country ?? "").trim()) return true;
  if (String(row.date_range ?? "").trim() || String(row.departure_city ?? "").trim()) return true;
  const tags = stringListDbToForm(row.tags);
  if (tags.some((s) => s.trim())) return true;
  return false;
}

const defaultForm = (): TripFormValues => ({
  title_el: "",
  location_el: "",
  country_el: "",
  transport_mode_slugs: [],
  date_range_el: "",
  departure_city_el: "",
  description_el: "",
  trip_notes_el: "",
  program_el: [{ days: "1", title: "", description: "" }],
  included_el: [],
  not_included_el: [],
  tags_el: [],
  hasEnglish: false,
  status: "inactive",
  title: "",
  description: "",
  trip_notes: "",
  location: "",
  country: "",
  date_range: "",
  departure_city: "",
  program: [{ days: "1", title: "", description: "" }],
  included: [],
  not_included: [],
  tags: [],
  image: null,
  gallery: [],
  price_num: null,
  duration_days: null,
  is_seasonal: false,
  seasonal_name: null,
});

export function TripEditDialog({ tripId, open, onClose }: Props) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tab, setTab] = useState<"el" | "en">("el");
  const langTabsScrollAnchorRef = useRef<HTMLDivElement>(null);
  const isCreate = tripId === ADMIN_TRIP_CREATE_ID;

  const handleLangTabChange = useCallback((next: string) => {
    if (next !== "el" && next !== "en") return;
    setTab(next);
    requestAnimationFrame(() => {
      langTabsScrollAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  const schema = useMemo(() => buildTripFormSchema(t), [t]);

  const q = useQuery({
    queryKey: ["admin-trip", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", tripId).single();
      if (error) throw error;
      return data as Record<string, unknown>;
    },
    enabled: open && !!tripId && !isCreate,
  });

  const seasonalConfigsQ = useQuery({
    queryKey: ["admin-seasonal-configs"],
    queryFn: getAdminSeasonalConfigs,
    enabled: open,
  });

  const {
    control,
    handleSubmit,
    reset,
    setFocus,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultForm(),
  });

  const {
    field: transportModeField,
    fieldState: { invalid: transportModeInvalid },
  } = useController({ name: "transport_mode_slugs", control });
  const { ref: transportModeRef, ...transportModeFieldRest } = transportModeField;

  const hasEnglishOn = useWatch({ control, name: "hasEnglish" });
  const isSeasonalOn = useWatch({ control, name: "is_seasonal" });

  const activeSeasonalConfigs =
    seasonalConfigsQ.data?.configs.filter((c) => c.is_active) ?? [];

  useEffect(() => {
    if (open) setTab("el");
  }, [open, tripId]);

  useEffect(() => {
    if (open && isCreate) {
      reset(defaultForm());
    }
  }, [open, isCreate, reset]);

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
    if (programEn.length === 0) {
      programEn = [{ days: "1", title: "", description: "" }];
    }
    const st = row.status;
    const statusVal = st === "active" ? "active" : "inactive";
    reset({
      title_el: String(row.title_el ?? ""),
      location_el: String(row.location_el ?? ""),
      country_el: String(row.country_el ?? ""),
      transport_mode_slugs: mergeTransportSlugsFromColumns(row.transport_el, row.transport),
      date_range_el: String(row.date_range_el ?? ""),
      departure_city_el: String(row.departure_city_el ?? ""),
      description_el: asHtml(row.description_el),
      trip_notes_el: asHtml(row.trip_notes_el),
      program_el: programEl,
      included_el: stringListDbToForm(row.included_el),
      not_included_el: stringListDbToForm(row.not_included_el),
      tags_el: stringListDbToForm(row.tags_el),
      hasEnglish: deriveEnglishEnabledFromRow(row),
      status: statusVal,
      title: String(row.title ?? ""),
      description: asHtml(row.description),
      trip_notes: asHtml(row.trip_notes),
      location: String(row.location ?? ""),
      country: String(row.country ?? ""),
      date_range: String(row.date_range ?? ""),
      departure_city: String(row.departure_city ?? ""),
      program: programEn,
      included: stringListDbToForm(row.included),
      not_included: stringListDbToForm(row.not_included),
      tags: stringListDbToForm(row.tags),
      image: (row.image as string | null) ?? null,
      gallery: stringListDbToForm(row.gallery).slice(0, 4),
      price_num: typeof priceRaw === "number" && Number.isFinite(priceRaw) ? priceRaw : null,
      duration_days:
        typeof durRaw === "number" && Number.isFinite(durRaw) ? Math.trunc(durRaw) : null,
      is_seasonal: Boolean(row.is_seasonal),
      seasonal_name:
        row.seasonal_name != null && String(row.seasonal_name).trim()
          ? String(row.seasonal_name).trim()
          : null,
    });
  }, [q.data, reset]);

  const save = useMutation({
    mutationFn: async (values: TripFormValues) => {
      const payload = buildTripPayload(values);
      if (isCreate) {
        await postTrip(payload);
      } else {
        await putTrip(tripId, payload);
      }
    },
    onSuccess: () => {
      toast.success(t("admin.tripSaved"));
      void qc.invalidateQueries({ queryKey: ["admin-trips"] });
      void qc.invalidateQueries({ queryKey: ["admin-seasonal-configs"] });
      void qc.invalidateQueries({ queryKey: ["seasonal-nav"] });
      if (!isCreate) {
        void qc.invalidateQueries({ queryKey: ["admin-trip", tripId] });
      }
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
    requestAnimationFrame(() => {
      for (const name of GREEK_FIELD_ORDER) {
        if (!errs[name]) continue;
        setTab("el");
        if (name === "title_el" || name === "transport_mode_slugs") {
          setFocus(name);
        }
        document
          .getElementById(`trip-field-${name}`)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }
      if (getValues("hasEnglish")) {
        for (const name of ENGLISH_FIELD_ORDER) {
          if (!errs[name]) continue;
          setTab("en");
          if (name === "title") setFocus("title");
          const id =
            name === "description"
              ? "trip-field-description"
              : name === "trip_notes"
                ? "trip-field-trip_notes"
                : name === "program"
                ? "trip-field-program"
                : name === "included"
                  ? "trip-field-included"
                  : name === "not_included"
                    ? "trip-field-not_included"
                    : `trip-field-${name}`;
          document.getElementById(id)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          return;
        }
      }
    });
  };

  const fieldClass = (name: keyof TripFormValues) =>
    cn(errors[name] && "rounded-xl ring-2 ring-destructive/50 border-destructive/40");

  const tripInputClass = "mt-1.5 min-h-11 text-base md:text-sm";

  type GreekTextKey = "location_el" | "country_el" | "date_range_el" | "departure_city_el";

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
            <Input id={inputId} className={tripInputClass} {...field} value={field.value} autoComplete="off" />
          )}
        />
        {errors[name] ? (
          <p className="mt-1 text-xs text-destructive">{(errors[name] as { message?: string })?.message}</p>
        ) : null}
      </div>
    );
  };

  type EnTextKey = "location" | "country" | "date_range" | "departure_city";

  const EnglishTextField = ({
    name,
    sectionId,
    label,
    disabled,
  }: {
    name: EnTextKey;
    sectionId: string;
    label: string;
    disabled?: boolean;
  }) => {
    const inputId = `inp-${name}`;
    return (
      <div className={cn(fieldClass(name), "space-y-2")} id={sectionId}>
        <Label htmlFor={inputId}>{label}</Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              id={inputId}
              className={tripInputClass}
              {...field}
              value={field.value}
              autoComplete="off"
              disabled={disabled}
            />
          )}
        />
      </div>
    );
  };

  const programEditorProps = {
    t,
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
        <Dialog.Content
          className={cn(
            "fixed z-[101] flex min-h-0 w-full flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 shadow-elev3 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100",
            "inset-0 h-[100dvh] max-h-none translate-none rounded-none",
            "pt-[env(safe-area-inset-top)]",
            "md:inset-auto md:left-1/2 md:top-1/2 md:h-auto md:max-h-[90vh] md:max-w-3xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pt-0",
          )}
        >
          <div className="relative shrink-0 border-b border-slate-100 px-6 pb-4 pt-4 pr-[4.5rem] dark:border-white/5 md:pt-6">
            <Dialog.Title className="pr-2 text-lg font-semibold leading-snug text-slate-900 dark:text-zinc-100">
              {isCreate ? t("admin.addTrip") : t("admin.editTrip")}
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              {isCreate ? t("admin.addTrip") : t("admin.editTrip")}
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-red-400 md:right-4 md:top-4"
                aria-label={t("admin.close")}
              >
                <X className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          {q.isLoading && !isCreate ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <Skeleton className="h-40 w-full bg-slate-200 dark:bg-zinc-800" />
            </div>
          ) : (
            <form
              className="flex min-h-0 flex-1 flex-col"
              onSubmit={handleSubmit(onValid, onInvalid)}
              noValidate
            >
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t("admin.mainPhotoFeatured")}</Label>
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t("admin.galleryPhotos")}</Label>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">{t("admin.galleryPhotosHint")}</p>
                    <Controller
                      name="gallery"
                      control={control}
                      render={({ field }) => (
                        <TripGalleryGrid
                          urls={field.value}
                          onChange={field.onChange}
                          dropHint={t("admin.tripGalleryDropHint")}
                          removeButtonLabel={t("admin.tripGalleryRemoveShort")}
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
                          className={tripInputClass}
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
                          className={tripInputClass}
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
                  <div className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950/50">
                    <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{t("admin.tripStatus")}</p>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                            {field.value === "inactive"
                              ? t("admin.tripStatusInactive")
                              : t("admin.tripStatusActive")}
                          </span>
                          <Switch
                            checked={field.value === "active"}
                            onCheckedChange={(on) => field.onChange(on ? "active" : "inactive")}
                            aria-label={t("admin.tripStatus")}
                          />
                        </div>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:col-span-2 dark:border-white/10 dark:bg-zinc-950/50">
                    {seasonalConfigsQ.isError ? (
                      <p className="text-xs text-destructive" role="alert">
                        {seasonalConfigsQ.error instanceof Error
                          ? seasonalConfigsQ.error.message
                          : String(seasonalConfigsQ.error)}
                      </p>
                    ) : null}
                    <div className="flex flex-row flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">
                        {t("admin.tripIsSeasonal")}
                      </p>
                      <Controller
                        name="is_seasonal"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
                              {field.value ? t("admin.tripStatusActive") : t("admin.tripStatusInactive")}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(on) => {
                                field.onChange(on);
                                if (!on) setValue("seasonal_name", null);
                              }}
                              aria-label={t("admin.tripIsSeasonal")}
                            />
                          </div>
                        )}
                      />
                    </div>
                    {isSeasonalOn ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className={cn(fieldClass("seasonal_name"), "min-w-0 flex-1 space-y-2")}>
                          <Label htmlFor="trip-seasonal-name">{t("admin.tripSeasonalName")}</Label>
                          <Controller
                            name="seasonal_name"
                            control={control}
                            render={({ field }) => (
                              <select
                                id="trip-seasonal-name"
                                className={cn(
                                  tripInputClass,
                                  "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm",
                                )}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(e.target.value ? e.target.value : null)
                                }
                              >
                                <option value="">{t("admin.tripSeasonalPlaceholder")}</option>
                                {activeSeasonalConfigs.map((c) => (
                                  <option key={c.seasonal_key} value={c.seasonal_key}>
                                    {c.nav_label_el} · {c.nav_label_en}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                          {errors.seasonal_name ? (
                            <p className="mt-1 text-xs text-destructive">
                              {errors.seasonal_name.message}
                            </p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0"
                          onClick={() => navigate("/admin/navigation")}
                        >
                          {t("admin.tripAddSeasonNav")}
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div
                  id="trip-edit-lang-tabs"
                  ref={langTabsScrollAnchorRef}
                  className="mt-8 scroll-mt-4"
                >
                  <Tabs value={tab} onValueChange={handleLangTabChange}>
                  <TabsList className="grid h-11 w-full grid-cols-2 gap-1 p-1">
                    <TabsTrigger className={TRIP_LANG_TAB_TRIGGER_CLASS} value="el">
                      {t("admin.tabGreek")}
                    </TabsTrigger>
                    <TabsTrigger className={TRIP_LANG_TAB_TRIGGER_CLASS} value="en">
                      {t("admin.tabEnglish")}
                    </TabsTrigger>
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
                              <Input id="inp-title_el" className={tripInputClass} {...field} autoComplete="off" />
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
                        <div
                          className={cn(fieldClass("transport_mode_slugs"), "space-y-2 sm:col-span-2")}
                          id="trip-field-transport_mode_slugs"
                        >
                          <Label htmlFor="trip-transport-el">{t("admin.tripTransportEl")}</Label>
                          <TransportMultiSelect
                            {...transportModeFieldRest}
                            ref={transportModeRef}
                            id="trip-transport-el"
                            lang="gr"
                            placeholder={t("admin.transportPlaceholder")}
                            menuLabel={t("admin.transportMenu")}
                            aria-invalid={transportModeInvalid}
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
                      <div className={fieldClass("trip_notes_el")} id="trip-field-trip_notes_el">
                        <Label>{t("admin.tripNotesEl")}</Label>
                        <Controller
                          name="trip_notes_el"
                          control={control}
                          render={({ field }) => (
                            <div className="mt-1.5">
                              <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                            </div>
                          )}
                        />
                        {errors.trip_notes_el ? (
                          <p className="mt-1 text-xs text-destructive">{errors.trip_notes_el.message}</p>
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
                      <div className={fieldClass("not_included_el")} id="trip-field-not_included_el">
                        <Label>{t("admin.tripNotIncludedEl")}</Label>
                        <Controller
                          name="not_included_el"
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
                        {errors.not_included_el ? (
                          <p className="mt-1 text-xs text-destructive">
                            {(errors.not_included_el as { message?: string }).message}
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
                      <div className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-zinc-950/50">
                        <div className="space-y-0.5">
                          <Label htmlFor="trip-has-english" className="text-sm font-medium">
                            {t("admin.tripEnableEnglish")}
                          </Label>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            {t("admin.tripEnableEnglishHint")}
                          </p>
                        </div>
                        <Controller
                          name="hasEnglish"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="trip-has-english"
                              checked={field.value}
                              onCheckedChange={(v) => {
                                field.onChange(v);
                                if (!v) {
                                  setFocus("title_el");
                                }
                              }}
                            />
                          )}
                        />
                      </div>
                      {hasEnglishOn ? (
                        <div className="space-y-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className={fieldClass("title")} id="trip-field-title">
                              <Label htmlFor="trip-title-en">{t("admin.titleEn")}</Label>
                              <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                  <Input id="trip-title-en" className={tripInputClass} {...field} autoComplete="off" />
                                )}
                              />
                              {errors.title ? (
                                <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>
                              ) : null}
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
                            <div
                              className={cn(
                                fieldClass("transport_mode_slugs"),
                                "space-y-2 sm:col-span-2",
                              )}
                              id="trip-field-transport_mode_slugs_en"
                            >
                              <Label htmlFor="trip-transport-en">{t("admin.tripTransportEn")}</Label>
                              <TransportMultiSelect
                                {...transportModeFieldRest}
                                id="trip-transport-en"
                                lang="en"
                                placeholder={t("admin.transportPlaceholder")}
                                menuLabel={t("admin.transportMenu")}
                                aria-invalid={transportModeInvalid}
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
                            {errors.description ? (
                              <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>
                            ) : null}
                          </div>
                          <div className={fieldClass("trip_notes")} id="trip-field-trip_notes">
                            <Label>{t("admin.tripNotesEn")}</Label>
                            <Controller
                              name="trip_notes"
                              control={control}
                              render={({ field }) => (
                                <div className="mt-1.5">
                                  <RichTextEditor value={field.value} onChange={field.onChange} t={t} />
                                </div>
                              )}
                            />
                            {errors.trip_notes ? (
                              <p className="mt-1 text-xs text-destructive">{errors.trip_notes.message}</p>
                            ) : null}
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
                            {errors.included ? (
                              <p className="mt-1 text-xs text-destructive">
                                {(errors.included as { message?: string }).message}
                              </p>
                            ) : null}
                          </div>
                          <div className={fieldClass("not_included")} id="trip-field-not_included">
                            <Label>{t("admin.tripNotIncludedEn")}</Label>
                            <Controller
                              name="not_included"
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
                            {errors.not_included ? (
                              <p className="mt-1 text-xs text-destructive">
                                {(errors.not_included as { message?: string }).message}
                              </p>
                            ) : null}
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
                      ) : null}
                    </div>
                  </TabsContent>
                </Tabs>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50/90 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-white/10 dark:bg-zinc-950/80 md:pb-4">
                <Button type="button" variant="outline" className="min-h-11 px-5" onClick={onClose}>
                  {t("admin.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="min-h-11 bg-primary px-5 text-primary-foreground hover:bg-primary/90"
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
