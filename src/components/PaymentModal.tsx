import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import ModalScrollUpButton from "@/components/ModalScrollUpButton";
import { paymentsEn, paymentsGr } from "@/content/payments";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

const paragraphClass =
  "text-body-prose text-justify text-[0.92rem] leading-relaxed text-foreground-muted md:text-[0.95rem]";

const lineClass =
  "text-[0.92rem] leading-relaxed text-foreground-muted md:text-[0.95rem]";

const monoValueClass = "font-mono text-[0.88rem] tracking-tight text-foreground";

const inlineLinkClass =
  "font-medium text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline";

function BankLine({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <p className={lineClass}>
      <span className="font-semibold text-foreground">{label}</span>{" "}
      <span className={mono ? monoValueClass : undefined}>{value}</span>
    </p>
  );
}

const PaymentModal = ({ open, onClose }: PaymentModalProps) => {
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  const isGreek = lang === "gr";
  const content = isGreek ? paymentsGr : paymentsEn;
  const closeLabel = isGreek ? "Κλείσιμο" : "Close";
  const importantIntro = isGreek
    ? "Μην ξεχάσετε στο καταθετήριο να συμπληρώσετε στην αιτιολογία:"
    : "Do not forget to include the following in the payment reference on your deposit slip:";

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden overscroll-none bg-black/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,calc(env(safe-area-inset-top)+4rem))] backdrop-blur-md md:pt-[max(1.25rem,calc(env(safe-area-inset-top)+7.25rem))] md:pb-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="surface-elevated flex max-h-[min(85vh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-8rem))] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-card shadow-lg transform-gpu [backface-visibility:hidden] md:max-h-[min(76vh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-10rem))] md:max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Helmet prioritizeSeoTags>
              <title>{`${content.modalTitle} | Valitsa Travel`}</title>
              <meta name="description" content={content.seoDescription} />
              <meta
                property="og:title"
                content={`${content.modalTitle} | Valitsa Travel`}
              />
              <meta property="og:description" content={content.seoDescription} />
              <meta
                name="twitter:title"
                content={`${content.modalTitle} | Valitsa Travel`}
              />
              <meta name="twitter:description" content={content.seoDescription} />
            </Helmet>

            <div className="flex shrink-0 items-center justify-between border-b border-border p-6">
              <h2 className="text-lg font-bold md:text-xl">
                {content.modalTitle}
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-[transform,background-color,opacity] [transition-duration:250ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] transform-gpu [backface-visibility:hidden] hover:bg-muted active:scale-[0.97]"
                aria-label={closeLabel}
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-y-contain p-6 md:p-7"
              >
                <p className={paragraphClass}>{content.intro}</p>

                <section className="space-y-3">
                  <p className={lineClass}>
                    <span className="font-semibold text-foreground">
                      {content.accountHolderLabel}
                    </span>{" "}
                    {content.accountHolderName}
                  </p>
                  <p className={lineClass}>{content.vatLine}</p>

                  <div className="space-y-2 border-t border-border/60 pt-4">
                    <BankLine
                      label={content.bankSection.bankLabel}
                      value={content.bankSection.bankName}
                    />
                    <BankLine
                      label={content.bankSection.accountNumberLabel}
                      value={content.bankSection.accountNumber}
                      mono
                    />
                    <BankLine
                      label={content.bankSection.ibanLabel}
                      value={content.bankSection.iban}
                      mono
                    />
                    <p className={lineClass}>{content.bankSection.swift}</p>
                  </div>
                </section>

                <section className="space-y-3 border-t border-border/60 pt-6">
                  <p className={paragraphClass}>{content.afterDepositIntro}</p>
                  <ul className="list-disc space-y-2 pl-5 text-[0.92rem] leading-relaxed text-foreground-muted md:text-[0.95rem]">
                    <li>
                      {content.notifyPhonePrefix}{" "}
                      <a href="tel:+302102606248" className={inlineLinkClass}>
                        {content.notifyPhone}
                      </a>
                    </li>
                    <li>
                      {content.notifyEmailPrefix}{" "}
                      <a
                        href={`mailto:${content.notifyEmail}`}
                        className={inlineLinkClass}
                      >
                        {content.notifyEmail}
                      </a>{" "}
                      {content.notifyEmailMiddle}{" "}
                      <a href="tel:+306937454193" className={inlineLinkClass}>
                        {content.notifyMobile}
                      </a>{" "}
                      {content.notifyMobileSuffix}
                    </li>
                  </ul>
                </section>

                <section className="space-y-3 border-t border-border/60 pt-6">
                  <p className={paragraphClass}>
                    <span className="font-semibold text-foreground">
                      {content.importantHeading}
                    </span>{" "}
                    {importantIntro}
                  </p>
                  <ol className="list-decimal space-y-1.5 pl-5 text-[0.92rem] leading-relaxed text-foreground-muted md:text-[0.95rem]">
                    {content.importantItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                  <p className={lineClass}>
                    <span className="font-semibold text-foreground">
                      {content.exampleLabel}
                    </span>{" "}
                    <span className="italic">{content.exampleText}</span>
                  </p>
                </section>
              </div>
              <ModalScrollUpButton scrollContainerRef={scrollRef} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
