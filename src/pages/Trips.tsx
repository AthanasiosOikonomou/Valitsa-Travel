import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { getLocalizedTripContent, trips, type Trip } from "@/data/mockData";
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
  internal: {},
  external: {},
};

const getPresetTrips = (preset?: {
  durationRange?: [number, number];
  category?: string;
}) => {
  if (!preset) return trips;

  return trips.filter((trip) => {
    if (preset.category && trip.category !== preset.category) return false;

    if (
      preset.durationRange &&
      (trip.durationDays < preset.durationRange[0] ||
        trip.durationDays > preset.durationRange[1])
    ) {
      return false;
    }

    return true;
  });
};

const getBounds = (
  presetTrips: Trip[],
  fallback: { min: number; max: number },
  key: "priceNum" | "durationDays",
) => {
  if (presetTrips.length === 0) return fallback;

  const values = presetTrips.map((trip) => trip[key]);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

const countryToContinent: Record<string, string> = {
  Greece: "Europe",
  Italy: "Europe",
  Iceland: "Europe",
  Switzerland: "Europe",
  France: "Europe",
  Japan: "Asia",
  Tanzania: "Africa",
  Egypt: "Africa",
  Chile: "South America",
  Peru: "South America",
  USA: "North America",
};

const getPresetCountries = (filter: string | null, countries: string[]) => {
  if (filter === "internal") return ["Greece"];
  if (filter === "external")
    return countries.filter((country) => country !== "Greece");
  return [];
};

interface FilterSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

const FilterSection = ({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: FilterSectionProps) => (
  <div className="border-b border-border pb-5 mb-5">
    <button
      onClick={() => onToggle(id)}
      className="flex items-center justify-between w-full text-sm font-bold mb-3"
    >
      {title}
      <ChevronDown
        size={16}
        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
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

const TripsContent = () => {
  const [searchParams] = useSearchParams();
  const { darkMode, toggleDark } = useTheme();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { t, lang } = useLanguage();
  const activeFilter = searchParams.get("filter");

  const activePreset = useMemo(() => {
    const filter = searchParams.get("filter");
    return filter ? filterPresets[filter] : undefined;
  }, [searchParams]);

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
    () => [
      ...new Set(
        trips.map((trip) => getLocalizedTripContent(trip, lang).departureCity),
      ),
    ],
    [lang],
  );

  const countries = useMemo(
    () =>
      [...new Set(trips.map((trip) => trip.country))].sort((a, b) => {
        if (a === "Greece") return -1;
        if (b === "Greece") return 1;
        return a.localeCompare(b);
      }),
    [],
  );

  const presetTrips = useMemo(
    () => getPresetTrips(activePreset),
    [activePreset],
  );

  const initialPriceBounds = useMemo(
    () => getBounds(presetTrips, globalPriceBounds, "priceNum"),
    [presetTrips, globalPriceBounds],
  );

  const initialDurationBounds = useMemo(
    () => getBounds(presetTrips, globalDurationBounds, "durationDays"),
    [presetTrips, globalDurationBounds],
  );

  const tripCategories = useMemo(
    () => [...new Set(trips.map((trip) => trip.category))],
    [],
  );

  const tripTypes = useMemo(
    () => [...new Set(trips.map((trip) => trip.type))],
    [],
  );

  const continents = useMemo(
    () =>
      [
        ...new Set(
          trips.map((trip) => countryToContinent[trip.country] ?? "Other"),
        ),
      ].sort((a, b) => a.localeCompare(b)),
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
  const hasFeaturedTrips = useMemo(
    () => trips.some((trip) => trip.isFeatured),
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
    initialPriceBounds.min,
    initialPriceBounds.max,
  ]);
  const [durationRange, setDurationRange] = useState<[number, number]>(
    () =>
      activePreset?.durationRange ?? [
        initialDurationBounds.min,
        initialDurationBounds.max,
      ],
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() =>
    getPresetCountries(activeFilter, countries),
  );
  const [selectedContinents, setSelectedContinents] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    activePreset?.category ? [activePreset.category] : [],
  );
  const [showBonus, setShowBonus] = useState(false);
  const [showGuaranteed, setShowGuaranteed] = useState(false);
  const [showAvailable, setShowAvailable] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [tripType, setTripType] = useState<"all" | Trip["type"]>("all");
  const [sortBy, setSortBy] = useState<
    "recommended" | "priceAsc" | "priceDesc"
  >("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const baseFilteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const localized = getLocalizedTripContent(trip, lang);

      if (
        searchQuery &&
        !`${localized.title} ${localized.location}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
        return false;
      if (
        selectedCountries.length > 0 &&
        !selectedCountries.includes(trip.country)
      )
        return false;
      if (selectedContinents.length > 0) {
        const tripContinent = countryToContinent[trip.country] ?? "Other";
        if (!selectedContinents.includes(tripContinent)) return false;
      }
      if (
        selectedCities.length > 0 &&
        !selectedCities.includes(localized.departureCity)
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
      if (showFeatured && !trip.isFeatured) return false;
      if (tripType !== "all" && trip.type !== tripType) return false;
      return true;
    });
  }, [
    searchQuery,
    selectedCountries,
    selectedContinents,
    selectedCities,
    selectedCategories,
    showBonus,
    showGuaranteed,
    showAvailable,
    showFeatured,
    tripType,
    lang,
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

  const availableDurationBounds = useMemo(() => {
    if (!activePreset?.durationRange) return durationBounds;

    const [presetMin, presetMax] = activePreset.durationRange;
    return {
      min: Math.min(durationBounds.min, presetMin),
      max: Math.max(durationBounds.max, presetMax),
    };
  }, [activePreset, durationBounds]);

  const prevPriceBoundsRef = useRef(priceBounds);
  const prevDurationBoundsRef = useRef(availableDurationBounds);

  // Keep URL filter presets in sync if query param changes while mounted
  useLayoutEffect(() => {
    setSearchQuery("");
    setPriceRange([initialPriceBounds.min, initialPriceBounds.max]);
    setDurationRange(
      activePreset?.durationRange ?? [
        initialDurationBounds.min,
        initialDurationBounds.max,
      ],
    );
    setSelectedCountries(getPresetCountries(activeFilter, countries));
    setSelectedContinents([]);
    setSelectedCities([]);
    setSelectedCategories(
      activePreset?.category ? [activePreset.category] : [],
    );
    setShowBonus(false);
    setShowGuaranteed(false);
    setShowAvailable(false);
    setShowFeatured(false);
    setTripType("all");
    setSortBy("recommended");
  }, [
    activeFilter,
    activePreset,
    countries,
    initialDurationBounds,
    initialPriceBounds,
  ]);

  // Collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    special: true,
    duration: true,
    country: true,
    continent: true,
    city: true,
    category: false,
    type: false,
    sort: true,
  });

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
    setSelectedCities([]);
  }, [lang]);

  useEffect(() => {
    const tripParam = searchParams.get("trip");
    if (!tripParam) return;

    const tripId = Number(tripParam);
    if (Number.isNaN(tripId)) return;

    const matchedTrip = trips.find((trip) => trip.id === tripId);
    if (matchedTrip) {
      setSelectedTrip(matchedTrip);
    }
  }, [searchParams]);

  useLayoutEffect(() => {
    const prev = prevPriceBoundsRef.current;
    if (prev.min === priceBounds.min && prev.max === priceBounds.max) {
      return;
    }

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

  useLayoutEffect(() => {
    const prev = prevDurationBoundsRef.current;
    if (
      prev.min === availableDurationBounds.min &&
      prev.max === availableDurationBounds.max
    ) {
      return;
    }

    setDurationRange((current) => {
      const wasFull = current[0] === prev.min && current[1] === prev.max;
      if (wasFull) {
        return [availableDurationBounds.min, availableDurationBounds.max];
      }

      const nextMin = Math.max(
        availableDurationBounds.min,
        Math.min(current[0], availableDurationBounds.max),
      );
      const nextMax = Math.max(
        nextMin,
        Math.min(current[1], availableDurationBounds.max),
      );
      return [nextMin, nextMax];
    });
    prevDurationBoundsRef.current = availableDurationBounds;
  }, [availableDurationBounds]);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleCity = (city: string) =>
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );

  const toggleCountry = (country: string) =>
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );

  const toggleContinent = (continent: string) =>
    setSelectedContinents((prev) =>
      prev.includes(continent)
        ? prev.filter((c) => c !== continent)
        : [...prev, continent],
    );

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const filtered = useMemo(() => {
    const matchingTrips = baseFilteredTrips.filter((trip) => {
      if (trip.priceNum < priceRange[0] || trip.priceNum > priceRange[1])
        return false;
      if (
        trip.durationDays < durationRange[0] ||
        trip.durationDays > durationRange[1]
      )
        return false;
      return true;
    });

    const sortedTrips = [...matchingTrips];
    switch (sortBy) {
      case "priceAsc":
        sortedTrips.sort((a, b) => a.priceNum - b.priceNum);
        break;
      case "priceDesc":
        sortedTrips.sort((a, b) => b.priceNum - a.priceNum);
        break;
      case "recommended":
      default:
        sortedTrips.sort((a, b) => {
          const scoreA =
            Number(Boolean(a.isFeatured)) + Number(Boolean(a.isBonus));
          const scoreB =
            Number(Boolean(b.isFeatured)) + Number(Boolean(b.isBonus));
          return scoreB - scoreA;
        });
        break;
    }

    return sortedTrips;
  }, [baseFilteredTrips, durationRange, priceRange, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([globalPriceBounds.min, globalPriceBounds.max]);
    setDurationRange([globalDurationBounds.min, globalDurationBounds.max]);
    setSelectedCountries(getPresetCountries(activeFilter, countries));
    setSelectedContinents([]);
    setSelectedCities([]);
    setSelectedCategories([]);
    setShowBonus(false);
    setShowGuaranteed(false);
    setShowAvailable(false);
    setShowFeatured(false);
    setTripType("all");
    setSortBy("recommended");
  };

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

      <FilterSection
        id="price"
        title={t("archive.priceRange")}
        isOpen={openSections.price}
        onToggle={toggleSection}
      >
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

      {(hasBonusTrips ||
        hasGuaranteedTrips ||
        hasAvailableTrips ||
        hasFeaturedTrips) && (
        <FilterSection
          id="special"
          title={t("archive.specialFilters")}
          isOpen={openSections.special}
          onToggle={toggleSection}
        >
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
          {hasFeaturedTrips && (
            <label className="flex items-center gap-3 py-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={showFeatured}
                onChange={() => setShowFeatured(!showFeatured)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                {t("archive.featuredPicks")}
              </span>
            </label>
          )}
        </FilterSection>
      )}

      <FilterSection
        id="sort"
        title={t("archive.sortBy")}
        isOpen={openSections.sort}
        onToggle={toggleSection}
      >
        <div className="space-y-2">
          {(
            [
              ["recommended", t("archive.sort.recommended")],
              ["priceAsc", t("archive.sort.priceAsc")],
              ["priceDesc", t("archive.sort.priceDesc")],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-3 py-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="sortBy"
                checked={sortBy === value}
                onChange={() => setSortBy(value)}
                className="w-4 h-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
                {label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection
        id="continent"
        title={t("archive.continent")}
        isOpen={openSections.continent}
        onToggle={toggleSection}
      >
        {continents.map((continent) => (
          <label
            key={continent}
            className="flex items-center gap-3 py-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedContinents.includes(continent)}
              onChange={() => toggleContinent(continent)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
              {(() => {
                const translated = t(`continent.${continent}`);
                return translated === `continent.${continent}`
                  ? continent
                  : translated;
              })()}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection
        id="duration"
        title={t("archive.duration")}
        isOpen={openSections.duration}
        onToggle={toggleSection}
      >
        <p className="text-xs text-foreground-muted mb-3">
          {durationRange[0]} – {durationRange[1]} {t("archive.days")}
        </p>
        <Slider
          min={availableDurationBounds.min}
          max={availableDurationBounds.max}
          step={1}
          value={durationRange}
          onValueChange={(value) =>
            setDurationRange([value[0], value[1]] as [number, number])
          }
        />
      </FilterSection>

      <FilterSection
        id="country"
        title={t("archive.country")}
        isOpen={openSections.country}
        onToggle={toggleSection}
      >
        {countries.map((country) => (
          <label
            key={country}
            className="flex items-center gap-3 py-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={selectedCountries.includes(country)}
              onChange={() => toggleCountry(country)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm text-foreground-muted group-hover:text-foreground transition-colors">
              {(() => {
                const translated = t(`country.${country}`);
                return translated === `country.${country}`
                  ? country
                  : translated;
              })()}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection
        id="city"
        title={t("archive.departureCity")}
        isOpen={openSections.city}
        onToggle={toggleSection}
      >
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

      <FilterSection
        id="category"
        title={t("archive.category")}
        isOpen={openSections.category}
        onToggle={toggleSection}
      >
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

      <FilterSection
        id="type"
        title={t("archive.tripType")}
        isOpen={openSections.type}
        onToggle={toggleSection}
      >
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
              {type === "all" ? t("archive.all") : t(`tripType.${type}`)}
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
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

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
          <img
            src={
              darkMode
                ? "/branding/navbar/logo-dark.svg"
                : "/branding/navbar/logo-light.svg"
            }
            alt={t("nav.brand")}
            className="h-8 w-auto"
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

/* ── Trip Result Card ── */
interface TripResultCardProps {
  trip: Trip;
  index: number;
  onClick: (trip: Trip) => void;
}

const TripResultCard = ({ trip, index, onClick }: TripResultCardProps) => {
  const { t, lang } = useLanguage();
  const localized = getLocalizedTripContent(trip, lang);

  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => onClick(trip)}
      className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-primary/30 transition-all duration-300"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="sm:w-64 md:w-80 shrink-0 relative overflow-hidden">
        <img
          src={trip.image}
          alt={localized.title}
          className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {trip.isBonus && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
            {t("archive.bonus")}
          </span>
        )}
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs text-foreground-muted mb-1">
            {localized.dateRange}
          </p>
          <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
            {localized.title}
          </h3>
          <p className="text-foreground-muted text-sm mb-3 line-clamp-2">
            {localized.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-primary">{trip.price}</span>
            <span className="text-foreground-muted">{localized.duration}</span>
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
