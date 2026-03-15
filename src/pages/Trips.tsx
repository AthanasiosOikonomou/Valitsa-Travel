import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { trips, type Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import TripDetail from "@/components/TripDetail";

// Map nav filter params to actual data filters
const filterPresets: Record<
  string,
  { durationRange?: [number, number]; category?: string }
> = {
  daily: { durationRange: [1, 1] },
  twoday: { durationRange: [2, 2] },
  internal: { category: "cultural" }, // maps to internal trips
  external: { category: "adventure" }, // maps to external trips
};

const TripsContent = () => {
  const [searchParams] = useSearchParams();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { t } = useLanguage();

  const globalPriceBounds = useMemo(() => {
    const values = trips.map((trip) => trip.priceNum);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, []);

  const globalDurationBounds = useMemo(() => {
    const values = trips.map((trip) => trip.durationDays);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, []);

  const departureCities = useMemo(
    () => [...new Set(trips.map((trip) => trip.departureCity))],
    [],
  );

  const tripCategories = useMemo(
    () => [...new Set(trips.map((trip) => trip.category))],
    [],
  );

  const tripTypes = useMemo(
    () => [...new Set(trips.map((trip) => trip.type))],
    [],
  );

  const hasBonusTrips = useMemo(() => trips.some((trip) => trip.isBonus), []);
  const hasGuaranteedTrips = useMemo(
    () => trips.some((trip) => trip.guaranteedDeparture),
    [],
  );
  const hasAvailableTrips = useMemo(
    () => trips.some((trip) => trip.hasAvailableSeats),
    [],
  );

  const priceStep = useMemo(() => {
    const spread = globalPriceBounds.max - globalPriceBounds.min;
    if (spread <= 1000) return 50;
    if (spread <= 5000) return 100;
    if (spread <= 10000) return 250;
    return 500;
  }, [globalPriceBounds.max, globalPriceBounds.min]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    globalPriceBounds.min,
    globalPriceBounds.max,
  ]);
  const [durationRange, setDurationRange] = useState<[number, number]>([
    globalDurationBounds.min,
    globalDurationBounds.max,
  ]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showBonus, setShowBonus] = useState(false);
  const [showGuaranteed, setShowGuaranteed] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [tripType, setTripType] = useState<"all" | Trip["type"]>("all");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const baseFilteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      if (
        searchQuery &&
        !trip.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (
        selectedCities.length > 0 &&
        !selectedCities.includes(trip.departureCity)
      )
        return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(trip.category)
      )
        return false;
      if (showBonus && !trip.isBonus) return false;
      if (showGuaranteed && !trip.guaranteedDeparture) return false;
      if (showAvailable && !trip.hasAvailableSeats) return false;
      if (tripType !== "all" && trip.type !== tripType) return false;
      return true;
    });
  }, [
    searchQuery,
    selectedCities,
    selectedCategories,
    showBonus,
    showGuaranteed,
    showAvailable,
    tripType,
  ]);

  const priceBounds = useMemo(() => {
    if (baseFilteredTrips.length === 0) return globalPriceBounds;
    const values = baseFilteredTrips.map((trip) => trip.priceNum);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [baseFilteredTrips, globalPriceBounds]);

  const durationBounds = useMemo(() => {
    if (baseFilteredTrips.length === 0) return globalDurationBounds;
    const values = baseFilteredTrips.map((trip) => trip.durationDays);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [baseFilteredTrips, globalDurationBounds]);

  const prevPriceBoundsRef = useRef(priceBounds);
  const prevDurationBoundsRef = useRef(durationBounds);

  // Apply URL filter presets
  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter && filterPresets[filter]) {
      const preset = filterPresets[filter];
      if (preset.durationRange) setDurationRange(preset.durationRange);
      if (preset.category) setSelectedCategories([preset.category]);
    }
  }, [searchParams]);

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    special: true,
    duration: true,
    city: true,
    category: false,
    type: false,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.style.overflow = selectedTrip ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedTrip]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const prev = prevPriceBoundsRef.current;
    setPriceRange((current) => {
      const wasFull = current[0] === prev.min && current[1] === prev.max;
      if (wasFull) {
        return [priceBounds.min, priceBounds.max];
      }

      const nextMin = Math.max(
        priceBounds.min,
        Math.min(current[0], priceBounds.max),
      );
      const nextMax = Math.max(nextMin, Math.min(current[1], priceBounds.max));
      return [nextMin, nextMax];
    });
    prevPriceBoundsRef.current = priceBounds;
  }, [priceBounds]);

  useEffect(() => {
    const prev = prevDurationBoundsRef.current;
    setDurationRange((current) => {
      const wasFull = current[0] === prev.min && current[1] === prev.max;
      if (wasFull) {
        return [durationBounds.min, durationBounds.max];
      }

      const nextMin = Math.max(
        durationBounds.min,
        Math.min(current[0], durationBounds.max),
      );
      const nextMax = Math.max(
        nextMin,
        Math.min(current[1], durationBounds.max),
      );
      return [nextMin, nextMax];
    });
    prevDurationBoundsRef.current = durationBounds;
  }, [durationBounds]);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleCity = (city: string) =>
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const filtered = useMemo(() => {
    return baseFilteredTrips.filter((trip) => {
      if (trip.priceNum < priceRange[0] || trip.priceNum > priceRange[1])
        return false;
      if (
        trip.durationDays < durationRange[0] ||
        trip.durationDays > durationRange[1]
      )
        return false;
      return true;
    });
  }, [baseFilteredTrips, priceRange, durationRange]);

  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([globalPriceBounds.min, globalPriceBounds.max]);
    setDurationRange([globalDurationBounds.min, globalDurationBounds.max]);
    setSelectedCities([]);
    setSelectedCategories([]);
    setShowBonus(false);
    setShowGuaranteed(false);
    setShowAvailable(false);
    setTripType("all");
  };

  const FilterSection = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-border pb-5 mb-5">
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between w-full text-sm font-bold mb-3"
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${openSections[id] ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {openSections[id] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const filtersContent = (
    <div className="space-y-0">
      <div className="pb-5 mb-5 border-b border-border">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("archive.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <FilterSection id="price" title={t("archive.priceRange")}>
        <p className="text-xs text-foreground-muted mb-3">
          ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}
        </p>
        <Slider
          min={priceBounds.min}
          max={priceBounds.max}
          step={priceStep}
          value={priceRange}
          onValueChange={(value) =>
            setPriceRange([value[0], value[1]] as [number, number])
          }
        />
      </FilterSection>

      {(hasBonusTrips || hasGuaranteedTrips || hasAvailableTrips) && (
        <FilterSection id="special" title={t("archive.specialFilters")}>
          {hasBonusTrips && (
            <label className="flex items-center gap-3 py-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showBonus}
                onChange={() => setShowBonus(!showBonus)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                {t("archive.bonusTrips")}
              </span>
            </label>
          )}
          {hasGuaranteedTrips && (
            <label className="flex items-center gap-3 py-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showGuaranteed}
                onChange={() => setShowGuaranteed(!showGuaranteed)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                {t("archive.guaranteedDepartures")}
              </span>
            </label>
          )}
          {hasAvailableTrips && (
            <label className="flex items-center gap-3 py-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showAvailable}
                onChange={() => setShowAvailable(!showAvailable)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                {t("archive.availableSeats")}
              </span>
            </label>
          )}
        </FilterSection>
      )}

      <FilterSection id="duration" title={t("archive.duration")}>
        <p className="text-xs text-foreground-muted mb-3">
          {durationRange[0]} – {durationRange[1]} {t("archive.days")}
        </p>
        <Slider
          min={durationBounds.min}
          max={durationBounds.max}
          step={1}
          value={durationRange}
          onValueChange={(value) =>
            setDurationRange([value[0], value[1]] as [number, number])
          }
        />
      </FilterSection>

      <FilterSection id="city" title={t("archive.departureCity")}>
        {departureCities.map((city) => (
          <label
            key={city}
            className="flex items-center gap-3 py-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedCities.includes(city)}
              onChange={() => toggleCity(city)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
              {city}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection id="category" title={t("archive.category")}>
        {tripCategories.map((cat) => (
          <label
            key={cat}
            className="flex items-center gap-3 py-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => toggleCategory(cat)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
              {(() => {
                const translated = t(`search.${cat}`);
                return translated === `search.${cat}` ? cat : translated;
              })()}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection id="type" title={t("archive.tripType")}>
        {(["all", ...tripTypes] as const).map((type) => (
          <label
            key={type}
            className="flex items-center gap-3 py-2 cursor-pointer group"
          >
            <input
              type="radio"
              name="tripType"
              checked={tripType === type}
              onChange={() => setTripType(type as "all" | Trip["type"])}
              className="w-4 h-4 border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
              {type === "all" ? t("archive.all") : type}
            </span>
          </label>
        ))}
      </FilterSection>

      <button
        onClick={resetFilters}
        className="w-full py-3 rounded-xl text-sm font-medium border border-border text-foreground-muted hover:border-foreground hover:text-foreground transition-colors"
      >
        {t("search.reset")}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />

      {/* Page header */}
      <div className="pt-24 pb-10 px-6 md:px-10 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl text-display mb-2">
          {t("archive.title")}
        </h1>
        <p className="text-foreground-muted text-sm">
          {filtered.length} {t("archive.resultsFound")}
        </p>

        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="lg:hidden mt-4 flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border text-sm font-semibold"
        >
          <SlidersHorizontal size={16} />
          {t("search.filters")}
        </button>
      </div>

      {/* 2-column layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-24 flex gap-10">
        {/* Sidebar - Desktop (sticky) */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div
            className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto bg-card border border-border rounded-2xl p-6"
            style={{ boxShadow: "var(--shadow-md)" }}
          >
            {filtersContent}
          </div>
        </aside>

        {/* Mobile filters drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background z-50 overflow-y-auto p-6 lg:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">{t("search.filters")}</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 rounded-full hover:bg-muted"
                  >
                    <X size={18} />
                  </button>
                </div>
                {filtersContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-foreground-muted text-lg">
                {t("archive.noResults")}
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 text-primary font-semibold text-sm hover:underline"
              >
                {t("search.reset")}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((trip, idx) => (
                <TripResultCard
                  key={trip.id}
                  trip={trip}
                  index={idx}
                  onClick={setSelectedTrip}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTrip && (
          <TripDetail
            trip={selectedTrip}
            onClose={() => setSelectedTrip(null)}
          />
        )}
      </AnimatePresence>

      <footer className="border-t border-border py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xl font-bold tracking-[-0.06em]">VALITSA</span>
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

/* ── Trip Result Card ── */
interface TripResultCardProps {
  trip: Trip;
  index: number;
  onClick: (trip: Trip) => void;
}

const TripResultCard = ({ trip, index, onClick }: TripResultCardProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => onClick(trip)}
      className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-primary/30 transition-all duration-300"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="sm:w-64 md:w-80 shrink-0 relative overflow-hidden">
        <img
          src={trip.image}
          alt={trip.title}
          className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {trip.isBonus && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
            Extra Bonus
          </span>
        )}
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs text-foreground-muted mb-1">{trip.dateRange}</p>
          <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
            {trip.title}
          </h3>
          <p className="text-foreground-muted text-sm mb-3 line-clamp-2">
            {trip.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-primary">{trip.price}</span>
            <span className="text-foreground-muted">{trip.duration}</span>
            {trip.guaranteedDeparture && (
              <span className="text-xs bg-muted text-foreground-muted px-2.5 py-1 rounded-full">
                {t("archive.guaranteed")}
              </span>
            )}
          </div>
          <span className="text-sm font-bold text-primary group-hover:underline">
            {t("archive.more")} →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const TripsPage = () => <TripsContent />;

export default TripsPage;
