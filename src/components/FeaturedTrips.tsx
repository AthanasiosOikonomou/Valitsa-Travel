import { motion } from "framer-motion";
import { useTrips } from "@/hooks/useTrips";
import type { Trip } from "@/types/Trip";
import TripCard from "./TripCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeaturedTripsProps {
  onSelectTrip: (trip: Trip) => void;
}

const FeaturedTrips = ({ onSelectTrip }: FeaturedTripsProps) => {
  const { t } = useLanguage();
  const { trips, loading, error } = useTrips({ featured: true });

  return (
    <section className="max-w-7xl mx-auto py-24 px-6 md:px-10">
      <div className="mb-10 md:mb-12">
        <p className="label-ui text-primary mb-2">{t("featured.label")}</p>
        <h2 className="text-3xl md:text-4xl mb-3">{t("featured.title")}</h2>
        <p className="premium-subheading max-w-2xl text-sm md:text-base">
          {t("hero.subtitle")}
        </p>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {trips.map((trip, idx) => (
          <TripCard
            key={trip.id}
            trip={trip}
            index={idx}
            onClick={onSelectTrip}
          />
        ))}
      </motion.div>
    </section>
  );
};

export default FeaturedTrips;
