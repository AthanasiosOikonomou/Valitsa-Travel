import { supabase } from "@/lib/supabaseClient";
import type { Trip } from "@/types/Trip";
import { tripDistinctDurations } from "@/lib/tripPricing";

/**
 * Distinct trip lengths (days) greater than 2 for active trips, sorted ascending.
 * Derived from per-departure pricing segments (and legacy trip duration when needed).
 * Used by the navbar multiday dropdown.
 */
export async function fetchMultidayDurationDays(): Promise<number[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("duration_days, pricing_segments")
    .or("status.eq.active,status.is.null");

  if (error || !Array.isArray(data)) {
    return [];
  }

  const set = new Set<number>();
  for (const row of data) {
    const trip = row as Pick<Trip, "duration_days" | "pricing_segments">;
    for (const d of tripDistinctDurations(trip)) {
      if (d > 2) set.add(d);
    }
  }

  return [...set].sort((a, b) => a - b);
}
