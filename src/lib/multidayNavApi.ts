import { supabase } from "@/lib/supabaseClient";

/**
 * Distinct trip lengths (days) greater than 2 for active trips, sorted ascending.
 * Used by the navbar multiday dropdown.
 */
export async function fetchMultidayDurationDays(): Promise<number[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("duration_days")
    .or("status.eq.active,status.is.null");

  if (error || !Array.isArray(data)) {
    return [];
  }

  const set = new Set<number>();
  for (const row of data) {
    const d = row?.duration_days;
    if (typeof d === "number" && d > 2) {
      set.add(d);
    }
  }

  return [...set].sort((a, b) => a - b);
}
