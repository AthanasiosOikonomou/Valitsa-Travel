import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import ModalScrollUpButton from "@/components/ModalScrollUpButton";
import {
  termsEn,
  termsGr,
  type TermsBlock,
  type TermsContent,
} from "@/content/terms";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const paragraphClass =
  "text-body-prose text-justify text-[0.92rem] leading-relaxed text-foreground-muted md:text-[0.95rem]";

function TermsBlocks({ blocks }: { blocks: TermsBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index} className={paragraphClass}>
              {block.text}
            </p>
          );
        }
        return (
          <div key={index} className="space-y-3">
            <h4 className="label-ui mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-foreground-muted first:mt-0">
              {block.title}
            </h4>
            <TermsBlocks blocks={block.blocks} />
          </div>
        );
      })}
    </div>
  );
}

function TermsSections({
  sections,
}: {
  sections: TermsContent["sections"];
}) {
  return (
    <div className="space-y-8">
      {sections.map((section, index) => (
        <section
          key={section.id}
          className={
            index > 0 ? "space-y-3 border-t border-border/60 pt-6" : "space-y-3"
          }
        >
          <h3 className="text-sm font-bold tracking-[0.02em] text-foreground">
            {section.title}
          </h3>
          <TermsBlocks blocks={section.blocks} />
        </section>
      ))}
    </div>
  );
}

const TermsModal = ({ open, onClose }: TermsModalProps) => {
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollLock(open);
  const isGreek = lang === "gr";
  const content = isGreek ? termsGr : termsEn;
  const closeLabel = isGreek ? "Κλείσιμο" : "Close";

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
            className="surface-elevated flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-card shadow-lg transform-gpu [backface-visibility:hidden] md:max-h-[min(76vh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-10rem))] md:max-w-2xl max-h-[min(85vh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-8rem))]"
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
                <header className="mb-8 space-y-2">
                  <p className="label-ui text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                    Valitsa Travel
                  </p>
                  <p className="text-base font-bold leading-snug text-foreground md:text-lg">
                    {content.documentTitle}
                  </p>
                </header>

                <TermsSections sections={content.sections} />
              </div>
              <ModalScrollUpButton scrollContainerRef={scrollRef} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TermsModal;
