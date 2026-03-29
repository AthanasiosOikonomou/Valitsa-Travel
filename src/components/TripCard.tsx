import { ArrowRight, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Trip } from "@/types/Trip";
import { useLanguage } from "@/contexts/LanguageContext";
import ProgressiveImage from "@/components/ProgressiveImage";

interface TripCardProps {
  trip: Trip;
  index: number;
  onClick: (trip: Trip) => void;
}

const TripCard = ({ trip, index, onClick }: TripCardProps) => {
  const { t, lang } = useLanguage();
  // Use direct trip fields from Supabase
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Helper to get the correct field for the current language
  const getField = (field: string) => {
    if (lang === "gr" && trip[`${field}_el`] !== undefined) {
      return trip[`${field}_el`] ?? trip[field];
    }
    return trip[field];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group cursor-pointer"
      onMouseEnter={() => {
        if (!isTouchDevice) {
          setIsFlipped(true);
        }
      }}
      onMouseLeave={() => {
        if (!isTouchDevice) {
          setIsFlipped(false);
        }
      }}
    >
      <div className="relative mb-5 aspect-[4/5] [perspective:1000px]">
        <div
          className={`relative h-full w-full transform-gpu transition-all [transition-duration:560ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          onPointerUp={(e) => {
            if (e.pointerType !== "touch") return;
            e.stopPropagation();
            setIsTouchDevice(true);
            setIsFlipped((prev) => !prev);
          }}
        >
          <div className="valitsa-card premium-panel-soft absolute inset-0 border-white/60 [backface-visibility:hidden]">
            <ProgressiveImage
              src={trip.image}
              alt={getField("title") ?? ""}
              width={1200}
              height={1500}
              sizes="(max-width: 768px) 400px, 800px"
              responsiveWidths={[320, 400, 640, 800, 960]}
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index < 4 ? "high" : "auto"}
              className="absolute inset-0"
              imgClassName="transition-all [transition-duration:560ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

            <div className="absolute left-5 top-5 z-20 flex gap-2">
              <span
                data-nosnippet
                className="premium-chip border-white/45 bg-black/35 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                {getField("price_text")}
              </span>
              <span
                data-nosnippet
                className="premium-chip border-white/45 bg-black/35 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                {getField("duration_text")}
              </span>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-white/20 bg-black/40 p-4 shadow-xl backdrop-blur-md transition-all [transition-duration:560ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
              <div className="flex flex-col h-full">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  {getField("type")}
                </p>
                <h3 className="text-display text-[1.05rem] font-semibold leading-tight text-white line-clamp-2">
                  {getField("title")}
                </h3>
                <div className="mt-5 flex w-full justify-end items-center gap-2 !text-white">
                  <MapPin size={16} />
                  <span className="text-sm font-medium leading-tight line-clamp-1">
                    {getField("location")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="valitsa-card premium-panel-soft absolute inset-0 overflow-hidden border-white/25 p-5 shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <ProgressiveImage
              src={trip.image}
              alt={getField("title") ?? ""}
              width={1200}
              height={1500}
              sizes="(max-width: 768px) 400px, 800px"
              responsiveWidths={[320, 400, 640, 800, 960]}
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index < 4 ? "high" : "auto"}
              className="absolute inset-0"
              imgClassName="scale-110 blur-[9px] brightness-[0.38]"
            />
            <div className="absolute inset-0 bg-black/45" />

            <div className="relative z-20 flex h-full flex-col items-center justify-center text-center">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                {t("card.trip")}
              </p>
              <h4 className="text-display mb-4 max-w-[90%] text-balance text-xl font-semibold leading-tight tracking-[-0.02em] text-white">
                {getField("title")}
              </h4>
              <p className="text-sm leading-relaxed !text-white">
                {getField("description")}
              </p>
              <button
                className="mt-7 inline-flex min-w-[136px] items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-white/65 bg-transparent px-4 py-2.5 text-xs font-semibold text-white/95 transition-all [transition-duration:560ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(trip);
                }}
              >
                {t("grid.viewDetails")}{" "}
                <ArrowRight size={12} className="inline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TripCard;
