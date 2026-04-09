import type { Trip, TripFlightLeg } from "@/types/Trip";

function trimStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

/** Coerce DB/json into normalized flight legs (trimmed strings; preserves empty rows). */
export function normalizeFlightDetails(raw: unknown): TripFlightLeg[] {
  if (!Array.isArray(raw)) return [];
  const out: TripFlightLeg[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    out.push({
      departure_el: trimStr(o.departure_el),
      departure_en: trimStr(o.departure_en),
      return_el: trimStr(o.return_el),
      return_en: trimStr(o.return_en),
    });
  }
  return out;
}

export function flightLegHasContent(leg: TripFlightLeg): boolean {
  return (
    leg.departure_el.length > 0 ||
    leg.departure_en.length > 0 ||
    leg.return_el.length > 0 ||
    leg.return_en.length > 0
  );
}

/** True when the trip should show the flight section publicly. */
export function shouldShowFlightDetails(trip: Pick<Trip, "flight_details_enabled" | "flight_details">): boolean {
  if (!trip.flight_details_enabled) return false;
  return normalizeFlightDetails(trip.flight_details).some(flightLegHasContent);
}
