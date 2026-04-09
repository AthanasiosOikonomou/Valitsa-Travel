import type { Trip } from "@/types/Trip";
import {
  effectiveTripListDuration,
  effectiveTripListPrice,
  tripDepartureCityLabelsForFilter,
  tripDepartureMonthsAugmented,
} from "@/lib/tripPricing";
import {
  TRANSPORT_MODE_SLUGS,
  mergeTransportSlugsFromColumns,
  type TransportModeSlug,
} from "@/lib/tripTransportModes";

export type TripLang = "en" | "gr";

export type SortOption = "recommended" | "priceAsc" | "priceDesc";

type MultiSelectKey =
  | "selectedCountries"
  | "selectedDurations"
  | "selectedCities"
  | "selectedTransportSlugs"
  | "selectedMonths";

type FlagKey = "showFeatured";

type FacetKey =
  | "country"
  | "duration"
  | "city"
  | "featured"
  | "price"
  | "transport"
  | "month";

export interface RangeBounds {
  min: number;
  max: number;
}

export interface TripFilterState {
  searchQuery: string;
  priceRange: [number, number];
  selectedCountries: string[];
  selectedDurations: number[];
  selectedCities: string[];
  selectedTransportSlugs: TransportModeSlug[];
  /** Calendar months 1–12; empty means no month filter. */
  selectedMonths: number[];
  showFeatured: boolean;
  sortBy: SortOption;
  page: number;
}

export type TripFilterAction =
  | { type: "replace"; value: TripFilterState }
  | { type: "sync"; value: Partial<TripFilterState> }
  | { type: "setSearchQuery"; value: string }
  | { type: "setPriceRange"; value: [number, number] }
  | { type: "toggleMulti"; key: MultiSelectKey; value: string | number }
  | { type: "toggleFlag"; key: FlagKey }
  | { type: "setPage"; value: number }
  | { type: "setSortBy"; value: SortOption };

export interface TripFilterMetadata {
  globalPriceBounds: RangeBounds;
  countries: string[];
  durations: number[];
  cities: string[];
  transportSlugs: TransportModeSlug[];
  hasFeaturedTrips: boolean;
  /** Months 1–12 that appear in at least one trip’s structured departure windows. */
  months: number[];
}

export interface AvailableTripFacets {
  priceBounds: RangeBounds;
  countryCounts: Map<string, number>;
  durationCounts: Map<number, number>;
  cityCounts: Map<string, number>;
  transportCounts: Map<TransportModeSlug, number>;
  monthCounts: Map<number, number>;
  specialCounts: {
    featured: number;
  };
}

const filterPresets: Record<string, { selectedDurations?: number[] }> = {
  daily: { selectedDurations: [1] },
  twoday: { selectedDurations: [2] },
  multiday: {},
  internal: {},
  external: {},
};

const getPresetCountries = (filter: string | null, countries: string[]) => {
  if (filter === "internal" || filter === "external") return [];
  return [];
};


type LocalizedStringField = "title" | "location" | "country" | "departure_city";

function getTripField(trip: Trip, field: LocalizedStringField, lang: TripLang): string {
  if (lang === "gr") {
    const elKey = `${field}_el` as keyof Trip;
    const el = trip[elKey];
    if (el != null && String(el).trim() !== "") {
      return String(el);
    }
  }
  const base = trip[field];
  return base != null ? String(base) : "";
}

const addCount = <T>(map: Map<T, number>, key: T) => {
  map.set(key, (map.get(key) ?? 0) + 1);
};

const getRangeBounds = (
  values: number[],
  fallback: RangeBounds,
): RangeBounds => {
  if (values.length === 0) return fallback;

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
};

const sortCountries = (countries: string[]) =>
  countries.sort((left, right) => {
    if (left === "Greece") return -1;
    if (right === "Greece") return 1;
    return left.localeCompare(right);
  });

const sortUniqueStrings = (values: string[]) => [...new Set(values)].sort();

const collectTransportSlugsFromTrips = (trips: Trip[]): TransportModeSlug[] => {
  const seen = new Set<TransportModeSlug>();
  for (const trip of trips) {
    for (const slug of mergeTransportSlugsFromColumns(
      trip.transport_el,
      trip.transport,
    )) {
      seen.add(slug);
    }
  }
  return TRANSPORT_MODE_SLUGS.filter((slug) => seen.has(slug));
};

