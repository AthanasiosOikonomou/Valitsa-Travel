import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
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
      whileHover={{ y: -4, scale: 1.01 }}
      className="group cursor-pointer transform-gpu [backface-visibility:hidden] will-change-transform"
      onClick={() => onClick(trip)}
    >
      <div className="valitsa-card premium-panel-soft relative aspect-[4/5] mb-5 border-white/60 transform-gpu [backface-visibility:hidden] [contain:layout]">
        <ProgressiveImage
          src={trip.image}
          alt={localized.title}
          width={1200}
          height={1500}
          sizes="(max-width: 768px) 400px, 800px"
          responsiveWidths={[320, 400, 640, 800, 960]}
          loading="lazy"
          fetchPriority={index < 3 ? "low" : "auto"}
          className="absolute inset-0"
          imgClassName="transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />

        <div className="absolute top-5 left-5 flex gap-2">
          <span className="premium-chip px-4 py-1.5 text-xs font-semibold text-white">
            {trip.price}
          </span>
          <span className="premium-chip px-4 py-1.5 text-xs font-semibold text-white">
            {localized.duration}
          </span>
        </div>

        <div className="absolute inset-x-6 bottom-5 rounded-[1.35rem] bg-gradient-to-t from-black/70 via-black/52 to-black/30 px-4 py-4 opacity-100 transition-[transform,opacity] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-end backdrop-blur-[2px] shadow-[0_18px_34px_-24px_rgba(0,0,0,0.75)] transform-gpu [backface-visibility:hidden] group-hover:-translate-y-0.5">
          <p className="label-ui text-white mb-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {localized.location}
          </p>
          <h4 className="text-[1.28rem] text-display text-white mb-2.5 leading-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.88)]">
            {localized.title}
          </h4>
          <button className="premium-button-light w-full py-3.5 rounded-xl text-sm active:scale-[0.97] transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]">
            {t("grid.viewDetails")} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TripCard;
