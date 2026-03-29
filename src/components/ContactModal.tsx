import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  X,
  Phone,
  MessageSquare,
  Send,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { sendInquiryEmail } from "@/lib/email";
import CaptchaField from "@/components/CaptchaField";
import ModalScrollUpButton from "@/components/ModalScrollUpButton";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

const ContactModal = ({ open, onClose }: ContactModalProps) => {
  const { t } = useLanguage();
  useScrollLock(open);
  const requiresCaptcha = !import.meta.env.DEV;
  const [view, setView] = useState<"options" | "form">("options");
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    message: "",
  });

  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
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
      mobile: "",
      email: "",
      message: "",
    };
    if (!form.firstName.trim()) errs.firstName = t("validation.required");
    if (!form.lastName.trim()) errs.lastName = t("validation.required");
    if (!form.mobile.trim()) errs.mobile = t("validation.required");
    else if (!validatePhone(form.mobile))
      errs.mobile = t("validation.phoneInvalid");
    if (!form.email.trim()) errs.email = t("validation.required");
    else if (!validateEmail(form.email))
      errs.email = t("validation.emailInvalid");
    if (!form.message.trim()) errs.message = t("validation.required");
    else if (form.message.trim().length < 10)
      errs.message = "Message must be at least 10 characters.";
    return errs;
  };

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setView("options");
      setSent(false);
      setIsSending(false);
      setError("");
      setCaptchaToken("");
      setCaptchaError("");
      setFieldErrors({
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        message: "",
      });
    }, 300);
  }, [onClose]);

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
    if (errs.mobile) {
      mobileRef.current?.focus();
      return;
    }
    if (errs.email) {
      emailRef.current?.focus();
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
        source: "contact-modal",
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        captchaToken: requiresCaptcha ? captchaToken : "dev-bypass",
        mobile: form.mobile,
        message: form.message,
      });

      setSent(true);
      setForm({
        firstName: "",
        lastName: "",
        mobile: "",
        email: "",
        message: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("contact.sendFailed"));
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open || !sent) return;

    const timer = window.setTimeout(() => {
      handleClose();
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [open, sent, handleClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pb-4 pt-24 sm:pt-28 md:pt-28 backdrop-blur-md bg-black/50 overflow-hidden overscroll-none"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="surface-elevated bg-card rounded-3xl w-full max-w-lg max-h-[min(85dvh,900px)] flex flex-col overflow-hidden overscroll-y-contain my-auto transform-gpu [backface-visibility:hidden] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-bold">{t("contact.title")}</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-muted transition-[transform,background-color,opacity] [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] transform-gpu [backface-visibility:hidden] active:scale-[0.97]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <div
                ref={bodyScrollRef}
                className="h-full min-h-0 overflow-y-auto overscroll-y-contain"
              >
            <div className="p-6">
              {view === "options" && !sent && (
                <div className="space-y-4">
                  {/* Call Us */}
                  <a
                    href="tel:+302101234567"
                    className="surface-elevated-row flex items-center gap-4 p-5 rounded-2xl bg-card hover:bg-muted/50 transform-gpu [backface-visibility:hidden] will-change-transform group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t("contact.callUs")}</p>
                      <p className="text-foreground-muted text-sm">
                        +30 210 123 4567
                      </p>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/302101234567"
                    target="_blank"
                    rel="noreferrer"
                    className="surface-elevated-row flex items-center gap-4 p-5 rounded-2xl bg-card hover:bg-muted/50 transform-gpu [backface-visibility:hidden] will-change-transform group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {t("contact.whatsapp")}
                      </p>
                      <p className="text-foreground-muted text-sm">
                        {t("contact.whatsappDesc")}
                      </p>
                    </div>
                  </a>

                  {/* Viber */}
                  <a
                    href="viber://chat?number=%2B302101234567"
                    className="surface-elevated-row flex items-center gap-4 p-5 rounded-2xl bg-card hover:bg-muted/50 transform-gpu [backface-visibility:hidden] will-change-transform group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t("contact.viber")}</p>
                      <p className="text-foreground-muted text-sm">
                        {t("contact.viberDesc")}
                      </p>
                    </div>
                  </a>

                  {/* Send Message */}
                  <button
                    onClick={() => setView("form")}
                    className="surface-elevated-row w-full flex items-center gap-4 p-5 rounded-2xl bg-card hover:bg-muted/50 transform-gpu [backface-visibility:hidden] will-change-transform group text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">
                        {t("contact.sendMessage")}
                      </p>
                      <p className="text-foreground-muted text-sm">
                        {t("contact.sendMessageDesc")}
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {view === "form" && !sent && (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        ref={firstNameRef}
                        placeholder={t("detail.firstName") + " *"}
                        value={form.firstName}
                        onChange={(e) => {
                          setForm({ ...form, firstName: e.target.value });
                          if (fieldErrors.firstName)
                            setFieldErrors((p) => ({ ...p, firstName: "" }));
                        }}
                        className={`input-elevated w-full px-4 py-3 rounded-xl bg-background text-sm ${
                          fieldErrors.firstName ? "input-elevated--invalid" : ""
                        }`}
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
                        placeholder={t("detail.lastName") + " *"}
                        value={form.lastName}
                        onChange={(e) => {
                          setForm({ ...form, lastName: e.target.value });
                          if (fieldErrors.lastName)
                            setFieldErrors((p) => ({ ...p, lastName: "" }));
                        }}
                        className={`input-elevated w-full px-4 py-3 rounded-xl bg-background text-sm ${
                          fieldErrors.lastName ? "input-elevated--invalid" : ""
                        }`}
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
                      ref={mobileRef}
                      inputMode="tel"
                      placeholder={t("detail.mobile") + " *"}
                      value={form.mobile}
                      onChange={(e) => {
                        setForm({ ...form, mobile: e.target.value });
                        if (fieldErrors.mobile)
                          setFieldErrors((p) => ({ ...p, mobile: "" }));
                      }}
                      className={`input-elevated w-full px-4 py-3 rounded-xl bg-background text-sm ${
                        fieldErrors.mobile ? "input-elevated--invalid" : ""
                      }`}
                    />
                    {fieldErrors.mobile && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.mobile}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      ref={emailRef}
                      inputMode="email"
                      autoComplete="email"
                      placeholder={t("detail.email") + " *"}
                      value={form.email}
                      onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (fieldErrors.email)
                          setFieldErrors((p) => ({ ...p, email: "" }));
                      }}
                      className={`input-elevated w-full px-4 py-3 rounded-xl bg-background text-sm ${
                        fieldErrors.email ? "input-elevated--invalid" : ""
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <textarea
                      ref={messageRef}
                      placeholder={t("detail.message")}
                      value={form.message}
                      onChange={(e) => {
                        setForm({ ...form, message: e.target.value });
                        if (fieldErrors.message)
                          setFieldErrors((p) => ({ ...p, message: "" }));
                      }}
                      rows={4}
                      className={`input-elevated w-full px-4 py-3 rounded-xl bg-background text-sm resize-none ${
                        fieldErrors.message ? "input-elevated--invalid" : ""
                      }`}
                    />
                    {fieldErrors.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>
                  {requiresCaptcha ? (
                    <CaptchaField
                      onTokenChange={(token) => {
                        setCaptchaToken(token);
                        if (captchaError && token) setCaptchaError("");
                      }}
                      error={captchaError}
                    />
                  ) : null}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setView("options");
                        setFieldErrors({
                          firstName: "",
                          lastName: "",
                          mobile: "",
                          email: "",
                          message: "",
                        });
                      }}
                      className="btn-elev-muted px-5 py-3 rounded-xl text-sm font-medium hover:bg-muted transform-gpu [backface-visibility:hidden]"
                    >
                      {t("contact.back")}
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="btn-elev-inverse flex-1 flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl text-sm font-bold hover:opacity-90 transform-gpu [backface-visibility:hidden]"
                    >
                      <Send size={16} />
                      {isSending ? t("contact.sending") : t("contact.send")}
                    </button>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500" role="alert">
                      {error}
                    </p>
                  )}
                </form>
              )}

              {sent && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center py-8"
                >
                  <CheckCircle
                    size={48}
                    className="text-primary mx-auto mb-4"
                  />
                  <h3 className="text-lg font-bold mb-2">
                    {t("contact.sent")}
                  </h3>
                  <p className="text-foreground-muted text-sm">
                    {t("contact.sentDesc")}
                  </p>
                </motion.div>
              )}
            </div>
              </div>
              <ModalScrollUpButton scrollContainerRef={bodyScrollRef} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