export const buildTripFilterMetadata = (trips: Trip[], lang: TripLang): TripFilterMetadata => {
  const globalPriceBounds = getRangeBounds(
    trips.map((trip) => effectiveTripListPrice(trip) ?? 0),
    { min: 0, max: 0 },
  );

  const monthSet = new Set<number>();
  for (const trip of trips) {
    for (const m of tripDepartureMonthsAugmented(trip)) {
      monthSet.add(m);
    }
  }

  return {
    globalPriceBounds,
    countries: sortCountries([
      ...new Set(trips.map((trip) => getTripField(trip, "country", lang) ?? "")),
    ]),
    durations: [...new Set(trips.map((trip) => effectiveTripListDuration(trip) ?? 0))].sort(
      (left, right) => left - right,
    ),
    cities: sortUniqueStrings(
      trips.flatMap((trip) => tripDepartureCityLabelsForFilter(trip, lang)),
    ),
    transportSlugs: collectTransportSlugsFromTrips(trips),
    hasFeaturedTrips: trips.some((trip) => trip.is_featured),
    months: [...monthSet].sort((a, b) => a - b),
  };
};

export type CreateInitialTripFilterOptions = {
  /** When set with `filter=multiday`, seed a single duration (must exist in metadata and be > 2). */
  multidayDays?: number | null;
};

export const createInitialTripFilterState = (
  trips: Trip[],
  metadata: TripFilterMetadata,
  activeFilter: string | null,
  options?: CreateInitialTripFilterOptions,
): TripFilterState => {
  const preset = activeFilter ? filterPresets[activeFilter] : undefined;
  let selectedDurations: number[] = preset?.selectedDurations ?? [];
  if (activeFilter === "multiday") {
    const over2 = metadata.durations.filter((d) => d > 2);
    const single = options?.multidayDays;
    if (
      single != null &&
      single > 2 &&
      metadata.durations.includes(single)
    ) {
      selectedDurations = [single];
    } else {
      selectedDurations = over2.length > 0 ? over2 : [-1];
    }
  }
  const seedState: TripFilterState = {
    searchQuery: "",
    priceRange: [
      metadata.globalPriceBounds.min,
      metadata.globalPriceBounds.max,
    ],
    selectedCountries: getPresetCountries(activeFilter, metadata.countries),
    selectedDurations,
    selectedCities: [],
    selectedTransportSlugs: [],
    selectedMonths: [],
    showFeatured: false,
    sortBy: "recommended",
    page: 1,
  };

  const priceBounds = getPriceBoundsForState(
    trips,
    seedState,
    metadata.globalPriceBounds,
    "en",
  );

  return {
    ...seedState,
    priceRange: [priceBounds.min, priceBounds.max],
  };
};

export const tripFilterReducer = (
  state: TripFilterState,
  action: TripFilterAction,
): TripFilterState => {
  switch (action.type) {
    case "replace":
      return action.value;
    case "sync":
      return { ...state, ...action.value };
    case "setSearchQuery":
      return { ...state, searchQuery: action.value };
    case "setPriceRange":
      return { ...state, priceRange: action.value };
    case "toggleMulti": {
      const values = state[action.key];
      const hasValue = values.includes(action.value as never);
      return {
        ...state,
        [action.key]: hasValue
          ? values.filter((value) => value !== action.value)
          : [...values, action.value],
      } as TripFilterState;
    }
    case "toggleFlag":
      return { ...state, [action.key]: !state[action.key] };
    case "setSortBy":
      return { ...state, sortBy: action.value };
    case "setPage":
      return { ...state, page: action.value };
    default:
      return state;
  }
};

export const getCityLabelMap = (trips: Trip[], lang: TripLang) => {
  const labels = new Map<string, string>();
  for (const trip of trips) {
    for (const city of tripDepartureCityLabelsForFilter(trip, lang)) {
      if (!city) continue;
      if (!labels.has(city)) labels.set(city, city);
    }
  }
  return labels;
};

export const buildAvailableTripFacets = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
  fallbackPriceBounds: RangeBounds,
): AvailableTripFacets => {

  const countryCounts = buildFacetCounts(
    trips,
    state,
    lang,
    "country",
    (trip) => getTripField(trip, "country", lang) ?? "",
  );
  const durationCounts = buildFacetCounts(
    trips,
    state,
    lang,
    "duration",
    (trip) => effectiveTripListDuration(trip) ?? 0,
  );
  const cityCounts = buildCityFacetCounts(trips, state, lang);
  const transportCounts = buildTransportFacetCounts(trips, state, lang);
  const monthCounts = buildMonthFacetCounts(trips, state, lang);

  const priceBounds = getPriceBoundsForState(
    trips,
    state,
    fallbackPriceBounds,
    lang,
  );
  const specialCounts = getSpecialCounts(trips, state, lang);

  return {
    priceBounds,
    countryCounts,
    durationCounts,
    cityCounts,
    transportCounts,
    monthCounts,
    specialCounts,
  };
};

