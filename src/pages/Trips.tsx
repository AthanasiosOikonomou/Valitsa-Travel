// Add global flags for robust scroll detection
declare global {
  interface Window {
    __valitsaPaginationClicked?: boolean;
    __valitsaFilterSectionChanged?: boolean;
  }
}
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

import {
  useEffect,
  useState,
  useMemo,
  useRef,
  useReducer,
  useLayoutEffect,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Trip } from "@/types/Trip";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import TripDetail from "@/components/TripDetail";
import ContactModal from "@/components/ContactModal";
import Seo from "@/components/Seo";
import TermsModal from "@/components/TermsModal";
import { Slider } from "@/components/ui/slider";
import {
  areTripFilterStatesEqual,
  buildAvailableTripFacets,
  buildFilteredTrips,
  buildPriceFacetValues,
  buildTripFilterMetadata,
  createInitialTripFilterState,
  getCityLabelMap,
  sanitizeTripFilterState,
  sortTrips,
  tripFilterReducer,
  type SortOption,
  type TripTypeFilter,
} from "@/lib/tripFilters";
import ProgressiveImage from "@/components/ProgressiveImage";

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
        className={`transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="transform-gpu [backface-visibility:hidden] [transform-origin:top_center]"
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
            className="w-3 h-3 text-black dark:text-primary"
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

const EMPTY_STATE_DEBOUNCE_MS = 280;

const TripsContent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode, toggleDark } = useTheme();
  const { t, lang } = useLanguage();

  const activeFilter = searchParams.get("filter");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  // Blur navbar shell when terms or trip detail overlay is open (scroll lock lives in overlays)
  useEffect(() => {
    if (termsOpen || selectedTrip) {
      document.body.classList.add("modal-blur-active");
    } else {
      document.body.classList.remove("modal-blur-active");
    }
    return () => {
      document.body.classList.remove("modal-blur-active");
    };
  }, [selectedTrip, termsOpen]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const resultsTopRef = useRef<HTMLDivElement | null>(null);
  const hasMountedFilterScrollRef = useRef(false);
  const hasSyncedInitialFiltersRef = useRef(false);
  const [cardsEntryEnabled, setCardsEntryEnabled] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyResults, setShowEmptyResults] = useState(false);

  // Show loading spinner only if loading takes longer than 400ms
  const [showDelayedLoading, setShowDelayedLoading] = useState(false);
  useEffect(() => {
    if (!loading) {
      setShowDelayedLoading(false);
      return;
    }
    const timeout = setTimeout(() => setShowDelayedLoading(true), 400);
    return () => clearTimeout(timeout);
  }, [loading]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    supabase
      .from("trips")
      .select(
        `
        *,
        title, title_el,
        location, location_el,
        country, country_el,
        price_text, price_text_el,
        duration_text, duration_text_el,
        type, type_el,
        image, image_el,
        category, category_el,
        transport, transport_el,
        date_range, date_range_el,
        departure_city, departure_city_el,
        description, description_el
      `,
      )
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setTrips([]);
        } else {
          setTrips(data || []);
        }
        setLoading(false);
      });
  }, []);

  const scrollTripsToTop = () => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = prev;
  };

  // Scroll to results with variable offset
  const scrollResultsToTop = (offset = -120) => {
    if (!resultsTopRef.current) return;

    const top = Math.max(
      0,
      resultsTopRef.current.getBoundingClientRect().top +
        window.scrollY +
        offset,
    );

    window.scrollTo({ top, behavior: "smooth" });
  };

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

  const scopedTrips = useMemo(() => {
    if (activeFilter === "internal") {
      return trips.filter((trip) => trip.country === "Greece");
    }
    if (activeFilter === "external") {
      return trips.filter((trip) => trip.country !== "Greece");
    }
    return trips;
  }, [activeFilter, trips]);

  // Helper to get the correct field based on language
  const getField = (trip, field) => {
    if (
      lang === "gr" &&
      trip[`${field}_el`] !== undefined &&
      trip[`${field}_el`] !== null &&
      trip[`${field}_el`] !== ""
    ) {
      return trip[`${field}_el`];
    }
    if (
      trip[`${field}`] !== undefined &&
      trip[`${field}`] !== null &&
      trip[`${field}`] !== ""
    ) {
      return trip[`${field}`];
    }
    return trip[field];
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://valitsatravel.gr/trips#itemlist",
    name: lang === "gr" ? "Λίστα Ταξιδιών" : "Trips List",
    numberOfItems: trips.length,
    itemListElement: trips.slice(0, 10).map((trip, idx) => {
      return {
        "@type": "ListItem",
        position: idx + 1,
        name: getField(trip, "title"),
        url: `https://valitsatravel.gr/trips?trip=${trip.id}`,
        image: getField(trip, "image"),
        description: getField(trip, "description"),
        priceCurrency: "USD",
        price: String(trip.price_num ?? ""),
        duration: getField(trip, "duration_text"),
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

  const filterMetadata = useMemo(
    () => buildTripFilterMetadata(scopedTrips, lang),
    [scopedTrips, lang],
  );
  const initialFilterState = useMemo(
    () =>
      createInitialTripFilterState(scopedTrips, filterMetadata, activeFilter),
    [activeFilter, filterMetadata],
  );
  const [filterState, dispatch] = useReducer(
    tripFilterReducer,
    initialFilterState,
  );

  const preliminaryFacets = useMemo(
    () =>
      buildAvailableTripFacets(
        scopedTrips,
        filterState,
        lang,
        filterMetadata.globalPriceBounds,
      ),
    [filterMetadata.globalPriceBounds, filterState, lang, scopedTrips],
  );
  const preservedDurations = useMemo(() => {
    if (activeFilter === "daily") return [1];
    if (activeFilter === "twoday") return [2];
    return [] as number[];
  }, [activeFilter]);
  const normalizedFilterState = useMemo(
    () =>
      sanitizeTripFilterState(
        filterState,
        preliminaryFacets,
        filterMetadata,
        preservedDurations,
      ),
    [preliminaryFacets, filterMetadata, filterState, preservedDurations],
  );
  const availableFacets = useMemo(
    () =>
      buildAvailableTripFacets(
        scopedTrips,
        normalizedFilterState,
        lang,
        filterMetadata.globalPriceBounds,
      ),
    [
      filterMetadata.globalPriceBounds,
      lang,
      normalizedFilterState,
      scopedTrips,
    ],
  );
  const filtered = useMemo(
    () =>
      sortTrips(
        buildFilteredTrips(scopedTrips, normalizedFilterState, lang),
        normalizedFilterState.sortBy,
      ),
    [lang, normalizedFilterState, scopedTrips],
  );

  useEffect(() => {
    if (loading || filtered.length > 0) {
      setShowEmptyResults(false);
      return;
    }
    const id = window.setTimeout(() => {
      setShowEmptyResults(true);
    }, EMPTY_STATE_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [loading, filtered.length]);

  const cityLabels = useMemo(
    () => getCityLabelMap(scopedTrips, lang),
    [lang, scopedTrips],
  );
  const pricePoints = useMemo(
    () => buildPriceFacetValues(scopedTrips, normalizedFilterState, lang),
    [lang, normalizedFilterState, scopedTrips],
  );

  const uiPriceRange = useMemo<[number, number]>(() => {
    if (pricePoints.length === 0) {
      return [availableFacets.priceBounds.min, availableFacets.priceBounds.max];
    }

    const minPoint =
      pricePoints.find(
        (value) => value >= normalizedFilterState.priceRange[0],
      ) ?? pricePoints[0];

    const maxPoint =
      [...pricePoints]
        .reverse()
        .find((value) => value <= normalizedFilterState.priceRange[1]) ??
      pricePoints[pricePoints.length - 1];

    return [minPoint, Math.max(minPoint, maxPoint)];
  }, [
    availableFacets.priceBounds.max,
    availableFacets.priceBounds.min,
    normalizedFilterState.priceRange,
    pricePoints,
  ]);

  const priceSliderRange = useMemo<[number, number]>(() => {
    if (pricePoints.length === 0) return [0, 0];

    const minIndex = Math.max(0, pricePoints.indexOf(uiPriceRange[0]));
    const maxIndex = Math.max(minIndex, pricePoints.indexOf(uiPriceRange[1]));
    return [minIndex, maxIndex];
  }, [pricePoints, uiPriceRange]);

  // Before paint: avoid one frame where filterState still uses empty-dataset seed (e.g. price [0,0])
  // so every trip fails the price check and the empty state flashes.
  useLayoutEffect(() => {
    if (!hasSyncedInitialFiltersRef.current) {
      hasSyncedInitialFiltersRef.current = true;
      return;
    }
    dispatch({ type: "replace", value: initialFilterState });
  }, [initialFilterState, scopedTrips]);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      setCardsEntryEnabled(true);
    });

    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handleResetFiltersRequest = () => {
      dispatch({ type: "replace", value: initialFilterState });
      setMobileFiltersOpen(false);
    };

    window.addEventListener(
      "valitsa:reset-trips-filters",
      handleResetFiltersRequest,
    );

    return () => {
      window.removeEventListener(
        "valitsa:reset-trips-filters",
        handleResetFiltersRequest,
      );
    };
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

    const matchedTrip = scopedTrips.find(
      (trip) => String(trip.id) === String(tripParam),
    );
    if (matchedTrip) {
      setSelectedTrip(matchedTrip);
    }
  }, [scopedTrips, searchParams]);

  // Only scroll on explicit user actions: pagination (-280) or filter section (-120)
  const prevPageRef = useRef(normalizedFilterState.page);
  const prevFilterRef = useRef({ ...normalizedFilterState });
  useEffect(() => {
    if (!hasMountedFilterScrollRef.current) {
      hasMountedFilterScrollRef.current = true;
      prevPageRef.current = normalizedFilterState.page;
      prevFilterRef.current = { ...normalizedFilterState };
      return;
    }

    if (mobileFiltersOpen) return;

    const prevPage = prevPageRef.current;
    const prevFilter = prevFilterRef.current;
    const currPage = normalizedFilterState.page;

    // Shallow compare filter state excluding 'page'
    const filterKeys = Object.keys(normalizedFilterState).filter(
      (k) => k !== "page",
    );
    let filterChanged = false;
    for (const key of filterKeys) {
      if (normalizedFilterState[key] !== prevFilter[key]) {
        filterChanged = true;
        break;
      }
    }

    // Only scroll -280 if the page changed due to a pagination button click

    // Only scroll -120 if the filter section changed
    if (filterChanged && window.__valitsaFilterSectionChanged) {
      scrollResultsToTop(-120);
      window.__valitsaFilterSectionChanged = false;
    }

    prevPageRef.current = currPage;
    prevFilterRef.current = { ...normalizedFilterState };
  }, [mobileFiltersOpen, normalizedFilterState]);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const translateFacetValue = (prefix: string, fallback: string) => {
    const translated = t(`${prefix}.${fallback}`);
    return translated === `${prefix}.${fallback}` ? fallback : translated;
  };

  const isDisabled = (count: number, selected: boolean) =>
    !selected && count === 0;

  const mobileApplyLabel =
    lang === "gr"
      ? `Εμφάνιση ${filtered.length} ταξιδ${filtered.length === 1 ? "ιού" : "ιών"}`
      : `Show ${filtered.length} ${filtered.length === 1 ? "Trip" : "Trips"}`;

  const mobileClearLabel = lang === "gr" ? "Καθαρισμός" : "Clear";

  const noTripsTitle =
    lang === "gr"
      ? "Δεν βρήκαμε διαθέσιμα ταξίδια με αυτά τα φίλτρα"
      : "No trips match these filters right now";

  const noTripsDescription =
    lang === "gr"
      ? "Δοκιμάστε να χαλαρώσετε κάποια φίλτρα ή περιγράψτε μας ακριβώς τι θέλετε και θα σας προτείνουμε το ιδανικό ταξίδι."
      : "Try relaxing some filters, or tell us exactly what you need and we will suggest the best trip for you.";

  const noTripsContactPrefix =
    lang === "gr"
      ? "Για κάτι πιο συγκεκριμένο,"
      : "If you want something more specific,";

  const noTripsContactLink = lang === "gr" ? "πατήστε εδώ" : "click here";

  const noTripsContactSuffix =
    lang === "gr" ? "για να μιλήσουμε." : "to talk with us.";

  const resetFilters = () => {
    setSelectedTrip(null);
    setMobileFiltersOpen(false);
    navigate("/trips", { replace: true });
    dispatch({
      type: "replace",
      value: createInitialTripFilterState(scopedTrips, filterMetadata, null),
    });
  };

  const renderFiltersContent = (showResetButton: boolean) => (
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
            onChange={(event) => {
              window.__valitsaFilterSectionChanged = true;
              dispatch({ type: "setSearchQuery", value: event.target.value });
            }}
            placeholder={t("archive.searchPlaceholder")}
            className="input-elevated w-full pl-10 pr-4 py-3 rounded-xl bg-background text-sm"
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
          ${uiPriceRange[0].toLocaleString()} - $
          {uiPriceRange[1].toLocaleString()}
        </p>
        <Slider
          min={0}
          max={Math.max(0, pricePoints.length - 1)}
          step={1}
          disabled={pricePoints.length <= 1}
          value={priceSliderRange}
          onValueChange={(value) => {
            window.__valitsaFilterSectionChanged = true;
            dispatch({
              type: "setPriceRange",
              value: [
                pricePoints[value[0]] ?? uiPriceRange[0],
                pricePoints[value[1]] ?? uiPriceRange[1],
              ] as [number, number],
            });
          }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({ type: "setSortBy", value: value as SortOption });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({ type: "toggleFlag", key: "showBonus" });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({ type: "toggleFlag", key: "showGuaranteed" });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({ type: "toggleFlag", key: "showAvailable" });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({ type: "toggleFlag", key: "showFeatured" });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({
                  type: "toggleMulti",
                  key: "selectedContinents",
                  value: continent,
                });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({
                  type: "toggleMulti",
                  key: "selectedDurations",
                  value: duration,
                });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({
                  type: "toggleMulti",
                  key: "selectedCountries",
                  value: country,
                });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({
                  type: "toggleMulti",
                  key: "selectedCities",
                  value: city,
                });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({
                  type: "toggleMulti",
                  key: "selectedCategories",
                  value: category,
                });
              }}
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
              onChange={() => {
                window.__valitsaFilterSectionChanged = true;
                dispatch({
                  type: "setTripType",
                  value: type as TripTypeFilter,
                });
              }}
            />
          );
        })}
      </FilterSection>

      {showResetButton ? (
        <button
          onClick={resetFilters}
          className="premium-outline-button w-full justify-center text-sm"
        >
          {t("search.reset")}
        </button>
      ) : null}
    </div>
  );

  const filtersContent = renderFiltersContent(false);
  const mobileFiltersContent = renderFiltersContent(false);

  return (
    <div className="premium-page trips-page-surface min-h-screen bg-background text-foreground transition-colors duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] relative z-0">
      <Seo
        title={seoTitle}
        description={seoDescription}
        path="/trips"
        image="/branding/navbar/logo-light.svg"
        keywords={seoKeywords}
        lang={lang}
        structuredData={[itemListSchema, breadcrumbSchema]}
      />

      <div className="pt-36 pb-10 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="premium-panel-soft trips-summary-surface rounded-[1.4rem] px-5 py-4 md:px-6 md:py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label-ui uppercase tracking-[0.18em] text-foreground-muted/80 mb-2">
              {lang === "gr" ? "Αποτελέσματα" : "Results"}
            </p>
            <p className="text-[1.45rem] md:text-[1.85rem] leading-none text-foreground">
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

      <div
        ref={resultsTopRef}
        className="max-w-7xl mx-auto px-6 md:px-10 pb-24 flex gap-10 relative z-0"
      >
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="premium-panel trips-filter-surface sticky top-32 max-h-[calc(100vh-9rem)] rounded-[1.8rem] p-6 flex flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-6">
              {filtersContent}
            </div>

            <div className="pt-4 border-t border-border/70">
              <button
                onClick={resetFilters}
                className="premium-outline-button w-full justify-center text-sm"
              >
                {t("search.reset")}
              </button>
            </div>
          </div>
        </aside>

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <motion.div
                initial={{ x: -24, opacity: 0, scale: 0.98 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -24, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="premium-panel trips-filter-surface fixed left-3 top-3 bottom-3 w-80 max-w-[85vw] z-50 rounded-[1.75rem] p-4 sm:p-5 lg:hidden flex flex-col transform-gpu [backface-visibility:hidden]"
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

                <div className="min-h-0 flex-1 overflow-y-auto pr-1 pb-28">
                  {mobileFiltersContent}
                </div>

                <div className="absolute inset-x-4 bottom-4 sm:inset-x-5">
                  <div className="rounded-[1.35rem] border-0 bg-white/88 p-3 shadow-elev2 backdrop-blur-xl dark:bg-slate-950/86 dark:shadow-elev2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetFilters}
                        className="premium-outline-button min-w-0 flex-1 justify-center text-sm px-4 py-3"
                      >
                        {mobileClearLabel}
                      </button>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="premium-button trips-mobile-apply-button min-w-0 flex-[1.35] justify-center text-sm px-4 py-3"
                      >
                        {mobileApplyLabel}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0">
          {showDelayedLoading ? (
            <div className="premium-panel-soft trips-card-surface rounded-[2rem] py-14 px-6 md:px-10 flex items-center justify-center min-h-[300px]">
              <span className="text-lg text-foreground-muted">
                {lang === "gr" ? "Φόρτωση..." : "Loading..."}
              </span>
            </div>
          ) : loading ? (
            <div style={{ minHeight: 300 }} />
          ) : filtered.length === 0 && !showEmptyResults ? (
            <div style={{ minHeight: 300 }} />
          ) : filtered.length === 0 ? (
            <div className="premium-panel-soft trips-card-surface rounded-[2rem] py-14 px-6 md:px-10">
              <div className="max-w-2xl">
                <p className="label-ui uppercase tracking-[0.18em] text-primary/85 mb-3">
                  {lang === "gr" ? "Καμία Διαθεσιμότητα" : "No Availability"}
                </p>
                <h3 className="text-[1.65rem] md:text-[2rem] leading-tight text-foreground mb-4">
                  {noTripsTitle}
                </h3>
                <p className="premium-subheading text-[1rem] md:text-[1.05rem] leading-relaxed mb-6 max-w-xl">
                  {noTripsDescription}
                </p>
                <p className="text-sm md:text-base text-foreground-muted mb-8">
                  {noTripsContactPrefix}{" "}
                  <button
                    onClick={() => setContactOpen(true)}
                    className="font-semibold text-primary underline decoration-primary/50 underline-offset-4 hover:text-foreground transition-colors"
                  >
                    {noTripsContactLink}
                  </button>{" "}
                  {noTripsContactSuffix}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="premium-outline-button text-sm"
                  >
                    {t("search.reset")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {filtered.map((trip, idx) => (
                  <TripResultCard
                    key={trip.id}
                    trip={trip}
                    index={idx}
                    animateEntry={cardsEntryEnabled}
                    onClick={setSelectedTrip}
                  />
                ))}
              </div>
              {/* Pagination removed */}
            </>
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
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

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
            width={200}
            height={60}
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

interface TripResultCardProps {
  animateEntry: boolean;
  trip: Trip;
  index: number;
  onClick: (trip: Trip) => void;
}

const TripResultCard = ({
  trip,
  index,
  onClick,
  animateEntry,
}: TripResultCardProps) => {
  const { t, lang } = useLanguage();

  // Helper to get the correct field for the current language
  const getField = (field: string) => {
    if (lang === "gr" && trip[`${field}_el`] !== undefined) {
      return trip[`${field}_el`] ?? trip[field];
    }
    return trip[field];
  };

  return (
    <motion.div
      initial={animateEntry ? { opacity: 0, y: 10, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.38,
        delay: animateEntry ? index * 0.05 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => onClick(trip)}
      className="group premium-panel-soft trips-card-surface cursor-pointer rounded-[1.8rem] overflow-hidden flex flex-col sm:flex-row sm:h-[18rem] transform-gpu [backface-visibility:hidden] will-change-transform transition-[transform,opacity,box-shadow] duration-elev ease-material hover:shadow-elev3 hover:scale-[1.01] active:scale-[0.97]"
    >
      <div className="sm:w-64 md:w-80 shrink-0 relative overflow-hidden h-56 sm:h-full">
        <ProgressiveImage
          src={trip.image}
          alt={getField("title")}
          width={1200}
          height={900}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
          className="h-48 sm:h-full"
          imgClassName="group-hover:scale-[1.04] transition-transform duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
        {/* Tags and bonus chip */}
        <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2">
          {Array.isArray(trip.tags) &&
            trip.tags.length > 0 &&
            trip.tags.map((tag) => (
              <span
                key={tag}
                className="premium-chip border-white/45 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          {trip.is_bonus && (
            <span className="premium-chip border-white/45 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              {t("archive.bonus")}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-h-0">
        <div>
          <p className="label-ui text-primary/80 mb-2">
            {getField("date_range")}
          </p>
          <h3 className="text-xl text-display mb-2 group-hover:text-primary transition-colors duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] leading-tight line-clamp-2 min-h-[3.75rem]">
            {getField("title")}
          </h3>
          <p className="premium-subheading text-sm mb-3 line-clamp-2 min-h-[3rem]">
            {getField("description")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-primary text-base">
              {getField("price_text")}
            </span>
            <span className="text-foreground-muted">
              {getField("duration_text")}
            </span>
            {trip.guaranteed_departure && (
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

const TripsPage = () => {
  const [searchParams] = useSearchParams();
  const activeFilter = searchParams.get("filter") ?? "all";
  return <TripsContent key={activeFilter} />;
};

export default TripsPage;
