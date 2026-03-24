import type { Trip } from "@/types/Trip";
// Remove TripLang and getLocalizedTripContent, use direct fields

export type SortOption = "recommended" | "priceAsc" | "priceDesc";
export type TripTypeFilter = "all" | Trip["type"];

type MultiSelectKey =
  | "selectedContinents"
  | "selectedCountries"
  | "selectedDurations"
  | "selectedCities"
  | "selectedCategories";

type FlagKey =
  | "showBonus"
  | "showGuaranteed"
  | "showAvailable"
  | "showFeatured";

type FacetKey =
  | "continent"
  | "country"
  | "duration"
  | "city"
  | "category"
  | "tripType"
  | "bonus"
  | "guaranteed"
  | "available"
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
  selectedCategories: string[];
  showBonus: boolean;
  showGuaranteed: boolean;
  showAvailable: boolean;
  showFeatured: boolean;
  tripType: TripTypeFilter;
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
  | { type: "setTripType"; value: TripTypeFilter }
  | { type: "setSortBy"; value: SortOption };

export interface TripFilterMetadata {
  globalPriceBounds: RangeBounds;
  continents: string[];
  countries: string[];
  durations: number[];
  cities: string[];
  categories: string[];
  tripTypes: Trip["type"][];
  hasBonusTrips: boolean;
  hasGuaranteedTrips: boolean;
  hasAvailableTrips: boolean;
  hasFeaturedTrips: boolean;
}