export const buildFilteredTrips = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
) => trips.filter((trip) => matchesTripFilters(trip, state, lang));

const tripCreatedTime = (trip: Trip) => {
  if (!trip.created_at) return 0;
  const t = new Date(trip.created_at).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export const sortTrips = (trips: Trip[], sortBy: SortOption) => {
  const sortedTrips = [...trips];

  switch (sortBy) {
    case "priceAsc":
      sortedTrips.sort(
        (left, right) =>
          (effectiveTripListPrice(left) ?? 0) - (effectiveTripListPrice(right) ?? 0),
      );
      return sortedTrips;
    case "priceDesc":
      sortedTrips.sort(
        (left, right) =>
          (effectiveTripListPrice(right) ?? 0) - (effectiveTripListPrice(left) ?? 0),
      );
      return sortedTrips;
    case "recommended":
    default:
      sortedTrips.sort((left, right) => {
        const leftFeatured = Number(Boolean(left.is_featured));
        const rightFeatured = Number(Boolean(right.is_featured));
        if (rightFeatured !== leftFeatured) {
          return rightFeatured - leftFeatured;
        }
        return tripCreatedTime(right) - tripCreatedTime(left);
      });
      return sortedTrips;
  }
};

export const buildPriceFacetValues = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
) => {
  const prices = new Set<number>();

  for (const trip of trips) {
    if (!matchesTripFilters(trip, state, lang, "price")) continue;
    prices.add(effectiveTripListPrice(trip) ?? 0);
  }

  return [...prices].sort((left, right) => left - right);
};

export const sanitizeTripFilterState = (
  state: TripFilterState,
  availableFacets: AvailableTripFacets,
  metadata: TripFilterMetadata,
  preservedDurations: number[] = [],
): TripFilterState => {
  // Keep user-selected price range stable across facet toggles.
  // Only clamp against global bounds to avoid locking other facets.
  const nextPriceRange = clampRange(
    state.priceRange,
    metadata.globalPriceBounds,
  );

  return {
    ...state,
    priceRange: nextPriceRange,
    selectedCountries: state.selectedCountries.filter((value) =>
      availableFacets.countryCounts.has(value),
    ),
    selectedDurations: state.selectedDurations.filter(
      (value) =>
        preservedDurations.includes(value) ||
        availableFacets.durationCounts.has(value),
    ),
    selectedCities: state.selectedCities.filter((value) =>
      availableFacets.cityCounts.has(value),
    ),
    selectedTransportSlugs: state.selectedTransportSlugs.filter((value) =>
      availableFacets.transportCounts.has(value),
    ),
    selectedMonths: state.selectedMonths.filter((value) =>
      metadata.months.includes(value),
    ),
    showFeatured:
      state.showFeatured &&
      metadata.hasFeaturedTrips &&
      availableFacets.specialCounts.featured > 0,
  };
};

export const areTripFilterStatesEqual = (
  left: TripFilterState,
  right: TripFilterState,
) =>
  left.searchQuery === right.searchQuery &&
  left.priceRange[0] === right.priceRange[0] &&
  left.priceRange[1] === right.priceRange[1] &&
  arraysEqual(left.selectedCountries, right.selectedCountries) &&
  arraysEqual(left.selectedDurations, right.selectedDurations) &&
  arraysEqual(left.selectedCities, right.selectedCities) &&
  arraysEqual(left.selectedTransportSlugs, right.selectedTransportSlugs) &&
  arraysEqual(left.selectedMonths, right.selectedMonths) &&
  left.showFeatured === right.showFeatured &&
  left.sortBy === right.sortBy;

const arraysEqual = <T extends string | number>(left: T[], right: T[]) => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

const buildCityFacetCounts = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
): Map<string, number> => {
  const counts = new Map<string, number>();

  for (const trip of trips) {
    if (!matchesTripFilters(trip, state, lang, "city")) continue;
    const seen = new Set<string>();
    for (const city of tripDepartureCityLabelsForFilter(trip, lang)) {
      if (!city || seen.has(city)) continue;
      seen.add(city);
      addCount(counts, city);
    }
  }

  return counts;
};

