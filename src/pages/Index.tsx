import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import type { Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedTrips from "@/components/FeaturedTrips";
import TripDetail from "@/components/TripDetail";
import Seo from "@/components/Seo";
import TermsModal from "@/components/TermsModal";

const IndexContent = () => {
  const { darkMode, toggleDark } = useTheme();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const { t, lang } = useLanguage();

  const seoTitle =
    lang === "gr"
      ? "Valitsa Travel - Οργανωμένα Ταξίδια & Εκδρομές"
      : "Valitsa Travel - Curated Trips & Travel Experiences";
  const seoDescription =
    lang === "gr"
      ? "Ανακαλύψτε οργανωμένες εκδρομές και premium ταξιδιωτικές εμπειρίες στην Ελλάδα και το εξωτερικό με τη Valitsa Travel."
      : "Discover curated tours and premium travel experiences in Greece and abroad with Valitsa Travel.";
  const seoKeywords =
    lang === "gr"
      ? "ταξίδια, εκδρομές, οργανωμένα ταξίδια, ταξιδιωτικό γραφείο, Valitsa Travel"
      : "travel agency, curated trips, tours in Greece, premium travel, Valitsa Travel";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Valitsa Travel",
    url: "https://valitsatravel.gr/",
    inLanguage: lang === "gr" ? "el-GR" : "en-US",
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Valitsa Travel",
    url: "https://valitsatravel.gr/",
    logo: "https://valitsatravel.gr/branding/navbar/logo-light.svg",
    image: "https://valitsatravel.gr/branding/navbar/logo-light.svg",
    areaServed: ["Greece", "Europe"],
  };

  useEffect(() => {
    document.body.style.overflow = selectedTrip || termsOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedTrip, termsOpen]);

  return (
    <div className="premium-page min-h-screen bg-background text-foreground transition-colors duration-500">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path="/"
        image="/branding/navbar/logo-light.svg"
        keywords={seoKeywords}
        lang={lang}
        structuredData={[websiteSchema, businessSchema]}
      />
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

      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />

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
              onClick={(event) => {
                event.preventDefault();
                setTermsOpen(true);
              }}
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