export interface AvailableTripFacets {
  priceBounds: RangeBounds;
  continentCounts: Map<string, number>;
  countryCounts: Map<string, number>;
  durationCounts: Map<number, number>;
  cityCounts: Map<string, number>;
  categoryCounts: Map<string, number>;
  tripTypeCounts: Map<Trip["type"], number>;
  specialCounts: {
    bonus: number;
    guaranteed: number;
    available: number;
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

const filterPresets: Record<
  string,
  { selectedDurations?: number[]; selectedCategories?: string[] }
> = {
  daily: { selectedDurations: [1] },
  twoday: { selectedDurations: [2] },
  internal: {},
  external: {},
};

const getPresetCountries = (filter: string | null, countries: string[]) => {
  if (filter === "internal" || filter === "external") return [];
  return [];
};

const getContinent = (country: string) =>
  countryToContinent[country] ?? "Other";

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

export const buildTripFilterMetadata = (trips: Trip[]): TripFilterMetadata => {
  const globalPriceBounds = getRangeBounds(
    trips.map((trip) => trip.price_num ?? 0),
    { min: 0, max: 0 },
  );

  return {
    globalPriceBounds,
    continents: sortUniqueStrings(
      trips.map((trip) => getContinent(trip.country ?? "")),
    ),
    countries: sortCountries([
      ...new Set(trips.map((trip) => trip.country ?? "")),
    ]),
    durations: [...new Set(trips.map((trip) => trip.duration_days ?? 0))].sort(
      (left, right) => left - right,
    ),
    cities: sortUniqueStrings(trips.map((trip) => trip.departure_city ?? "")),
    categories: sortUniqueStrings(trips.map((trip) => trip.category ?? "")),
    tripTypes: [...new Set(trips.map((trip) => trip.type ?? ""))],
    hasBonusTrips: trips.some((trip) => trip.is_bonus),
    hasGuaranteedTrips: trips.some((trip) => trip.guaranteed_departure),
    hasAvailableTrips: trips.some((trip) => trip.has_available_seats),
    hasFeaturedTrips: trips.some((trip) => trip.is_featured),
  };
};

export const createInitialTripFilterState = (
  trips: Trip[],
  metadata: TripFilterMetadata,
  activeFilter: string | null,
): TripFilterState => {
  const preset = activeFilter ? filterPresets[activeFilter] : undefined;
  const seedState: TripFilterState = {
    searchQuery: "",
    priceRange: [
      metadata.globalPriceBounds.min,
      metadata.globalPriceBounds.max,
    ],
    selectedContinents: [],
    selectedCountries: getPresetCountries(activeFilter, metadata.countries),
    selectedDurations: preset?.selectedDurations ?? [],
    selectedCities: [],
    selectedCategories: preset?.selectedCategories ?? [],
    showBonus: false,
    showGuaranteed: false,
    showAvailable: false,
    showFeatured: false,
    tripType: "all",
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
    case "setTripType":
      return { ...state, tripType: action.value };
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
    if (!labels.has(trip.departure_city)) {
      labels.set(trip.departure_city, trip.departure_city);
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
    (trip) => getContinent(trip.country ?? ""),
  );
  const countryCounts = buildFacetCounts(
    trips,
    state,
    lang,
    "country",
    (trip) => trip.country ?? "",
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
    (trip) => trip.departure_city ?? "",
  );
  const categoryCounts = buildFacetCounts(
    trips,
    state,
    lang,
    "category",
    (trip) => trip.category ?? "",
  );
  const tripTypeCounts = buildFacetCounts(
    trips,
    state,
    lang,
    "tripType",
    (trip) => trip.type ?? "",
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
    categoryCounts,
    tripTypeCounts,
    specialCounts,
  };
};

export const buildFilteredTrips = (
  trips: Trip[],
  state: TripFilterState,
  lang: TripLang,
) => trips.filter((trip) => matchesTripFilters(trip, state, lang));

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
        const leftScore =
          Number(Boolean(left.is_featured)) + Number(Boolean(left.is_bonus));
        const rightScore =
          Number(Boolean(right.is_featured)) + Number(Boolean(right.is_bonus));
        return rightScore - leftScore;
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
    selectedCategories: state.selectedCategories.filter((value) =>
      availableFacets.categoryCounts.has(value),
    ),
    showBonus:
      state.showBonus &&
      metadata.hasBonusTrips &&
      availableFacets.specialCounts.bonus > 0,
    showGuaranteed:
      state.showGuaranteed &&
      metadata.hasGuaranteedTrips &&
      availableFacets.specialCounts.guaranteed > 0,
    showAvailable:
      state.showAvailable &&
      metadata.hasAvailableTrips &&
      availableFacets.specialCounts.available > 0,
    showFeatured:
      state.showFeatured &&
      metadata.hasFeaturedTrips &&
      availableFacets.specialCounts.featured > 0,
    tripType:
      state.tripType === "all" ||
      availableFacets.tripTypeCounts.has(state.tripType)
        ? state.tripType
        : "all",
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
  arraysEqual(left.selectedCategories, right.selectedCategories) &&
  left.showBonus === right.showBonus &&
  left.showGuaranteed === right.showGuaranteed &&
  left.showAvailable === right.showAvailable &&
  left.showFeatured === right.showFeatured &&
  left.tripType === right.tripType &&
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
  let bonus = 0;
  let guaranteed = 0;
  let available = 0;
  let featured = 0;

  for (const trip of trips) {
    if (matchesTripFilters(trip, state, lang, "bonus") && trip.is_bonus)
      bonus += 1;
    if (
      matchesTripFilters(trip, state, lang, "guaranteed") &&
      trip.guaranteed_departure
    ) {
      guaranteed += 1;
    }
    if (
      matchesTripFilters(trip, state, lang, "available") &&
      trip.has_available_seats
    ) {
      available += 1;
    }
    if (matchesTripFilters(trip, state, lang, "featured") && trip.is_featured) {
      featured += 1;
    }
  }

  return { bonus, guaranteed, available, featured };
};

const matchesTripFilters = (
  trip: Trip,
  state: TripFilterState,
  lang: TripLang,
  excludedFacet?: FacetKey,
) => {
  if (state.searchQuery) {
    const searchable =
      `${trip.title ?? ""} ${trip.location ?? ""}`.toLowerCase();
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
    !state.selectedContinents.includes(getContinent(trip.country ?? ""))
  ) {
    return false;
  }

  if (
    excludedFacet !== "country" &&
    state.selectedCountries.length > 0 &&
    !state.selectedCountries.includes(trip.country ?? "")
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
    !state.selectedCities.includes(trip.departure_city ?? "")
  ) {
    return false;
  }

  if (
    excludedFacet !== "category" &&
    state.selectedCategories.length > 0 &&
    !state.selectedCategories.includes(trip.category ?? "")
  ) {
    return false;
  }

  if (excludedFacet !== "bonus" && state.showBonus && !trip.is_bonus)
    return false;
  if (
    excludedFacet !== "guaranteed" &&
    state.showGuaranteed &&
    !trip.guaranteed_departure
  ) {
    return false;
  }
  if (
    excludedFacet !== "available" &&
    state.showAvailable &&
    !trip.has_available_seats
  ) {
    return false;
  }
  if (excludedFacet !== "featured" && state.showFeatured && !trip.is_featured) {
    return false;
  }
  if (
    excludedFacet !== "tripType" &&
    state.tripType !== "all" &&
    trip.type !== state.tripType
  ) {
    return false;
  }

  return true;
};
