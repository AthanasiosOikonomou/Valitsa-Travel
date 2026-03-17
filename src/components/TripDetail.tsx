import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Check } from "lucide-react";
import { getLocalizedTripContent, type Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendInquiryEmail } from "@/lib/email";
import CaptchaField from "@/components/CaptchaField";
import { optimizeImageUrl } from "@/lib/utils";

interface TripDetailProps {
  trip: Trip;
  onClose: () => void;
}

const tabKeys = ["description", "program", "included"] as const;

const formatProgramStep = (value: string) =>
  value.replace(/^((Day|Days|Ημέρα|Ημέρες)\s*\d+(?:[–-]\d+)?\s*[—:-]\s*)/i, "");

const splitProgramStep = (value: string) => {
  const richParts = value.split(/\s*\|\|\s*/);
  if (richParts.length > 1) {
    return {
      title: richParts[0].trim(),
      detail: richParts.slice(1).join(" ").trim(),
    };
  }

  const cleaned = formatProgramStep(value).trim();
  const parts = cleaned.split(/,\s+|·\s+|•\s+/);

  if (parts.length <= 1) {
    return { title: cleaned, detail: "" };
  }

  return {
    title: parts[0],
    detail: parts.slice(1).join(", "),
  };
};

const TripDetail = ({ trip, onClose }: TripDetailProps) => {
  const [activeTab, setActiveTab] = useState<string>("description");
  const { t, lang } = useLanguage();
  const requiresCaptcha = !import.meta.env.DEV;
  const localized = getLocalizedTripContent(trip, lang);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [detailImageLoaded, setDetailImageLoaded] = useState(false);
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
      await sendInquiryEmail({
        source: "trip-detail",
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        captchaToken: requiresCaptcha ? captchaToken : "dev-bypass",
        mobile: formData.mobile,
        message: formData.message,
        tripTitle: localized.title,
        tripLocation: localized.location,
        tripPrice: trip.price,
        tripUrl:
          typeof window !== "undefined"
            ? `${window.location.origin}/trips?trip=${trip.id}`
            : "",
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
    } catch (err) {
      setError(err instanceof Error ? err.message : t("detail.sendFailed"));
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto transform-gpu [backface-visibility:hidden]"
    >
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-[110] p-3.5 bg-foreground text-background rounded-full hover:opacity-90 transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu [backface-visibility:hidden] active:scale-[0.97]"
        aria-label={t("common.close")}
      >
        <X size={20} />
      </button>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="relative w-full aspect-[16/10] rounded-[2rem] mb-10 overflow-hidden">
            {!detailImageLoaded ? (
              <div className="absolute inset-0 animate-pulse bg-slate-200/75 dark:bg-slate-800/70" />
            ) : null}
            <motion.img
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              src={optimizeImageUrl(trip.image, 1600)}
              alt={localized.title}
              width={1600}
              height={1000}
              loading="lazy"
              decoding="async"
              onLoad={() => setDetailImageLoaded(true)}
              className={`w-full h-full object-cover ${detailImageLoaded ? "opacity-100" : "opacity-0"}`}
            />
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
                <MapPin size={14} /> {localized.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> {localized.duration}
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl text-display mb-6">
              {localized.title}
            </h2>

            <div className="flex gap-2 flex-wrap mb-10">
              {localized.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-muted rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 border-b border-border">
              {tabKeys.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-3 text-sm font-semibold transition-colors duration-250 ${
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
                key={activeTab}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "description" && (
                  <p className="text-body-prose text-lg leading-relaxed">
                    {localized.description}
                  </p>
                )}
                {activeTab === "program" && (
                  <ul className="space-y-0 pt-2">
                    {localized.program.map((day, i) => (
                      <li
                        key={i}
                        className="relative flex gap-5 items-start pb-10 last:pb-0"
                      >
                        {i < localized.program.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[0.45rem] top-7 bottom-0 border-l border-dashed border-fuchsia-300/80 dark:border-fuchsia-700/60"
                          />
                        )}
                        <span
                          aria-hidden="true"
                          className="relative z-10 mt-2 flex h-4 w-4 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-fuchsia-600 to-violet-700 shadow-[0_12px_26px_-16px_rgba(168,85,247,0.9)] ring-4 ring-fuchsia-100 dark:ring-fuchsia-950/50"
                        />
                        <div className="flex-1 border-b border-fuchsia-100/80 pb-8 last:border-b-0 dark:border-fuchsia-900/30">
                          <h4 className="text-[0.94rem] md:text-[0.98rem] font-semibold leading-6 tracking-[-0.012em] text-foreground mb-2">
                            {splitProgramStep(day).title}
                          </h4>
                          {splitProgramStep(day).detail && (
                            <p className="text-[0.9rem] leading-7 tracking-[-0.008em] text-foreground-muted">
                              {splitProgramStep(day).detail}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === "included" && (
                  <ul className="space-y-3.5">
                    {localized.included.map((item, i) => (
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
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right column — sticky form */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.16,
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-card border border-border p-8 md:p-10 rounded-[2rem] transform-gpu [backface-visibility:hidden]"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="label-ui text-foreground-muted mb-1">
                    {t("detail.startingFrom")}
                  </p>
                  <p className="text-3xl font-bold">{trip.price}</p>
                </div>
                <span className="label-ui text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  {localized.duration}
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
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                        className={`w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 transition-shadow ${
                          fieldErrors.firstName
                            ? "ring-2 ring-red-500/50 bg-red-500/5"
                            : "focus:ring-primary/30"
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
                        className={`w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 transition-shadow ${
                          fieldErrors.lastName
                            ? "ring-2 ring-red-500/50 bg-red-500/5"
                            : "focus:ring-primary/30"
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
                      className={`w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 transition-shadow ${
                        fieldErrors.email
                          ? "ring-2 ring-red-500/50 bg-red-500/5"
                          : "focus:ring-primary/30"
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
                      className={`w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground focus:ring-2 transition-shadow ${
                        fieldErrors.mobile
                          ? "ring-2 ring-red-500/50 bg-red-500/5"
                          : "focus:ring-primary/30"
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
                    className={`w-full bg-muted p-4 rounded-2xl outline-none text-sm placeholder:text-muted-foreground h-28 resize-none focus:ring-2 transition-shadow ${
                      fieldErrors.message
                        ? "ring-2 ring-red-500/50 bg-red-500/5"
                        : "focus:ring-primary/30"
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
                    className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-colors duration-250 min-h-[56px]"
                  >
                    {isSending ? t("detail.sending") : t("detail.sendInquiry")}
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
    </motion.div>
  );
};

export default TripDetail;
