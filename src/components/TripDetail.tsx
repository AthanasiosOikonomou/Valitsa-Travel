import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Check, XCircle } from "lucide-react";
import type { Trip } from "@/types/Trip";
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

interface TripDetailProps {
  trip: Trip;
  onClose: () => void;
}

const tabKeys = ["description", "program", "included"] as const;

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
        tripPrice: formatTripPrice(trip.price_num, lang),
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
      const msg =
        err instanceof Error ? err.message : t("detail.sendFailed");
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
            <div className="relative w-full aspect-[16/10] rounded-[2rem] mb-10 overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <ProgressiveImage
                  src={trip.image}
                  alt={getDetailField("title") ?? ""}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="h-full"
                />
              </motion.div>
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
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {activeTab === "description" && (
                    <div className="space-y-8">
                      <SafeRichTextHtml
                        html={String(getDetailField("description") ?? "")}
                        className="text-body-prose text-lg leading-relaxed text-foreground"
                      />
                      {!isHtmlEmpty(String(getDetailField("trip_notes") ?? "")) ? (
                        <div className="space-y-4 border-t border-slate-200/90 pt-8 dark:border-white/10">
                          <h3 className="label-ui text-xs font-semibold uppercase tracking-[0.2em] text-foreground-muted">
                            {t("detail.tripNotes")}
                          </h3>
                          <SafeRichTextHtml
                            html={String(getDetailField("trip_notes") ?? "")}
                            className="text-body-prose text-lg leading-relaxed text-foreground"
                          />
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
                      {formatTripPrice(trip.price_num, lang)}
                    </p>
                  </div>
                  <span className="label-ui text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                    {formatTripDuration(trip.duration_days, lang)}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-6">
                  {t("detail.expressInterest")}
                </h3>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
                              setFieldErrors((p) => ({ ...p, firstName: "" }));
                          }}
                          className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                            fieldErrors.firstName ? "input-elevated--invalid" : ""
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
                              setFieldErrors((p) => ({ ...p, lastName: "" }));
                          }}
                          className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                            fieldErrors.lastName ? "input-elevated--invalid" : ""
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
                            setFieldErrors((p) => ({ ...p, email: "" }));
                        }}
                        className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                          fieldErrors.email ? "input-elevated--invalid" : ""
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
                            setFieldErrors((p) => ({ ...p, mobile: "" }));
                        }}
                        className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground ${
                          fieldErrors.mobile ? "input-elevated--invalid" : ""
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
                          setFieldErrors((p) => ({ ...p, message: "" }));
                      }}
                      className={`input-elevated w-full bg-muted p-4 rounded-2xl text-sm placeholder:text-muted-foreground h-28 resize-none ${
                        fieldErrors.message ? "input-elevated--invalid" : ""
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
                          if (captchaError && token) setCaptchaError("");
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
