import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Clock,
  Check,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Trip, TripFlightLeg, TripPricingSegment } from "@/types/Trip";
import { useLanguage } from "@/contexts/LanguageContext";
import { createInquiry } from "@/lib/inquiries";
import { toast } from "sonner";
import CaptchaField from "@/components/CaptchaField";
import ProgressiveImage from "@/components/ProgressiveImage";
import { useScrollLock } from "@/hooks/useScrollLock";
import ModalScrollUpButton from "@/components/ModalScrollUpButton";
import { formatTripDuration, formatTripPrice } from "@/lib/tripDisplay";
import {
  pickLocalizedProgram,
  pickLocalizedStringList,
} from "@/lib/tripLocaleArrays";
import {
  ItineraryTimeline,
  toItineraryItem,
} from "@/components/ItineraryTimeline";
import { SafeRichTextHtml } from "@/components/SafeRichTextHtml";
import { isHtmlEmpty } from "@/lib/isHtmlEmpty";
import {
  formatDaysForMonth,
  formatTripDepartureSummary,
  normalizeDepartureBlocks,
  formatMonthNameLong,
} from "@/lib/departureWindows";
import {
  effectiveTripListDuration,
  effectiveTripListPrice,
  normalizePricingSegments,
} from "@/lib/tripPricing";
import {
  flightLegHasContent,
  normalizeFlightDetails,
  shouldShowFlightDetails,
} from "@/lib/tripFlightDetails";
import { buildResponsiveImageSet, cn } from "@/lib/utils";

function segmentHeroPrice(s: TripPricingSegment): number | null {
  const candidates = [s.price_double, s.price_single, s.price_triple, s.price_child];
  for (const n of candidates) {
    if (n != null && Number.isFinite(n)) return n;
  }
  return null;
}

function PricingSegmentCard({
  segment: s,
  langKey,
  lang,
  t,
}: {
  segment: TripPricingSegment;
  langKey: "en" | "gr";
  lang: "en" | "gr";
  t: (key: string) => string;
}) {
  const hotel =
    langKey === "gr"
      ? String(s.hotel_el ?? s.hotel_en ?? "").trim()
      : String(s.hotel_en ?? s.hotel_el ?? "").trim();
  const daysText = formatDaysForMonth(s.days, langKey);
  const departuresLine = `${formatMonthNameLong(s.month, langKey)} · ${daysText}`;
  const hero = segmentHeroPrice(s);

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 font-semibold leading-snug text-foreground line-clamp-3">
          {hotel || "—"}
        </p>
        <p className="shrink-0 text-lg font-bold tabular-nums text-foreground">
          {formatTripPrice(hero, lang)}
        </p>
      </div>
      <div className="mt-3 space-y-2.5 text-sm">
        <div>
          <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
            {t("detail.pricingDepartures")}
          </p>
          <p className="mt-1 leading-snug text-foreground">{departuresLine}</p>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
            {t("detail.pricingDurationCol")}
          </span>
          <span className="text-right text-foreground">{formatTripDuration(s.duration_days, lang)}</span>
        </div>
        <div className="grid grid-cols-1 gap-3 border-t border-border/80 pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
              {t("detail.pricingDoubleCol")}
            </p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatTripPrice(s.price_double, lang)}
            </p>
          </div>
          <div>
            <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
              {t("detail.pricingSingleCol")}
            </p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatTripPrice(s.price_single, lang)}
            </p>
          </div>
          <div>
            <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
              {t("detail.pricingTripleCol")}
            </p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatTripPrice(s.price_triple, lang)}
            </p>
          </div>
          <div>
            <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
              {t("detail.pricingChildCol")}
            </p>
            <p className="mt-1 font-medium tabular-nums text-foreground">
              {formatTripPrice(s.price_child, lang)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlightLegCard({
  leg,
  lang,
  t,
}: {
  leg: TripFlightLeg;
  lang: "en" | "gr";
  t: (key: string) => string;
}) {
  const dep =
    lang === "gr"
      ? String(leg.departure_el || leg.departure_en || "").trim()
      : String(leg.departure_en || leg.departure_el || "").trim();
  const ret =
    lang === "gr"
      ? String(leg.return_el || leg.return_en || "").trim()
      : String(leg.return_en || leg.return_el || "").trim();
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="space-y-3 text-sm">
        <div>
          <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
            {t("detail.flightDepartureLabel")}
          </p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">{dep || "—"}</p>
        </div>
        <div>
          <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
            {t("detail.flightReturnLabel")}
          </p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">{ret || "—"}</p>
        </div>
      </div>
    </div>
  );
}

