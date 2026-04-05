// Strict TypeScript type for Trip based on the database schema
export type ProgramItem = {
  days: string;
  title: string;
  description: string;
};

export type TripStatus = "active" | "inactive";

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
  /** PostgreSQL `text[]`; legacy rows may still be a single string until migrated. */
  transport: string[] | string | null;
  transport_el?: string[] | string | null;
  is_featured: boolean | null;
  status?: TripStatus | string | null;
  date_range: string | null;
  date_range_el?: string | null;
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
  departure_city: string | null;
  departure_city_el: string | null;
  tags: string[] | null;
  tags_el: string[] | null;
  is_featured: boolean | null;
  status: TripStatus | null;
}>;
