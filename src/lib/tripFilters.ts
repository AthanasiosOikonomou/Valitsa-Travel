
import type { Trip } from "@/types/Trip";

export type TripLang = "en" | "gr";

export type SortOption = "recommended" | "priceAsc" | "priceDesc";

type MultiSelectKey =
  | "selectedContinents"
  | "selectedCountries"
  | "selectedDurations"
  | "selectedCities";

type FlagKey = "showFeatured";

type FacetKey =
  | "continent"
  | "country"
  | "duration"
  | "city"
  | "featured"
  | "price";

export interface RangeBounds {
  min: number;
  max: number;
}

export interface TripFilterState {
  searchQuery: string;
  priceRange: [number, number];
  selectedContinents: string[];
  selectedCountries: string[];
  selectedDurations: number[];
  selectedCities: string[];
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
  continents: string[];
  countries: string[];
  durations: number[];
  cities: string[];
  hasFeaturedTrips: boolean;
}

export interface AvailableTripFacets {
  priceBounds: RangeBounds;
  continentCounts: Map<string, number>;
  countryCounts: Map<string, number>;
  durationCounts: Map<number, number>;
  cityCounts: Map<string, number>;
  specialCounts: {
    featured: number;
  };
}

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


const getContinent = (country: string) => countryToContinent[country] ?? "Other";

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

export const buildTripFilterMetadata = (trips: Trip[], lang: TripLang): TripFilterMetadata => {
  const globalPriceBounds = getRangeBounds(
    trips.map((trip) => trip.price_num ?? 0),
    { min: 0, max: 0 },
  );

  return {
    globalPriceBounds,
    continents: sortUniqueStrings(
      trips.map((trip) => getContinent(getTripField(trip, "country", lang) ?? "")),
    ),
    countries: sortCountries([
      ...new Set(trips.map((trip) => getTripField(trip, "country", lang) ?? "")),
    ]),
    durations: [...new Set(trips.map((trip) => trip.duration_days ?? 0))].sort(
      (left, right) => left - right,
    ),
    cities: sortUniqueStrings(trips.map((trip) => getTripField(trip, "departure_city", lang) ?? "")),
    hasFeaturedTrips: trips.some((trip) => trip.is_featured),
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
    selectedContinents: [],
    selectedCountries: getPresetCountries(activeFilter, metadata.countries),
    selectedDurations,
    selectedCities: [],
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
    const city = getTripField(trip, "departure_city", lang);
    if (!labels.has(city)) {
      labels.set(city, city);
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

  const continentCounts = buildFacetCounts(
    trips,
    state,
    lang,
    "continent",
    (trip) => getContinent(getTripField(trip, "country", lang) ?? ""),
  );
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
    (trip) => trip.duration_days ?? 0,
  );
  const cityCounts = buildFacetCounts(
    trips,
    state,
    lang,
    "city",
    (trip) => getTripField(trip, "departure_city", lang) ?? "",
  );

  const priceBounds = getPriceBoundsForState(
    trips,
    state,
    fallbackPriceBounds,
    lang,
  );
  const specialCounts = getSpecialCounts(trips, state, lang);

  return {
    priceBounds,
    continentCounts,
    countryCounts,
    durationCounts,
    cityCounts,
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
        (left, right) => (left.price_num ?? 0) - (right.price_num ?? 0),
      );
      return sortedTrips;
    case "priceDesc":
      sortedTrips.sort(
        (left, right) => (right.price_num ?? 0) - (left.price_num ?? 0),
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
    prices.add(trip.price_num ?? 0);
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
    selectedContinents: state.selectedContinents.filter((value) =>
      availableFacets.continentCounts.has(value),
    ),
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
  arraysEqual(left.selectedContinents, right.selectedContinents) &&
  arraysEqual(left.selectedCountries, right.selectedCountries) &&
  arraysEqual(left.selectedDurations, right.selectedDurations) &&
  arraysEqual(left.selectedCities, right.selectedCities) &&
  left.showFeatured === right.showFeatured &&
  left.sortBy === right.sortBy;

export const getContinentLabel = (country: string) => getContinent(country);

const arraysEqual = <T extends string | number>(left: T[], right: T[]) => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
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
    values.push(trip.price_num ?? 0);
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
    ((trip.price_num ?? 0) < state.priceRange[0] ||
      (trip.price_num ?? 0) > state.priceRange[1])
  ) {
    return false;
  }

  if (
    excludedFacet !== "continent" &&
    state.selectedContinents.length > 0 &&
    !state.selectedContinents.includes(getContinent(getTripField(trip, "country", lang) ?? ""))
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
    !state.selectedDurations.includes(trip.duration_days ?? 0)
  ) {
    return false;
  }

  if (
    excludedFacet !== "city" &&
    state.selectedCities.length > 0 &&
    !state.selectedCities.includes(getTripField(trip, "departure_city", lang) ?? "")
  ) {
    return false;
  }

  if (excludedFacet !== "featured" && state.showFeatured && !trip.is_featured) {
    return false;
  }

  return true;
};
