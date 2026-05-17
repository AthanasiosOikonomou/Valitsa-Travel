import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import ModalScrollUpButton from "@/components/ModalScrollUpButton";
import { aboutEn, aboutGr } from "@/content/about";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const paragraphClass =
  "text-body-prose text-justify text-[0.92rem] leading-relaxed text-foreground-muted md:text-[0.95rem]";

const companyLineClass =
  "text-[0.92rem] leading-relaxed text-foreground-muted md:text-[0.95rem]";

const AboutModal = ({ open, onClose }: AboutModalProps) => {
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  const isGreek = lang === "gr";
  const content = isGreek ? aboutGr : aboutEn;
  const closeLabel = isGreek ? "Κλείσιμο" : "Close";
  const contactPrefix = isGreek ? "Τηλέφ.:" : "Tel.:";
  const contactEmailLabel = "Email:";

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
                className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-6 md:p-7"
              >
                <div className="space-y-3">
                  {content.paragraphs.map((paragraph, index) => (
                    <p key={index} className={paragraphClass}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <section className="mt-8 space-y-3 border-t border-border/60 pt-6">
                  <h3 className="label-ui text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                    {content.companyHeading}
                  </h3>
                  <div className="space-y-1">
                    {content.companyLines.map((line, index) => (
                      <p key={index} className={companyLineClass}>
                        {line}
                      </p>
                    ))}
                    <p className={companyLineClass}>
                      {contactPrefix}{" "}
                      <a
                        href="tel:+302102606248"
                        className="font-medium text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
                      >
                        {content.phone}
                      </a>{" "}
                      {contactEmailLabel}{" "}
                      <a
                        href={`mailto:${content.email}`}
                        className="font-medium text-foreground underline-offset-2 transition-colors hover:text-primary hover:underline"
                      >
                        {content.email}
                      </a>
                    </p>
                  </div>
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

export default AboutModal;
