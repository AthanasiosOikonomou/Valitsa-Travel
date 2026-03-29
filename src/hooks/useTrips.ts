import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Trip } from "../types/Trip";

// Only fetch lightweight fields for trip list
const TRIP_LIST_FIELDS = [
  "id",
  "title",
  "location",
  "country",
  "price_text",
  "price_num",
  "duration_text",
  "duration_days",
  "type",
  "image",
  "category",
  "transport",
  "is_featured",
  "is_bonus",
  "has_available_seats",
  "guaranteed_departure",
  "date_range",
  "departure_city",
  "tags",
  "description",
  "program",
  "included",
];

export interface TripFilters {
  page?: number;
  pageSize?: number;
  featured?: boolean;
  country?: string;
  category?: string;
  type?: string;
}

export function useTrips({
  page = 1,
  pageSize = 12,
  featured,
  country,
  category,
  type,
}: TripFilters = {}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTrips = useCallback(() => {
    let ignore = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      let query = supabase
        .from("trips")
        .select(TRIP_LIST_FIELDS.join(","), { count: "exact" })
        .order("created_at", { ascending: false });
      if (featured !== undefined) {
        query = query.eq("is_featured", featured);
      }
      if (country) {
        query = query.eq("country", country);
      }
      if (category) {
        query = query.eq("category", category);
      }
      if (type) {
        query = query.eq("type", type);
      }
      const { data, error, count } = await query.range(from, to);
      if (ignore) return;
      if (error) {
        setError(error.message);
        setTrips([]);
        setHasMore(false);
      } else if (Array.isArray(data)) {
        // Type guard: check if first item has Trip properties
        if (
          data.length === 0 ||
          (typeof data[0] === "object" &&
            data[0] !== undefined &&
            data[0] !== null &&
            "id" in (data[0] ?? {}) &&
            "title" in (data[0] ?? {}))
        ) {
          setTrips(data as unknown as Trip[]);
          setHasMore(count ? to + 1 < count : false);
        } else {
          setError("Supabase returned unexpected array structure");
          setTrips([]);
          setHasMore(false);
        }
      } else {
        setError("Unexpected response from Supabase");
        setTrips([]);
        setHasMore(false);
      }
      setLoading(false);
    };
    fetch();
    return () => {
      ignore = true;
    };
  }, [page, pageSize, featured, country, category, type]);

  useEffect(() => {
    const cleanup = fetchTrips();
    return cleanup;
  }, [fetchTrips, featured, country, category, type]);

  return { trips, loading, error, hasMore };
}

// Fetch all fields for a single trip (details page)
export function useTrip(id: string) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    supabase
      .from("trips")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setTrip(null);
        } else {
          setTrip(data as Trip);
        }
        setLoading(false);
      });
  }, [id]);

  return { trip, loading, error };
}
