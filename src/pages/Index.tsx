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
      ? "Valitsa Travel - Οργανωμένα Ταξίδια & Premium Εκδρομές"
      : "Valitsa Travel - Curated Luxury Trips & Travel Experiences";
  const seoDescription =
    lang === "gr"
      ? "Ανακαλύψτε χειροποίητα ταξίδια σε εξαιρετικούς προορισμούς. Premium εμπειρίες, ιδιωτικά πακέτα, και αξέχαστες στιγμές στην Ελλάδα και διεθνώς."
      : "Discover handcrafted luxury travel experiences and curated adventures. Private estates, yacht charters, cultural immersion, and unforgettable moments worldwide.";
  const seoKeywords =
    lang === "gr"
      ? "οργανωμένα ταξίδια, εκδρομές, premium ταξίδια, ταξιδιωτικό γραφείο, ταξίδια Ελλάδα, χειροποίητα ταξίδια"
      : "luxury travel, curated trips, travel agency, organized tours, Greece travel, bespoke adventures, premium experiences";

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
    "@id": "https://valitsatravel.gr/#organization",
    name: "Valitsa Travel",
    url: "https://valitsatravel.gr/",
    logo: {
      "@type": "ImageObject",
      url: "https://valitsatravel.gr/branding/navbar/logo-light.svg",
      width: 200,
      height: 60,
    },
    image: "https://valitsatravel.gr/branding/navbar/logo-light.svg",
    description:
      lang === "gr"
        ? "Premium ταξιδιωτικό γραφείο που δημιουργεί χειροποίητα ταξίδια στις πιο εξαιρετικές τοποθεσίες του κόσμου."
        : "Premium travel agency creating bespoke travel experiences in the world's most exceptional destinations.",
    areaServed: [
      { "@type": "Country", name: "Greece" },
      { "@type": "Continent", name: "Europe" },
      { "@type": "Continent", name: "Asia" },
      { "@type": "Continent", name: "Africa" },
      { "@type": "Continent", name: "South America" },
    ],
    sameAs: [
      "https://www.facebook.com/valitsatravel",
      "https://www.instagram.com/valitsatravel",
    ],
  };

  const contactPointSchema = {
    "@type": "ContactPoint",
    "@id": "https://valitsatravel.gr/#contact",
    contactType: "Customer Service",
    areaServed: ["GR", "EU"],
    availableLanguage: ["el", "en"],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      lang === "gr"
        ? [
            {
              "@type": "Question",
              name: "Τι είναι τα Valitsa Travel;",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Η Valitsa Travel είναι ένα premium ταξιδιωτικό γραφείο που δημιουργεί χειροποίητα ταξίδια και κουρατορική εμπειρία συλλογών σε τις πιο εξαιρετικές τοποθεσίες του κόσμου.",
              },
            },
            {
              "@type": "Question",
              name: "Ποιες χώρες καλύπτει η Valitsa Travel;",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Προσφέρουμε ταξίδια σε όλη την Ευρώπη, Ασία, Αφρική και Νότια Αμερική. Έχουμε ειδικές συλλογές για την Ελλάδα και προορισμούς στο εξωτερικό.",
              },
            },
            {
              "@type": "Question",
              name: "Μπορώ να προσαρμόσω ένα ταξίδι κατά τις ανάγκες μου;",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ναι! Όλα τα ταξίδια μας είναι διαθέσιμα για προσαρμογή. Επικοινωνήστε μαζί μας για να δημιουργήσουμε το τέλειο ταξίδι για σας.",
              },
            },
          ]
        : [
            {
              "@type": "Question",
              name: "What is Valitsa Travel?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Valitsa Travel is a premium travel agency creating handcrafted journeys and curated experience collections in the world's most exceptional destinations.",
              },
            },
            {
              "@type": "Question",
              name: "What destinations does Valitsa Travel cover?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We offer travels across Europe, Asia, Africa, and South America. Special collections for Greece and international destinations.",
              },
            },
            {
              "@type": "Question",
              name: "Can I customize a trip to my needs?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes! All our trips can be customized. Contact us to create the perfect journey for you.",
              },
            },
          ],
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
        structuredData={[
          websiteSchema,
          businessSchema,
          contactPointSchema,
          faqSchema,
        ]}
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
