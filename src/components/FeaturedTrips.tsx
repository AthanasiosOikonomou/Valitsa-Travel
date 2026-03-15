import { motion } from "framer-motion";
import { trips, type Trip } from "@/data/mockData";
import TripCard from "./TripCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface FeaturedTripsProps {
  onSelectTrip: (trip: Trip) => void;
}

const FeaturedTrips = ({ onSelectTrip }: FeaturedTripsProps) => {
  const { t } = useLanguage();
  const featured = trips.filter((trip) => trip.isFeatured);

  return (
    <section className="max-w-7xl mx-auto py-24 px-6 md:px-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-14">
        <div>
          <p className="label-ui text-primary mb-2">{t("featured.label")}</p>
          <h2 className="text-3xl md:text-4xl text-display">{t("featured.title")}</h2>
        </div>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {t("featured.viewAll")}
          <ArrowRight size={16} />
        </Link>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featured.map((trip, idx) => (
          <TripCard key={trip.id} trip={trip} index={idx} onClick={onSelectTrip} />
        ))}
      </motion.div>
    </section>
  );
};

export default FeaturedTrips;
