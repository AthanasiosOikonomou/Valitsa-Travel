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
  location: string | null;
  country: string | null;
  price_text: string | null;
  price_num: number | null;
  duration_text: string | null;
  duration_days: number | null;
  type: string | null;
  image: string | null;
  category: string | null;
  transport: string | null;
  is_featured: boolean | null;
  is_bonus: boolean | null;
  has_available_seats: boolean | null;
  guaranteed_departure: boolean | null;
  date_range: string | null;
  departure_city: string | null;
  tags: string[];
  program: ProgramItem[];
  included: string[];
  created_at: string | null;
  description: string | null;
};
