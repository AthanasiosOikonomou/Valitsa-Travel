import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { getLocalizedTripContent, trips, type Trip } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import TripDetail from "@/components/TripDetail";
import Seo from "@/components/Seo";
import TermsModal from "@/components/TermsModal";
import { Slider } from "@/components/ui/slider";
import {
  areTripFilterStatesEqual,
  buildAvailableTripFacets,
  buildFilteredTrips,
  buildTripFilterMetadata,
  createInitialTripFilterState,
  getCityLabelMap,
  sanitizeTripFilterState,
  sortTrips,
  tripFilterReducer,
  type SortOption,
  type TripTypeFilter,
} from "@/lib/tripFilters";

interface FilterSectionProps {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

interface FacetOptionProps {
  checked: boolean;
  count: number;
  disabled: boolean;
  label: string;
  name?: string;
  onChange: () => void;
  showCount?: boolean;
  type: "checkbox" | "radio";
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

const FacetOption = ({
  checked,
  count,
  disabled,
  label,
  name,
  onChange,
  showCount = true,
  type,
}: FacetOptionProps) => (
  <label
    className={`flex items-center gap-3 py-2 transition-colors ${
      disabled
        ? "cursor-not-allowed opacity-35 grayscale saturate-0"
        : "cursor-pointer group"
    }`}
  >
    <input
      type={type}
      name={name}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="sr-only peer"
    />
    <span
      aria-hidden="true"
      className={`relative grid place-items-center w-4 h-4 shrink-0 border border-black bg-white dark:bg-background ${
        type === "radio" ? "rounded-full" : "rounded"
      }`}
    >
      {checked &&
        (type === "radio" ? (
          <span className="block w-2 h-2 rounded-full bg-primary" />
        ) : (
          <svg
            viewBox="0 0 16 16"
            className="w-3 h-3 text-black"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 8.5L6.5 11.5L12.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ))}
    </span>
    <span
      className={`flex-1 text-sm transition-colors ${
        disabled
          ? "text-foreground-muted/65 line-through"
          : "text-foreground-muted group-hover:text-foreground"
      }`}
    >
      {label}
    </span>
    {showCount ? (
      <span
        className={`text-xs tabular-nums px-2 py-0.5 rounded-full border ${
          disabled
            ? "text-foreground-muted/70 border-border/60 bg-muted/35"
            : "text-foreground-muted border-border/70"
        }`}
      >
        {count}
      </span>
    ) : null}
  </label>
);

const TripsContent = () => {
  const [searchParams] = useSearchParams();
  const { darkMode, toggleDark } = useTheme();
  const { t, lang } = useLanguage();
  const activeFilter = searchParams.get("filter");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const scrollTripsToTop = () => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = prev;
  };

  useLayoutEffect(() => {
    scrollTripsToTop();
  }, [activeFilter]);

  useEffect(() => {
    const handleNavbarTopRequest = () => scrollTripsToTop();
    window.addEventListener("valitsa:scroll-trips-top", handleNavbarTopRequest);
    return () => {
      window.removeEventListener(
        "valitsa:scroll-trips-top",
        handleNavbarTopRequest,
      );
    };
  }, []);

  const seoTitle =
    lang === "gr"
      ? "Όλα τα Ταξίδια | Valitsa Travel - Premium Εκδρομές & Πακέτα"
      : "All Trips | Valitsa Travel - Premium Packages & Curated Tours";
  const seoDescription =
    lang === "gr"
      ? "Εξερευνήστε τη συλλογή μας από premium ταξιδιωτικά πακέτα. Ιδιωτικές έπαυλες, yacht charters, πολιτιστικές εμπειρίες. Φίλτρα ανά χώρα, τιμή & διάρκεια."
      : "Explore our collection of premium travel packages. Private estates, yacht experiences, cultural tours. Filter by destination, price, and duration.";
  const seoKeywords =
    lang === "gr"
      ? "ταξίδια, εκδρομές, premium πακέτα, ταξίδια Ελλάδα, yacht charter, πολιτιστικές εμπειρίες, ιδιωτικές έπαυλες"
      : "luxury travel packages, curated tours, destinations, yacht charters, private estates, cultural experiences, destination travel";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://valitsatravel.gr/trips#itemlist",
    name: lang === "gr" ? "Λίστα Ταξιδιών" : "Trips List",
    numberOfItems: trips.length,
    itemListElement: trips.slice(0, 10).map((trip, idx) => {
      const localized = getLocalizedTripContent(trip, lang);
      return {
        "@type": "ListItem",
        position: idx + 1,
        name: localized.title,
        url: `https://valitsatravel.gr/trips?trip=${trip.id}`,
        image: trip.image,
        description: localized.description,
        priceCurrency: "USD",
        price: String(trip.priceNum),
        duration: localized.duration,
      };
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: lang === "gr" ? "Αρχική" : "Home",
        item: "https://valitsatravel.gr/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: lang === "gr" ? "Ταξίδια" : "Trips",
        item: "https://valitsatravel.gr/trips",
      },
    ],
  };

