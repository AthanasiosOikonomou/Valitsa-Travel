import { ArrowRight, Info, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { getLocalizedTripContent, type Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import ProgressiveImage from "@/components/ProgressiveImage";

interface TripCardProps {
  trip: Trip;
  index: number;
  onClick: (trip: Trip) => void;
}

const TripCard = ({ trip, index, onClick }: TripCardProps) => {
  const { t, lang } = useLanguage();
  const localized = getLocalizedTripContent(trip, lang);
  const [isFlipped, setIsFlipped] = useState(false);

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
    >
      <div className="relative mb-5 aspect-[4/5] [perspective:1000px]">
        <div
          className={`relative h-full w-full transform-gpu transition-all duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsFlipped((prev) => !prev);
          }}
        >
          <div className="valitsa-card premium-panel-soft absolute inset-0 border-white/60 [backface-visibility:hidden]">
            <ProgressiveImage
              src={trip.image}
              alt={localized.title}
              width={1200}
              height={1500}
              sizes="(max-width: 768px) 400px, 800px"
              responsiveWidths={[320, 400, 640, 800, 960]}
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index < 4 ? "high" : "auto"}
              className="absolute inset-0"
              imgClassName="transition-all duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />

            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

            <div className="absolute left-5 top-5 z-20 flex gap-2">
              <span className="premium-chip border-white/45 bg-black/35 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {trip.price}
              </span>
              <span className="premium-chip border-white/45 bg-black/35 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                {localized.duration}
              </span>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-20 rounded-2xl border border-white/20 bg-black/40 p-4 shadow-xl backdrop-blur-md transition-all duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
              <div className="flex flex-col justify-end gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                  {trip.type}
                </p>
                <h3 className="text-[1.05rem] font-semibold leading-tight text-white line-clamp-2">
                  {localized.title}
                </h3>
                <div className="flex items-center gap-1.5 text-white/92">
                  <MapPin size={14} />
                  <span className="text-xs font-medium leading-tight line-clamp-1">
                    {localized.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="valitsa-card premium-panel-soft absolute inset-0 border-white/25 bg-black/40 p-5 shadow-xl backdrop-blur-md [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Info size={26} className="mb-4 text-white/80" />
              <p className="text-sm leading-relaxed text-white/92">
                {localized.description}
              </p>
              <button
                className="mt-7 inline-flex min-w-[136px] items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-white/65 bg-transparent px-4 py-2.5 text-xs font-semibold text-white/95 transition-all duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/10"
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
