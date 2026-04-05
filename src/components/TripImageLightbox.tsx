import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ProgressiveImage from "@/components/ProgressiveImage";
import { useScrollLock } from "@/hooks/useScrollLock";

export type TripImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  slides: string[];
  initialIndex: number;
  alt: string;
  prevLabel: string;
  nextLabel: string;
  closeLabel: string;
};

export function TripImageLightbox({
  open,
  onClose,
  slides,
  initialIndex,
  alt,
  prevLabel,
  nextLabel,
  closeLabel,
}: TripImageLightboxProps) {
  const slidesKey = slides.join("|");
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: slides.length > 1,
    align: "center",
    duration: 28,
  });
  const [selected, setSelected] = useState(0);

  useScrollLock(open);

  useEffect(() => {
    if (!emblaApi || !open) return;
    emblaApi.reInit();
    const i = Math.min(Math.max(0, initialIndex), Math.max(0, slides.length - 1));
    emblaApi.scrollTo(i, true);
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi, slidesKey, slides.length, initialIndex, open]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose, emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (slides.length === 0 || typeof document === "undefined") return null;

  const total = slides.length;
  const progress = total > 0 ? ((selected + 1) / total) * 100 : 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[500] flex flex-col bg-black/75 backdrop-blur-xl"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 justify-end p-3 sm:p-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20"
                aria-label={closeLabel}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col px-2 pb-4 sm:px-6">
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={scrollPrev}
                  className="absolute left-1 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 sm:left-3"
                  aria-label={prevLabel}
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden />
                </button>
              )}
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={scrollNext}
                  className="absolute right-1 top-1/2 z-10 inline-flex -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 sm:right-3"
                  aria-label={nextLabel}
                >
                  <ChevronRight className="h-6 w-6" aria-hidden />
                </button>
              )}

              <div ref={emblaRef} className="min-h-0 flex-1 overflow-hidden">
                <div className="flex h-full touch-pan-y">
                  {slides.map((src) => (
                    <div
                      key={src}
                      className="min-w-0 shrink-0 grow-0 basis-full"
                    >
                      <div className="flex h-[min(72vh,820px)] w-full items-center justify-center px-1 sm:px-4">
                        <ProgressiveImage
                          src={src}
                          alt={alt}
                          width={1600}
                          height={1000}
                          sizes="100vw"
                          className="max-h-full max-w-full rounded-2xl"
                          imgClassName="object-contain"
                          priority
                          loading="eager"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col items-center gap-3 px-4">
                <p className="text-sm font-medium tabular-nums text-white/90">
                  {selected + 1} / {total}
                </p>
                <div className="h-1 w-full max-w-md overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full rounded-full bg-white/85"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