  const filterMetadata = useMemo(() => buildTripFilterMetadata(trips), []);
  const initialFilterState = useMemo(
    () => createInitialTripFilterState(trips, filterMetadata, activeFilter),
    [activeFilter, filterMetadata],
  );
  const [filterState, dispatch] = useReducer(
    tripFilterReducer,
    initialFilterState,
  );

  const preliminaryFacets = useMemo(
    () =>
      buildAvailableTripFacets(
        trips,
        filterState,
        lang,
        filterMetadata.globalPriceBounds,
      ),
    [filterMetadata.globalPriceBounds, filterState, lang],
  );
  const normalizedFilterState = useMemo(
    () =>
      sanitizeTripFilterState(filterState, preliminaryFacets, filterMetadata),
    [preliminaryFacets, filterMetadata, filterState],
  );
  const availableFacets = useMemo(
    () =>
      buildAvailableTripFacets(
        trips,
        normalizedFilterState,
        lang,
        filterMetadata.globalPriceBounds,
      ),
    [filterMetadata.globalPriceBounds, lang, normalizedFilterState],
  );
  const filtered = useMemo(
    () =>
      sortTrips(
        buildFilteredTrips(trips, normalizedFilterState, lang),
        normalizedFilterState.sortBy,
      ),
    [lang, normalizedFilterState],
  );

  const cityLabels = useMemo(() => getCityLabelMap(trips, lang), [lang]);
  const priceStep = useMemo(() => {
    const spread =
      availableFacets.priceBounds.max - availableFacets.priceBounds.min;
    if (spread <= 1000) return 50;
    if (spread <= 5000) return 100;
    if (spread <= 10000) return 250;
    return 500;
  }, [availableFacets.priceBounds.max, availableFacets.priceBounds.min]);

