import type { Trip, TripPricingSegment } from "@/types/Trip";
import { isValidDayForMonth, tripDepartureMonths } from "@/lib/departureWindows";

/** Trip filter UI language (matches `TripLang` in tripFilters). */
export type TripFilterLang = "en" | "gr";

function dedupeSortDays(days: number[]): number[] {
  return [...new Set(days.filter((d) => Number.isInteger(d)))].sort((a, b) => a - b);
}

/** Coerce unknown JSON into normalized segments (dedupe/sort days per row; drop invalid rows). */
export function normalizePricingSegments(raw: unknown): TripPricingSegment[] {
  if (!Array.isArray(raw)) return [];
  const out: TripPricingSegment[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const month = Math.trunc(Number(o.month));
    if (!Number.isFinite(month) || month < 1 || month > 12) continue;
    const rawDays = Array.isArray(o.days) ? o.days : [];
    const days = dedupeSortDays(
      rawDays
        .map((x) => (typeof x === "number" ? Math.trunc(x) : parseInt(String(x), 10)))
        .filter((n) => Number.isFinite(n) && isValidDayForMonth(month, n)),
    );
    if (days.length === 0) continue;

    const strOrNull = (v: unknown) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s || null;
    };
    const numOrNull = (v: unknown): number | null => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const intOrNull = (v: unknown): number | null => {
      if (v === undefined || v === null || v === "") return null;
      const n = Math.trunc(Number(v));
      return Number.isFinite(n) ? n : null;
    };

    out.push({
      month,
      days,
      departure_city: strOrNull(o.departure_city),
      departure_city_el: strOrNull(o.departure_city_el),
      hotel_en: strOrNull(o.hotel_en),
      hotel_el: strOrNull(o.hotel_el),
      duration_days: intOrNull(o.duration_days),
      price_double: numOrNull(o.price_double),
      price_single: numOrNull(o.price_single),
      price_triple: numOrNull(o.price_triple),
      price_child: numOrNull(o.price_child),
    });
  }
  return out;
}

/** Minimum list price: min of segment `price_double`, else trip.price_num. */
export function effectiveTripListPrice(trip: Pick<Trip, "price_num" | "pricing_segments">): number | null {
  const segs = normalizePricingSegments(trip.pricing_segments);
  const doubles = segs
    .map((s) => s.price_double)
    .filter((n): n is number => n != null && Number.isFinite(n));
  if (doubles.length > 0) return Math.min(...doubles);
  return trip.price_num ?? null;
}

/** Minimum duration from segments when present, else `duration_days`. */
export function effectiveTripListDuration(
  trip: Pick<Trip, "duration_days" | "pricing_segments">,
): number | null {
  const segs = normalizePricingSegments(trip.pricing_segments);
  const durs = segs
    .map((s) => s.duration_days)
    .filter((n): n is number => n != null && Number.isFinite(n));
  if (durs.length > 0) return Math.min(...durs);
  return trip.duration_days ?? null;
}

/** Months from structured departures plus pricing segments (for archive month filter). */
export function tripDepartureMonthsAugmented(trip: Trip): Set<number> {
  const out = new Set(tripDepartureMonths(trip));
  for (const s of normalizePricingSegments(trip.pricing_segments)) {
    out.add(s.month);
  }
  return out;
}

export function tripHasPricingSegments(trip: Pick<Trip, "pricing_segments">): boolean {
  return normalizePricingSegments(trip.pricing_segments).length > 0;
}

/**
 * Distinct departure city labels for filters: one entry per pricing row (per language),
 * plus legacy trip-level `departure_city` when segments have no cities.
 */
export function tripDepartureCityLabelsForFilter(trip: Trip, lang: TripFilterLang): string[] {
  const segs = normalizePricingSegments(trip.pricing_segments);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of segs) {
    const label =
      lang === "gr"
        ? (s.departure_city_el?.trim() || s.departure_city?.trim() || "")
        : (s.departure_city?.trim() || s.departure_city_el?.trim() || "");
    if (label && !seen.has(label)) {
      seen.add(label);
      out.push(label);
    }
  }
  if (out.length === 0) {
    const legacy =
      lang === "gr"
        ? (trip.departure_city_el?.trim() || trip.departure_city?.trim() || "")
        : (trip.departure_city?.trim() || trip.departure_city_el?.trim() || "");
    if (legacy) out.push(legacy);
  }
  return out;
}

export type PricingSegmentFormRow = {
  month: number;
  days: number[];
  departure_city: string;
  departure_city_el: string;
  hotel_en: string;
  hotel_el: string;
  duration_days?: number | null;
  price_double?: number | null;
  price_single?: number | null;
  price_triple?: number | null;
  price_child?: number | null;
};

export function pricingSegmentsDbToForm(row: Record<string, unknown>): PricingSegmentFormRow[] {
  const segs = normalizePricingSegments(row.pricing_segments);
  return segs.map((s) => ({
    month: s.month,
    days: [...s.days],
    departure_city: s.departure_city ?? "",
    departure_city_el: s.departure_city_el ?? "",
    hotel_en: s.hotel_en ?? "",
    hotel_el: s.hotel_el ?? "",
    duration_days: s.duration_days ?? null,
    price_double: s.price_double ?? null,
    price_single: s.price_single ?? null,
    price_triple: s.price_triple ?? null,
    price_child: s.price_child ?? null,
  }));
}

/** Accepts admin form rows (Zod-inferred) and normalizes for API. */
export function pricingSegmentsFormToPayload(
  rows: Array<{
    month: number;
    days: number[];
    departure_city: string;
    departure_city_el: string;
    hotel_en: string;
    hotel_el: string;
    duration_days?: number | null;
    price_double?: number | null;
    price_single?: number | null;
    price_triple?: number | null;
    price_child?: number | null;
  }>,
): TripPricingSegment[] {
  return normalizePricingSegments(
    rows.map((r) => ({
      month: r.month,
      days: r.days,
      departure_city: r.departure_city.trim() || null,
      departure_city_el: r.departure_city_el.trim() || null,
      hotel_en: r.hotel_en.trim() || null,
      hotel_el: r.hotel_el.trim() || null,
      duration_days: r.duration_days ?? null,
      price_double: r.price_double ?? null,
      price_single: r.price_single ?? null,
      price_triple: r.price_triple ?? null,
      price_child: r.price_child ?? null,
    })),
  );
}
