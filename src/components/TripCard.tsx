import { MapPin, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

interface TripCardProps {
  trip: Trip;
  index: number;
  onClick: (trip: Trip) => void;
}

const TripCard = ({ trip, index, onClick }: TripCardProps) => {
  const { t } = useLanguage();

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
      <div className="valitsa-card relative aspect-[4/5] mb-5">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div className="absolute top-5 left-5 flex gap-2">
          <span className="glass rounded-full px-4 py-1.5 text-xs font-semibold text-white">
            {trip.price}
          </span>
          <span className="glass rounded-full px-4 py-1.5 text-xs font-semibold text-white">
            {trip.duration}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <button className="bg-white/95 text-foreground w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-white transition-colors">
            {t("grid.viewDetails")} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <h4 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors duration-250">
        {trip.title}
      </h4>
      <p className="text-foreground-muted text-sm flex items-center gap-1.5">
        <MapPin size={13} /> {trip.location}
      </p>
    </motion.div>
  );
};

export default TripCard;