  useLayoutEffect(() => {
    dispatch({ type: "replace", value: initialFilterState });
  }, [initialFilterState]);

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
    document.body.style.overflow = selectedTrip || termsOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedTrip, termsOpen]);

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
    const tripParam = searchParams.get("trip");
    if (!tripParam) return;

    const tripId = Number(tripParam);
    if (Number.isNaN(tripId)) return;

    const matchedTrip = trips.find((trip) => trip.id === tripId);
    if (matchedTrip) {
      setSelectedTrip(matchedTrip);
    }
  }, [searchParams]);

  useEffect(() => {
    if (areTripFilterStatesEqual(filterState, normalizedFilterState)) return;
    dispatch({ type: "replace", value: normalizedFilterState });
  }, [filterState, normalizedFilterState]);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const translateFacetValue = (prefix: string, fallback: string) => {
    const translated = t(`${prefix}.${fallback}`);
    return translated === `${prefix}.${fallback}` ? fallback : translated;
  };

  const isDisabled = (count: number, selected: boolean) =>
    !selected && count === 0;

  const resetFilters = () => {
    dispatch({ type: "replace", value: initialFilterState });
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
            value={filterState.searchQuery}
            onChange={(event) =>
              dispatch({ type: "setSearchQuery", value: event.target.value })
            }
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
          ${normalizedFilterState.priceRange[0].toLocaleString()} - $
          {normalizedFilterState.priceRange[1].toLocaleString()}
        </p>
        <Slider
          min={availableFacets.priceBounds.min}
          max={availableFacets.priceBounds.max}
          step={priceStep}
          disabled={
            availableFacets.priceBounds.min === availableFacets.priceBounds.max
          }
          value={normalizedFilterState.priceRange}
          onValueChange={(value) =>
            dispatch({
              type: "setPriceRange",
              value: [value[0], value[1]] as [number, number],
            })
          }
        />
      </FilterSection>

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
            <FacetOption
              key={value}
              type="radio"
              name="sortBy"
              label={label}
              checked={normalizedFilterState.sortBy === value}
              count={0}
              showCount={false}
              disabled={false}
              onChange={() =>
                dispatch({ type: "setSortBy", value: value as SortOption })
              }
            />
          ))}
        </div>
      </FilterSection>

      {(filterMetadata.hasBonusTrips ||
        filterMetadata.hasGuaranteedTrips ||
        filterMetadata.hasAvailableTrips ||
        filterMetadata.hasFeaturedTrips) && (
        <FilterSection
          id="special"
          title={t("archive.specialFilters")}
          isOpen={openSections.special}
          onToggle={toggleSection}
        >
          {filterMetadata.hasBonusTrips && (
            <FacetOption
              type="checkbox"
              label={t("archive.bonusTrips")}
              checked={normalizedFilterState.showBonus}
              count={availableFacets.specialCounts.bonus}
              disabled={isDisabled(
                availableFacets.specialCounts.bonus,
                normalizedFilterState.showBonus,
              )}
              onChange={() =>
                dispatch({ type: "toggleFlag", key: "showBonus" })
              }
            />
          )}
          {filterMetadata.hasGuaranteedTrips && (
            <FacetOption
              type="checkbox"
              label={t("archive.guaranteedDepartures")}
              checked={normalizedFilterState.showGuaranteed}
              count={availableFacets.specialCounts.guaranteed}
              disabled={isDisabled(
                availableFacets.specialCounts.guaranteed,
                normalizedFilterState.showGuaranteed,
              )}
              onChange={() =>
                dispatch({ type: "toggleFlag", key: "showGuaranteed" })
              }
            />
          )}
          {filterMetadata.hasAvailableTrips && (
            <FacetOption
              type="checkbox"
              label={t("archive.availableSeats")}
              checked={normalizedFilterState.showAvailable}
              count={availableFacets.specialCounts.available}
              disabled={isDisabled(
                availableFacets.specialCounts.available,
                normalizedFilterState.showAvailable,
              )}
              onChange={() =>
                dispatch({ type: "toggleFlag", key: "showAvailable" })
              }
            />
          )}
          {filterMetadata.hasFeaturedTrips && (
            <FacetOption
              type="checkbox"
              label={t("archive.featuredPicks")}
              checked={normalizedFilterState.showFeatured}
              count={availableFacets.specialCounts.featured}
              disabled={isDisabled(
                availableFacets.specialCounts.featured,
                normalizedFilterState.showFeatured,
              )}
              onChange={() =>
                dispatch({ type: "toggleFlag", key: "showFeatured" })
              }
            />
          )}
        </FilterSection>
      )}

      <FilterSection
        id="continent"
        title={t("archive.continent")}
        isOpen={openSections.continent}
        onToggle={toggleSection}
      >
        {filterMetadata.continents.map((continent) => {
          const count = availableFacets.continentCounts.get(continent) ?? 0;
          const checked =
            normalizedFilterState.selectedContinents.includes(continent);

          return (
            <FacetOption
              key={continent}
              type="checkbox"
              label={translateFacetValue("continent", continent)}
              checked={checked}
              count={count}
              disabled={isDisabled(count, checked)}
              onChange={() =>
                dispatch({
                  type: "toggleMulti",
                  key: "selectedContinents",
                  value: continent,
                })
              }
            />
          );
        })}
      </FilterSection>

      <FilterSection
        id="duration"
        title={t("archive.duration")}
        isOpen={openSections.duration}
        onToggle={toggleSection}
      >
        {filterMetadata.durations.map((duration) => {
          const count = availableFacets.durationCounts.get(duration) ?? 0;
          const checked =
            normalizedFilterState.selectedDurations.includes(duration);

          return (
            <FacetOption
              key={duration}
              type="checkbox"
              label={`${duration} ${t("archive.days")}`}
              checked={checked}
              count={count}
              disabled={isDisabled(count, checked)}
              onChange={() =>
                dispatch({
                  type: "toggleMulti",
                  key: "selectedDurations",
                  value: duration,
                })
              }
            />
          );
        })}
      </FilterSection>

      <FilterSection
        id="country"
        title={t("archive.country")}
        isOpen={openSections.country}
        onToggle={toggleSection}
      >
        {filterMetadata.countries.map((country) => {
          const count = availableFacets.countryCounts.get(country) ?? 0;
          const checked =
            normalizedFilterState.selectedCountries.includes(country);

          return (
            <FacetOption
              key={country}
              type="checkbox"
              label={translateFacetValue("country", country)}
              checked={checked}
              count={count}
              disabled={isDisabled(count, checked)}
              onChange={() =>
                dispatch({
                  type: "toggleMulti",
                  key: "selectedCountries",
                  value: country,
                })
              }
            />
          );
        })}
      </FilterSection>

      <FilterSection
        id="city"
        title={t("archive.departureCity")}
        isOpen={openSections.city}
        onToggle={toggleSection}
      >
        {filterMetadata.cities.map((city) => {
          const count = availableFacets.cityCounts.get(city) ?? 0;
          const checked = normalizedFilterState.selectedCities.includes(city);

          return (
            <FacetOption
              key={city}
              type="checkbox"
              label={cityLabels.get(city) ?? city}
              checked={checked}
              count={count}
              disabled={isDisabled(count, checked)}
              onChange={() =>
                dispatch({
                  type: "toggleMulti",
                  key: "selectedCities",
                  value: city,
                })
              }
            />
          );
        })}
      </FilterSection>

      <FilterSection
        id="category"
        title={t("archive.category")}
        isOpen={openSections.category}
        onToggle={toggleSection}
      >
        {filterMetadata.categories.map((category) => {
          const count = availableFacets.categoryCounts.get(category) ?? 0;
          const checked =
            normalizedFilterState.selectedCategories.includes(category);

          return (
            <FacetOption
              key={category}
              type="checkbox"
              label={translateFacetValue("search", category)}
              checked={checked}
              count={count}
              disabled={isDisabled(count, checked)}
              onChange={() =>
                dispatch({
                  type: "toggleMulti",
                  key: "selectedCategories",
                  value: category,
                })
              }
            />
          );
        })}
      </FilterSection>

      <FilterSection
        id="type"
        title={t("archive.tripType")}
        isOpen={openSections.type}
        onToggle={toggleSection}
      >
        {(["all", ...filterMetadata.tripTypes] as const).map((type) => {
          const count =
            type === "all"
              ? filtered.length
              : (availableFacets.tripTypeCounts.get(type) ?? 0);
          const checked = normalizedFilterState.tripType === type;

          return (
            <FacetOption
              key={type}
              type="radio"
              name="tripType"
              label={type === "all" ? t("archive.all") : t(`tripType.${type}`)}
              checked={checked}
              count={count}
              disabled={type !== "all" && isDisabled(count, checked)}
              onChange={() =>
                dispatch({
                  type: "setTripType",
                  value: type as TripTypeFilter,
                })
              }
            />
          );
        })}
      </FilterSection>

      <button
        onClick={resetFilters}
        className="premium-outline-button w-full justify-center text-sm"
      >
        {t("search.reset")}
      </button>
    </div>
  );

  return (
    <div className="premium-page trips-page-surface min-h-screen bg-background text-foreground transition-colors duration-500 relative z-0">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path="/trips"
        image="/branding/navbar/logo-light.svg"
        keywords={seoKeywords}
        lang={lang}
        structuredData={[itemListSchema, breadcrumbSchema]}
      />
      <Navbar darkMode={darkMode} onToggleDark={toggleDark} />

      <div className="pt-36 pb-10 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="premium-panel-soft trips-summary-surface rounded-[1.4rem] px-5 py-4 md:px-6 md:py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label-ui uppercase tracking-[0.18em] text-foreground-muted/80 mb-2">
              {lang === "gr" ? "Αποτελέσματα" : "Results"}
            </p>
            <p className="text-display text-[1.45rem] md:text-[1.85rem] leading-none text-foreground">
              <span className="text-primary mr-2">{filtered.length}</span>
              <span className="text-[0.95rem] md:text-[1.05rem] font-semibold text-foreground-muted align-middle">
                {t("archive.resultsFound")}
              </span>
            </p>
          </div>

          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="lg:hidden premium-outline-button text-sm self-start md:self-auto"
          >
            <SlidersHorizontal size={16} />
            {t("search.filters")}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-24 flex gap-10 relative z-0">
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="premium-panel trips-filter-surface sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-[1.8rem] p-6">
            {filtersContent}
          </div>
        </aside>

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
                className="premium-panel trips-filter-surface fixed left-3 top-3 bottom-3 w-80 max-w-[85vw] z-50 overflow-y-auto rounded-[1.75rem] p-6 lg:hidden"
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

        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="premium-panel rounded-[2rem] text-center py-20 px-6">
              <p className="text-foreground-muted text-lg">
                {t("archive.noResults")}
              </p>
              <button
                onClick={resetFilters}
                className="premium-outline-button mt-6 text-sm"
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
      className="group premium-panel-soft trips-card-surface cursor-pointer rounded-[1.8rem] overflow-hidden flex flex-col sm:flex-row sm:h-[18rem] border-white/65 hover:border-primary/30 transition-all duration-300"
    >
      <div className="sm:w-64 md:w-80 shrink-0 relative overflow-hidden h-56 sm:h-full">
        <img
          src={trip.image}
          alt={localized.title}
          className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {trip.isBonus && (
          <span className="absolute top-4 left-4 premium-chip px-3 py-1.5 text-xs font-bold text-white">
            {t("archive.bonus")}
          </span>
        )}
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-h-0">
        <div>
          <p className="label-ui text-primary/80 mb-2">{localized.dateRange}</p>
          <h3 className="text-xl text-display mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-2 min-h-[3.75rem]">
            {localized.title}
          </h3>
          <p className="premium-subheading text-sm mb-3 line-clamp-2 min-h-[3rem]">
            {localized.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-primary text-base">
              {trip.price}
            </span>
            <span className="text-foreground-muted">{localized.duration}</span>
            {trip.guaranteedDeparture && (
              <span className="premium-outline-button px-3 py-1.5 text-xs">
                {t("archive.guaranteed")}
              </span>
            )}
          </div>
          <span className="premium-outline-button text-sm">
            {t("archive.more")} →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const TripsPage = () => <TripsContent />;

export default TripsPage;
