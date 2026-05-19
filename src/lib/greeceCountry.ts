import type { Trip } from "@/types/Trip";

const GREECE_KEYS = new Set(["greece", "ελλαδα"]);

/** Normalize country strings for comparison (case- and accent-insensitive). */
export function normalizeCountryKey(value: string | null | undefined): string {
  if (value == null) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function isGreeceCountry(value: string | null | undefined): boolean {
  const key = normalizeCountryKey(value);
  return key !== "" && GREECE_KEYS.has(key);
}

export function isGreeceTrip(trip: Pick<Trip, "country" | "country_el">): boolean {
  return isGreeceCountry(trip.country) || isGreeceCountry(trip.country_el);
}
