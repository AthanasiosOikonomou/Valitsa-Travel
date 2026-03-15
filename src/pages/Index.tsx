import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import type { Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedTrips from "@/components/FeaturedTrips";
import TripDetail from "@/components/TripDetail";

const IndexContent = () => {
  const { darkMode, toggleDark } = useTheme();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    document.body.style.overflow = selectedTrip ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedTrip]);

  return (
    <div className="premium-page min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />
      <HeroSection />
      <FeaturedTrips onSelectTrip={setSelectedTrip} />

      <AnimatePresence>
        {selectedTrip && (
          <TripDetail
            trip={selectedTrip}
            onClose={() => setSelectedTrip(null)}
          />
        )}
      </AnimatePresence>

      <footer className="border-t border-border/70 py-16 px-6 md:px-10">
        <div className="premium-panel max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 rounded-[1.8rem] px-6 py-8 md:px-8">
          <img
            src={
              darkMode
                ? "/branding/navbar/logo-dark.svg"
                : "/branding/navbar/logo-light.svg"
            }
            alt={t("nav.brand")}
            className="h-8 w-auto"
            loading="lazy"
            decoding="async"
          />
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-foreground-muted text-sm hover:text-foreground transition-colors"
            >
              {t("nav.terms")}
            </a>
            <p className="text-foreground-muted text-sm">
              {t("footer.rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Index = () => <IndexContent />;

export default Index;
