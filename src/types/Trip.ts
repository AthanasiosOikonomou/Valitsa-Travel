// Strict TypeScript type for Trip based on the database schema
export type ProgramItem = {
  day: number;
  title: string;
  description: string;
  // Add more fields if the structure is known
};

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
  type: string | null;
  type_el?: string | null;
  image: string | null;
  category: string | null;
  category_el?: string | null;
  transport: string | null;
  transport_el?: string | null;
  is_featured: boolean | null;
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
  created_at: string | null;
  description: string | null;
  description_el?: string | null;
};
