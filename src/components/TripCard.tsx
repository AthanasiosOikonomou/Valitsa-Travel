import { MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getLocalizedTripContent, type Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -6 }}
      className="group cursor-pointer"
      onClick={() => onClick(trip)}
    >
      <div className="valitsa-card premium-panel-soft relative aspect-[4/5] mb-5 border-white/60">
        <img
          src={trip.image}
          alt={localized.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div className="absolute top-5 left-5 flex gap-2">
          <span className="premium-chip px-4 py-1.5 text-xs font-semibold text-white">
            {trip.price}
          </span>
          <span className="premium-chip px-4 py-1.5 text-xs font-semibold text-white">
            {localized.duration}
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-[1.6rem] border border-white/20 bg-gradient-to-t from-black/70 via-black/45 to-transparent px-5 py-5 opacity-100 transition-all duration-300 flex flex-col justify-end backdrop-blur-[3px]">
          <p className="label-ui text-white/60 mb-2">{localized.location}</p>
          <h4 className="text-xl text-display text-white mb-3 leading-tight">
            {localized.title}
          </h4>
          <button className="premium-button-light w-full py-4 rounded-2xl text-sm">
            {t("grid.viewDetails")} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <h4 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors duration-250 line-clamp-2">
        {localized.title}
      </h4>
      <p className="text-foreground-muted text-sm flex items-center gap-1.5">
        <MapPin size={13} /> {localized.location}
      </p>
    </motion.div>
  );
};

export default TripCard;