interface TripDetailProps {
  trip: Trip;
  onClose: () => void;
}

const tabKeys = ["description", "program", "included"] as const;

const gallerySpring = { type: "spring" as const, stiffness: 300, damping: 30 };

const TripDetail = ({ trip, onClose }: TripDetailProps) => {
  const [activeTab, setActiveTab] = useState<string>("description");
  const { t, lang } = useLanguage();

  const getDetailField = (field: string) => {
    if (
      lang === "gr" &&
      trip[`${field}_el` as keyof Trip] !== undefined &&
      trip[`${field}_el` as keyof Trip] !== null &&
      trip[`${field}_el` as keyof Trip] !== ""
    ) {
      return trip[`${field}_el` as keyof Trip] as string;
    }
    return trip[field as keyof Trip] as string;
  };
  useScrollLock(true);

  const panelRef = useRef<HTMLDivElement>(null);
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const requiresCaptcha = !import.meta.env.DEV;
  // Use direct trip fields from Supabase
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    message: "",
  });

  const galleryUrls = useMemo(
    () =>
      (trip.gallery ?? [])
        .map((s) => String(s).trim())
        .filter(Boolean)
        .slice(0, 4),
    [trip.gallery],
  );
  const mainUrl = trip.image?.trim() || null;

  const canonicalSlides = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    if (mainUrl) {
      seen.add(mainUrl);
      out.push(mainUrl);
    }
    for (const u of galleryUrls) {
      if (u && !seen.has(u)) {
        seen.add(u);
        out.push(u);
      }
    }
    if (!mainUrl && galleryUrls.length) {
      return galleryUrls.filter((u, i, a) => a.indexOf(u) === i);
    }
    return out;
  }, [mainUrl, galleryUrls]);

  /** Permutation of canonicalSlides for [main, …thumbs]; empty means use canonicalSlides. */
  const [galleryOrder, setGalleryOrder] = useState<string[]>([]);
  const [previewThumbIndex, setPreviewThumbIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    setPreviewThumbIndex(null);
    setGalleryOrder([]);
  }, [trip.id]);

  const displayOrder = useMemo(
    () => (galleryOrder.length > 0 ? galleryOrder : canonicalSlides),
    [galleryOrder, canonicalSlides],
  );

  const heroDisplayUrl = useMemo(() => {
    if (previewThumbIndex !== null) {
      const preview = displayOrder[previewThumbIndex + 1];
      if (preview) return preview;
    }
    return displayOrder[0] ?? null;
  }, [previewThumbIndex, displayOrder]);

  const activeCanonicalIndex = useMemo(() => {
    const main = displayOrder[0];
    if (!main) return 0;
    const idx = canonicalSlides.indexOf(main);
    return idx >= 0 ? idx : 0;
  }, [canonicalSlides, displayOrder]);

  const withDisplayBase = useCallback(
    (prev: string[]): string[] =>
      prev.length > 0 ? prev : [...canonicalSlides],
    [canonicalSlides],
  );

  const goPrevSlide = useCallback(() => {
    setGalleryOrder((prev) => {
      const base = withDisplayBase(prev);
      if (base.length <= 1) return base;
      const last = base[base.length - 1];
      return [last, ...base.slice(0, -1)];
    });
  }, [withDisplayBase]);

  const goNextSlide = useCallback(() => {
    setGalleryOrder((prev) => {
      const base = withDisplayBase(prev);
      if (base.length <= 1) return base;
      const [first, ...rest] = base;
      return [...rest, first];
    });
  }, [withDisplayBase]);

  useEffect(() => {
    if (canonicalSlides.length === 0) return;
    for (const src of canonicalSlides) {
      const { fallbackSrc } = buildResponsiveImageSet(src);
      const img = new Image();
      img.src = fallbackSrc;
    }
  }, [trip.id, canonicalSlides]);

  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const validatePhone = (val: string) => {
    const input = val.trim();
    if (!/^[+\d\s\-().]+$/.test(input)) return false;

    const digits = input.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  };

  const validateForm = () => {
    const errs = {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      message: "",
    };
    if (!formData.firstName.trim()) errs.firstName = t("validation.required");
    if (!formData.lastName.trim()) errs.lastName = t("validation.required");
    if (!formData.email.trim()) errs.email = t("validation.required");
    else if (!validateEmail(formData.email))
      errs.email = t("validation.emailInvalid");
    if (!formData.mobile.trim()) errs.mobile = t("validation.required");
    else if (!validatePhone(formData.mobile))
      errs.mobile = t("validation.phoneInvalid");
    if (!formData.message.trim()) errs.message = t("validation.required");
    else if (formData.message.trim().length < 10)
      errs.message = "Message must be at least 10 characters.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateForm();
    setFieldErrors(errs);
    if (errs.firstName) {
      firstNameRef.current?.focus();
      return;
    }
    if (errs.lastName) {
      lastNameRef.current?.focus();
      return;
    }
    if (errs.email) {
      emailRef.current?.focus();
      return;
    }
    if (errs.mobile) {
      mobileRef.current?.focus();
      return;
    }
    if (errs.message) {
      messageRef.current?.focus();
      return;
    }
    if (requiresCaptcha && !captchaToken) {
      setCaptchaError("Please complete CAPTCHA verification.");
      return;
    }

    setError("");
    setCaptchaError("");
    setIsSending(true);

    try {
      await createInquiry({
        source: "trip-detail",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        captchaToken: requiresCaptcha ? captchaToken : "dev-bypass",
        mobile: formData.mobile,
        message: formData.message,
        language: lang,
        tripId: trip.id,
        tripTitle: getDetailField("title"),
        tripLocation: getDetailField("location"),
        tripPrice: formatTripPrice(effectiveTripListPrice(trip), lang),
        tripUrl:
          typeof window !== "undefined"
            ? `${window.location.origin}/trips?trip=${trip.id}`
            : "",
        tripImage: trip.image ?? "",
      });

      setSubmitted(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        message: "",
      });
      setCaptchaToken("");
      toast.success(t("contact.sent"), { description: t("contact.sentDesc") });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("detail.sendFailed");
      setError(msg);
      toast.error(t("detail.sendFailed"), { description: msg });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateField = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const programSource = pickLocalizedProgram(
    lang,
    trip.program_el,
    trip.program,
  );

  const displayTags = pickLocalizedStringList(lang, trip.tags_el, trip.tags);

  const displayIncluded = pickLocalizedStringList(
    lang,
    trip.included_el,
    trip.included,
  );

  const displayNotIncluded = pickLocalizedStringList(
    lang,
    trip.not_included_el,
    trip.not_included,
  );

  const programItems = programSource
    .map((raw) => toItineraryItem(raw))
    .filter((item) => item.title || item.description);

  const scrollPanelSoTabsInView = useCallback(() => {
    const panel = panelRef.current;
    const tabsRow = tabsRowRef.current;
    if (!panel || !tabsRow) return;
    const relTop =
      tabsRow.getBoundingClientRect().top -
      panel.getBoundingClientRect().top +
      panel.scrollTop;
    const maxScroll = Math.max(0, panel.scrollHeight - panel.clientHeight);
    const target = Math.min(Math.max(0, relTop - 8), maxScroll);
    panel.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  const skipTabScrollEffectRef = useRef(true);
  useEffect(() => {
    if (skipTabScrollEffectRef.current) {
      skipTabScrollEffectRef.current = false;
      return;
    }
    const TAB_SWITCH_MS = 280;
    const id = window.setTimeout(() => {
      requestAnimationFrame(scrollPanelSoTabsInView);
    }, TAB_SWITCH_MS);
    return () => window.clearTimeout(id);
  }, [activeTab, scrollPanelSoTabsInView]);

  const handleTabClick = (tab: (typeof tabKeys)[number]) => {
    setActiveTab(tab);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      role="presentation"
      className="fixed inset-0 z-[260] overflow-hidden overscroll-none transform-gpu [backface-visibility:hidden]"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-black/50 backdrop-blur-md"
        aria-hidden
      />
      <div
        className="relative z-10 flex h-full min-h-0 w-full flex-col px-4 pt-24 pb-6 sm:pt-28 sm:pb-8"
        role="presentation"
        onClick={onClose}
      >
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="surface-elevated relative flex max-h-full min-h-0 w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] bg-background shadow-lg transform-gpu [backface-visibility:hidden]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] z-50 inline-flex min-h-[44px] min-w-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-full border-0 bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-transform duration-elev ease-material hover:scale-105 hover:bg-gray-100 active:scale-95 dark:bg-zinc-900/80 dark:hover:bg-zinc-800"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label={t("common.close")}
            >
              <X
                size={20}
                className="shrink-0 text-gray-800 dark:text-zinc-100"
                strokeWidth={2.25}
                aria-hidden
              />
            </button>
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                ref={panelRef}
                className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain rounded-[2rem]"
              >
                <div className="max-w-7xl mx-auto px-6 md:px-10 pt-8 pb-10 md:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                  <div className="min-w-0 lg:col-span-7">
                    <div className="mb-10 space-y-3 sm:space-y-4">
                      <div
                        className="relative w-full aspect-[16/10] overflow-hidden rounded-[2rem]"
                        role="region"
                        aria-roledescription="carousel"
                        aria-label={t("detail.galleryCarouselRegion")}
                      >
                        {canonicalSlides.length > 1 ? (
                          <span className="sr-only" aria-live="polite">
                            {activeCanonicalIndex + 1} /{" "}
                            {canonicalSlides.length}
                          </span>
                        ) : null}
                        {heroDisplayUrl ? (
                          <>
                            <div className="absolute inset-0">
                              <AnimatePresence mode="sync">
                                <motion.div
                                  key={heroDisplayUrl}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={gallerySpring}
                                  className="absolute inset-0"
                                >
                                  <ProgressiveImage
                                    src={heroDisplayUrl}
                                    alt={getDetailField("title") ?? ""}
                                    width={1600}
                                    height={1000}
                                    sizes="(max-width: 1024px) 100vw, 58vw"
                                    className="h-full w-full"
                                    imgClassName="object-cover"
                                    priority
                                    loading="eager"
                                    fetchPriority="high"
                                    responsiveWidths={[
                                      640, 800, 1024, 1280, 1600,
                                    ]}
                                  />
                                </motion.div>
                              </AnimatePresence>
                            </div>
                            <div
                              className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10"
                              aria-hidden
                            />
                            {canonicalSlides.length > 1 ? (
                              <div
                                className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5"
                                aria-hidden
                              >
                                {canonicalSlides.map((_, i) => (
                                  <span
                                    key={`gallery-dot-${i}`}
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full transition-[transform,background-color] duration-200 ease-out",
                                      i === activeCanonicalIndex
                                        ? "scale-125 bg-white shadow-sm"
                                        : "bg-white/45",
                                    )}
                                  />
                                ))}
                              </div>
                            ) : null}
                            {canonicalSlides.length > 1 ? (
                              <>
                                <button
                                  type="button"
                                  onClick={goPrevSlide}
                                  className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-background/85 text-foreground shadow-lg backdrop-blur-md transition hover:bg-background active:scale-95 sm:left-3 sm:h-12 sm:w-12"
                                  aria-label={t("detail.galleryPrev")}
                                >
                                  <ChevronLeft
                                    className="h-6 w-6"
                                    aria-hidden
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={goNextSlide}
                                  className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-background/85 text-foreground shadow-lg backdrop-blur-md transition hover:bg-background active:scale-95 sm:right-3 sm:h-12 sm:w-12"
                                  aria-label={t("detail.galleryNext")}
                                >
                                  <ChevronRight
                                    className="h-6 w-6"
                                    aria-hidden
                                  />
                                </button>
                              </>
                            ) : null}
                          </>
                        ) : (
                          <div
                            className="flex h-full min-h-[12rem] items-center justify-center rounded-[2rem] bg-muted"
                            aria-hidden
                          />
                        )}
                      </div>

                      {displayOrder.length > 1 && (
                        <div className="-mx-1 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden pb-1 pt-0.5 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-4 sm:gap-3 sm:overflow-visible md:gap-4">
                          {displayOrder.slice(1).map((url, thumbRowIndex) => {
                            const thumbCanonicalIdx =
                              canonicalSlides.indexOf(url);
                            const isActive =
                              previewThumbIndex === thumbRowIndex ||
                              (previewThumbIndex === null &&
                                thumbCanonicalIdx >= 0 &&
                                thumbCanonicalIdx === activeCanonicalIndex);
                            return (
                              <button
                                key={`slot-${thumbRowIndex}`}
                                type="button"
                                onClick={() => {
                                  setPreviewThumbIndex(null);
                                  setGalleryOrder((prev) => {
                                    const base = withDisplayBase(prev);
                                    if (thumbRowIndex + 1 >= base.length)
                                      return base;
                                    const next = [...base];
                                    [next[0], next[thumbRowIndex + 1]] = [
                                      next[thumbRowIndex + 1],
                                      next[0],
                                    ];
                                    return next;
                                  });
                                }}
                                onMouseEnter={() =>
                                  setPreviewThumbIndex(thumbRowIndex)
                                }
                                onMouseLeave={() => setPreviewThumbIndex(null)}
                                className={cn(
                                  "group relative aspect-square w-[3.75rem] shrink-0 snap-start overflow-hidden rounded-xl border bg-white/10 shadow-md ring-1 backdrop-blur-md transition-[box-shadow,border-color,transform] duration-200 ease-out [box-shadow:0_6px_24px_rgba(0,0,0,0.1)] dark:bg-white/5 sm:w-full sm:rounded-2xl sm:shadow-lg",
                                  isActive
                                    ? "scale-[1.03] border-primary/80 ring-2 ring-primary/45 ring-offset-2 ring-offset-background"
                                    : "border-white/25 ring-white/20 dark:border-white/15 dark:ring-white/10",
                                )}
                                aria-label={t("detail.galleryThumbPin")}
                              >
                                <ProgressiveImage
                                  src={url}
                                  alt=""
                                  width={256}
                                  height={256}
                                  sizes="80px"
                                  className="h-full"
                                  loading="eager"
                                  fetchPriority="low"
                                  imgClassName="scale-100 transition-transform duration-200 ease-out group-hover:scale-[1.06]"
                                />
                                <div
                                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 opacity-80 transition-opacity duration-200 group-hover:opacity-100"
                                  aria-hidden
                                />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.12,
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="flex items-center gap-4 text-foreground-muted text-sm mb-4">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} /> {getDetailField("location")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />{" "}
                          {formatTripDuration(trip.duration_days, lang)}
                        </span>
                      </div>

                      <h2 className="text-4xl md:text-5xl text-display mb-6">
                        {getDetailField("title")}
                      </h2>

                      <div className="flex gap-2 flex-wrap mb-10">
                        {displayTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-4 py-2 bg-muted rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Tabs */}
                      <div
                        ref={tabsRowRef}
                        className="mb-8 flex w-full min-w-0 flex-nowrap items-end justify-between border-b border-border px-2 sm:px-4"
                      >
                        {tabKeys.map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => handleTabClick(tab)}
                            className={`relative shrink-0 whitespace-nowrap px-1 py-2.5 text-center text-xs font-semibold transition-colors duration-250 sm:px-3 sm:py-3 sm:text-sm md:px-4 ${
                              activeTab === tab
                                ? "text-foreground"
                                : "text-foreground-muted hover:text-foreground"
                            }`}
                          >
                            {t(`detail.${tab}`)}
                            {activeTab === tab && (
                              <motion.div
                                layoutId="tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                transition={{
                                  duration: 0.25,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              />
                            )}
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${activeTab}-${lang}`}
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.98 }}
                          transition={{
                            duration: 0.22,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          {activeTab === "description" && (
                            <div className="space-y-8">
                              <SafeRichTextHtml
                                html={String(
                                  getDetailField("description") ?? "",
                                )}
                                className="text-body-prose text-lg leading-relaxed text-foreground"
                              />
                              {!isHtmlEmpty(
                                String(getDetailField("trip_notes") ?? ""),
                              ) ? (
                                <div className="space-y-4 border-t border-slate-200/90 pt-8 dark:border-white/10">
                                  <h3 className="label-ui text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                                    {t("detail.tripNotes")}
                                  </h3>
                                  <SafeRichTextHtml
                                    html={String(
                                      getDetailField("trip_notes") ?? "",
                                    )}
                                    className="text-body-prose text-lg leading-relaxed text-foreground"
                                  />
                                </div>
                              ) : null}
                              {(() => {
                                const langKey = lang === "gr" ? "gr" : "en";
                                const segments = normalizePricingSegments(trip.pricing_segments);
                                if (segments.length > 0) {
                                  return (
                                    <div className="space-y-4 border-t border-slate-200/90 pt-8 dark:border-white/10">
                                      <h3 className="label-ui text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                                        {t("detail.pricingSegmentsTitle")}
                                      </h3>
                                      <div className="space-y-3">
                                        {segments.map((s, idx) => (
                                          <PricingSegmentCard
                                            key={`${s.month}-${idx}`}
                                            segment={s}
                                            langKey={langKey}
                                            lang={lang}
                                            t={t}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                                const blocks = normalizeDepartureBlocks(trip);
                                const fallbackLine = formatTripDepartureSummary(trip, langKey);
                                if (blocks.length === 0 && !fallbackLine) return null;
                                return (
                                  <div className="space-y-4 border-t border-slate-200/90 pt-8 dark:border-white/10">
                                    <h3 className="label-ui text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                                      {t("detail.departureDates")}
                                    </h3>
                                    {blocks.length > 0 ? (
                                      <div className="overflow-x-auto rounded-xl border border-border">
                                        <table className="w-full min-w-[280px] border-collapse text-left text-base">
                                          <thead>
                                            <tr className="border-b border-border bg-muted/40">
                                              <th className="px-4 py-3 font-semibold text-foreground">
                                                {t("detail.departureDatesMonthCol")}
                                              </th>
                                              <th className="px-4 py-3 font-semibold text-foreground">
                                                {t("detail.departureDatesDaysCol")}
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {blocks.map((b) => {
                                              const manual =
                                                langKey === "gr"
                                                  ? String(b.label_el ?? "").trim()
                                                  : String(b.label_en ?? "").trim();
                                              const daysText = formatDaysForMonth(b.days, langKey);
                                              return (
                                                <tr
                                                  key={b.month}
                                                  className="border-b border-border last:border-b-0"
                                                >
                                                  <td className="px-4 py-3 align-top font-medium text-foreground">
                                                    {formatMonthNameLong(b.month, langKey)}
                                                  </td>
                                                  <td className="px-4 py-3 align-top text-foreground">
                                                    {manual ? (
                                                      <div className="space-y-1">
                                                        <p className="font-medium">{manual}</p>
                                                        <p className="text-sm text-foreground-muted">
                                                          {daysText}
                                                        </p>
                                                      </div>
                                                    ) : (
                                                      daysText
                                                    )}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    ) : (
                                      <p className="text-body-prose text-lg leading-relaxed text-foreground">
                                        {fallbackLine}
                                      </p>
                                    )}
                                  </div>
                                );
                              })()}
                              {shouldShowFlightDetails(trip) ? (
                                <div className="space-y-4 border-t border-slate-200/90 pt-8 dark:border-white/10">
                                  <h3 className="label-ui text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                                    {t("detail.flightDetailsTitle")}
                                  </h3>
                                  <div className="space-y-3">
                                    {normalizeFlightDetails(trip.flight_details)
                                      .filter(flightLegHasContent)
                                      .map((leg, idx) => (
                                        <FlightLegCard key={idx} leg={leg} lang={lang} t={t} />
                                      ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                          {activeTab === "program" && (
                            <ItineraryTimeline items={programItems} />
                          )}
                          {activeTab === "included" && (
                            <div className="space-y-8">
                              <ul className="space-y-3.5">
                                {displayIncluded.map((item, i) => (
                                  <li
                                    key={i}
                                    className="flex gap-3.5 items-start rounded-[1.15rem] border border-fuchsia-100/70 bg-gradient-to-r from-fuchsia-50/65 via-white to-white px-4 py-3.5 text-[0.92rem] leading-7 tracking-[-0.008em] text-foreground-muted dark:border-fuchsia-900/30 dark:from-fuchsia-950/20 dark:via-card dark:to-card"
                                  >
                                    <Check
                                      size={16}
                                      className="text-primary shrink-0 mt-1"
                                    />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                              {displayNotIncluded.length > 0 ? (
                                <div className="space-y-3.5">
                                  <p className="text-sm font-semibold text-foreground">
                                    {t("detail.notIncluded")}
                                  </p>
                                  <ul className="space-y-3.5">
                                    {displayNotIncluded.map((item, i) => (
                                      <li
                                        key={`ni-${i}`}
                                        className="flex gap-3.5 items-start rounded-[1.15rem] border border-red-200/80 bg-gradient-to-r from-red-50/80 via-white to-white px-4 py-3.5 text-[0.92rem] leading-7 tracking-[-0.008em] text-foreground-muted dark:border-red-900/35 dark:from-red-950/25 dark:via-card dark:to-card"
                                      >
                                        <XCircle
                                          size={16}
                                          className="text-destructive shrink-0 mt-1"
                                          strokeWidth={2.25}
                                          aria-hidden
                                        />
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Right column — sticky form */}
                  <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          delay: 0.16,
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="surface-elevated bg-card p-8 md:p-10 rounded-[2rem] shadow-md transform-gpu [backface-visibility:hidden]"
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <p className="label-ui text-foreground-muted mb-1">
                              {t("detail.startingFrom")}
                            </p>
                            <p className="text-3xl font-bold">
                              {formatTripPrice(effectiveTripListPrice(trip), lang)}
                            </p>
                          </div>
                          <span className="label-ui text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                            {formatTripDuration(effectiveTripListDuration(trip), lang)}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold mb-6">
                          {t("detail.expressInterest")}
                        </h3>

                        {submitted ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.22,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="text-center py-12"
                          >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <Check size={28} className="text-primary" />
                            </div>
                            <p className="font-semibold text-lg mb-1">
                              {t("detail.inquirySent")}
                            </p>
                            <p className="text-foreground-muted text-sm">
                              {t("detail.inquiryMsg")}
                            </p>
                          </motion.div>
                        ) : (
                          <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <input
                                  ref={firstNameRef}
                                  maxLength={100}
                                  value={formData.firstName}
                                  onChange={(e) => {
                                    updateField("firstName", e.target.value);
                                    if (fieldErrors.firstName)
                                      setFieldErrors((p) => ({
                                        ...p,
                                        firstName: "",
                                      }));
                                  }}
                                  className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                                    fieldErrors.firstName
                                      ? "input-elevated--invalid"
                                      : ""
                                  }`}
                                  placeholder={t("detail.firstName") + " *"}
                                />
                                {fieldErrors.firstName && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {fieldErrors.firstName}
                                  </p>
                                )}
                              </div>
                              <div>
                                <input
                                  ref={lastNameRef}
                                  maxLength={100}
                                  value={formData.lastName}
                                  onChange={(e) => {
                                    updateField("lastName", e.target.value);
                                    if (fieldErrors.lastName)
                                      setFieldErrors((p) => ({
                                        ...p,
                                        lastName: "",
                                      }));
                                  }}
                                  className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                                    fieldErrors.lastName
                                      ? "input-elevated--invalid"
                                      : ""
                                  }`}
                                  placeholder={t("detail.lastName") + " *"}
                                />
                                {fieldErrors.lastName && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {fieldErrors.lastName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <input
                                ref={emailRef}
                                inputMode="email"
                                autoComplete="email"
                                maxLength={255}
                                value={formData.email}
                                onChange={(e) => {
                                  updateField("email", e.target.value);
                                  if (fieldErrors.email)
                                    setFieldErrors((p) => ({
                                      ...p,
                                      email: "",
                                    }));
                                }}
                                className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                                  fieldErrors.email
                                    ? "input-elevated--invalid"
                                    : ""
                                }`}
                                placeholder={t("detail.email") + " *"}
                              />
                              {fieldErrors.email && (
                                <p className="text-xs text-red-500 mt-1">
                                  {fieldErrors.email}
                                </p>
                              )}
                            </div>
                            <div>
                              <input
                                ref={mobileRef}
                                inputMode="tel"
                                maxLength={20}
                                value={formData.mobile}
                                onChange={(e) => {
                                  updateField("mobile", e.target.value);
                                  if (fieldErrors.mobile)
                                    setFieldErrors((p) => ({
                                      ...p,
                                      mobile: "",
                                    }));
                                }}
                                className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                                  fieldErrors.mobile
                                    ? "input-elevated--invalid"
                                    : ""
                                }`}
                                placeholder={t("detail.mobile") + " *"}
                              />
                              {fieldErrors.mobile && (
                                <p className="text-xs text-red-500 mt-1">
                                  {fieldErrors.mobile}
                                </p>
                              )}
                            </div>
                            <textarea
                              ref={messageRef}
                              maxLength={1000}
                              value={formData.message}
                              onChange={(e) => {
                                updateField("message", e.target.value);
                                if (fieldErrors.message)
                                  setFieldErrors((p) => ({
                                    ...p,
                                    message: "",
                                  }));
                              }}
                              className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground h-28 resize-none ${
                                fieldErrors.message
                                  ? "input-elevated--invalid"
                                  : ""
                              }`}
                              placeholder={t("detail.message") + " *"}
                            />
                            {fieldErrors.message && (
                              <p className="text-xs text-red-500 mt-1">
                                {fieldErrors.message}
                              </p>
                            )}
                            {requiresCaptcha ? (
                              <CaptchaField
                                onTokenChange={(token) => {
                                  setCaptchaToken(token);
                                  if (captchaError && token)
                                    setCaptchaError("");
                                }}
                                error={captchaError}
                              />
                            ) : null}
                            <button
                              type="submit"
                              disabled={isSending}
                              aria-busy={isSending}
                              className="btn-elev-primary w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 min-h-[56px] disabled:opacity-60 disabled:pointer-events-none"
                            >
                              {isSending
                                ? t("detail.sending")
                                : t("detail.sendInquiry")}
                            </button>
                            {error && (
                              <p className="text-sm text-red-500" role="alert">
                                {error}
                              </p>
                            )}
                          </form>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
              <ModalScrollUpButton scrollContainerRef={panelRef} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TripDetail;