const buildTransportFacetCounts = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
): Map<TransportModeSlug, number> => {
  const counts = new Map<TransportModeSlug, number>();

  for (const trip of trips) {
    if (!matchesTripFilters(trip, state, lang, "transport")) continue;
    const slugs = mergeTransportSlugsFromColumns(
      trip.transport_el,
      trip.transport,
    );
    const seen = new Set<TransportModeSlug>();
    for (const slug of slugs) {
      if (seen.has(slug)) continue;
      seen.add(slug);
      addCount(counts, slug);
    }
  }

  return counts;
};

const buildMonthFacetCounts = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
): Map<number, number> => {
  const counts = new Map<number, number>();

  for (const trip of trips) {
    if (!matchesTripFilters(trip, state, lang, "month")) continue;
    const months = tripDepartureMonthsAugmented(trip);
    const seen = new Set<number>();
    for (const m of months) {
      if (seen.has(m)) continue;
      seen.add(m);
      addCount(counts, m);
    }
  }

  return counts;
};

const clampRange = (
  currentRange: [number, number],
  bounds: RangeBounds,
): [number, number] => {
  const nextMin = Math.max(bounds.min, Math.min(currentRange[0], bounds.max));
  const nextMax = Math.max(nextMin, Math.min(currentRange[1], bounds.max));
  return [nextMin, nextMax];
};

const buildFacetCounts = <T extends string | number>(
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
  excludedFacet: FacetKey,
  getValue: (trip: Trip) => T,
) => {
  const counts = new Map<T, number>();

  for (const trip of trips) {
    if (!matchesTripFilters(trip, state, lang, excludedFacet)) continue;
    addCount(counts, getValue(trip));
  }

  return counts;
};

const getPriceBoundsForState = (
  trips: Trip[],
  state: TripFilterState,
  fallbackBounds: RangeBounds,
  lang: TripLang,
) => {
  const values: number[] = [];

  for (const trip of trips) {
    if (!matchesTripFilters(trip, state, lang, "price")) continue;
    values.push(effectiveTripListPrice(trip) ?? 0);
  }

  return getRangeBounds(values, fallbackBounds);
};

const getSpecialCounts = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
) => {
  let featured = 0;

  for (const trip of trips) {
    if (matchesTripFilters(trip, state, lang, "featured") && trip.is_featured) {
      featured += 1;
    }
  }

  return { featured };
};

const matchesTripFilters = (
  trip: Trip,
  state: TripFilterState,
  lang: TripLang,
  excludedFacet?: FacetKey,
) => {
  // Search query: use correct language fields
  if (state.searchQuery) {
    const searchable =
      `${getTripField(trip, "title", lang) ?? ""} ${getTripField(trip, "location", lang) ?? ""}`.toLowerCase();
    if (!searchable.includes(state.searchQuery.toLowerCase())) {
      return false;
    }
  }

  if (
    excludedFacet !== "price" &&
    ((effectiveTripListPrice(trip) ?? 0) < state.priceRange[0] ||
      (effectiveTripListPrice(trip) ?? 0) > state.priceRange[1])
  ) {
    return false;
  }

  if (
    excludedFacet !== "country" &&
    state.selectedCountries.length > 0 &&
    !state.selectedCountries.includes(getTripField(trip, "country", lang) ?? "")
  ) {
    return false;
  }

  if (
    excludedFacet !== "duration" &&
    state.selectedDurations.length > 0 &&
    !state.selectedDurations.includes(effectiveTripListDuration(trip) ?? 0)
  ) {
    return false;
  }

  if (excludedFacet !== "city" && state.selectedCities.length > 0) {
    const labels = tripDepartureCityLabelsForFilter(trip, lang);
    const overlaps = state.selectedCities.some((c) => labels.includes(c));
    if (!overlaps) {
      return false;
    }
  }

  if (excludedFacet !== "transport" && state.selectedTransportSlugs.length > 0) {
    const tripSlugs = mergeTransportSlugsFromColumns(
      trip.transport_el,
      trip.transport,
    );
    const overlaps = state.selectedTransportSlugs.some((s) =>
      tripSlugs.includes(s),
    );
    if (!overlaps) {
      return false;
    }
  }

  if (excludedFacet !== "featured" && state.showFeatured && !trip.is_featured) {
    return false;
  }

  if (
    excludedFacet !== "month" &&
    state.selectedMonths.length > 0
  ) {
    const tripMonths = tripDepartureMonthsAugmented(trip);
    if (tripMonths.size === 0) {
      return false;
    }
    const overlaps = state.selectedMonths.some((m) => tripMonths.has(m));
    if (!overlaps) {
      return false;
    }
  }

  return true;
};
