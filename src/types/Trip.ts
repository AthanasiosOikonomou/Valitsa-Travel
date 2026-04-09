// Strict TypeScript type for Trip based on the database schema
export type ProgramItem = {
  days: string;
  title: string;
  description: string;
};

export type TripStatus = "active" | "inactive";

/**
 * Stored in `trips.departure_windows` jsonb (current shape).
 * Year is not persisted; month + days only.
 */
export type DepartureMonthBlock = {
  month: number;
  days: number[];
  label_en?: string | null;
  label_el?: string | null;
};

/**
 * Legacy `departure_windows` rows: ISO date range (still read for migration).
 * @deprecated Prefer DepartureMonthBlock
 */
export type DepartureWindow = {
  start: string;
  end: string;
  label_en?: string | null;
  label_el?: string | null;
};

export type DepartureScheduleEntry = DepartureMonthBlock | DepartureWindow;

export type Trip = {
  id: string;
  title: string;
  title_el?: string | null;
  location: string | null;
  location_el?: string | null;
  country: string | null;
  country_el?: string | null;
  price_num: number | null;
  duration_days: number | null;
  image: string | null;
  /** PostgreSQL `text[]`; up to 4 extra photos after `image` (main). */
  gallery?: string[] | null;
  /** PostgreSQL `text[]`; legacy rows may still be a single string until migrated. */
  transport: string[] | string | null;
  transport_el?: string[] | string | null;
  is_featured: boolean | null;
  status?: TripStatus | string | null;
  /** @deprecated display fallback; prefer `departure_windows`. */
  date_range: string | null;
  /** @deprecated display fallback; prefer `departure_windows`. */
  date_range_el?: string | null;
  /** Month+days blocks and/or legacy ISO ranges; see `DepartureMonthBlock`. */
  departure_windows?: DepartureScheduleEntry[] | null;
  departure_city: string | null;
  departure_city_el?: string | null;
  tags: string[] | null;
  program: ProgramItem[] | unknown[] | null;
  included: string[] | null;
  tags_el?: string[] | null;
  program_el?: ProgramItem[] | unknown[] | null;
  included_el?: string[] | null;
  not_included: string[] | null;
  not_included_el?: string[] | null;
  created_at: string | null;
  description: string | null;
  description_el?: string | null;
  trip_notes?: string | null;
  trip_notes_el?: string | null;
  is_seasonal?: boolean | null;
  /** Slug matching `seasonal_configs.seasonal_key` when `is_seasonal` is true. */
  seasonal_name?: string | null;
};

/** Flat payload for admin PUT `/api/admin/trips/:id` (matches `adminTripPutSchema`). */
export type TripUpdate = Partial<{
  title: string | null;
  title_el: string | null;
  location: string | null;
  location_el: string | null;
  country: string | null;
  country_el: string | null;
  image: string | null;
  gallery: string[] | null;
  description: string | null;
  description_el: string | null;
  trip_notes: string | null;
  trip_notes_el: string | null;
  program: ProgramItem[] | null;
  program_el: ProgramItem[] | null;
  included: string[] | null;
  included_el: string[] | null;
  not_included: string[] | null;
  not_included_el: string[] | null;
  price_num: number | null;
  duration_days: number | null;
  transport: string[] | null;
  transport_el: string[] | null;
  date_range: string | null;
  date_range_el: string | null;
  departure_windows: DepartureMonthBlock[] | null;
  departure_city: string | null;
  departure_city_el: string | null;
  tags: string[] | null;
  tags_el: string[] | null;
  is_featured: boolean | null;
  status: TripStatus | null;
  is_seasonal: boolean | null;
  seasonal_name: string | null;
}>;
