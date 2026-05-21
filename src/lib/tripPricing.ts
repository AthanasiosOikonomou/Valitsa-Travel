import type { Trip, TripPricingSegment } from "@/types/Trip";
import {
  isValidDayForMonth,
  normalizeDepartureBlocks,
  tripDepartureMonths,
} from "@/lib/departureWindows";

/** Trip filter UI language (matches `TripLang` in tripFilters). */
export type TripFilterLang = "en" | "gr";

function dedupeSortDays(days: number[]): number[] {
  return [...new Set(days.filter((d) => Number.isInteger(d)))].sort((a, b) => a - b);
}

/** Day-trip pricing row: duration of 1 day (not inferred from a single departure date). */
export function isDayTripPricingSegment(
  s: Pick<TripPricingSegment, "duration_days">,
): boolean {
  return s.duration_days === 1;
}

/** Total departure day slots across pricing segments, else departure windows. */
export function countTripDepartureDates(
  trip: Pick<Trip, "pricing_segments" | "departure_windows">,
): number {
  const segs = normalizePricingSegments(trip.pricing_segments);
  if (segs.length > 0) {
    return segs.reduce((sum, s) => sum + s.days.length, 0);
  }
  let n = 0;
  for (const b of normalizeDepartureBlocks(trip as Trip)) {
    n += b.days.length;
  }
  return n;
}

export function tripHasDayTripSegment(
  trip: Pick<Trip, "pricing_segments">,
): boolean {
  return normalizePricingSegments(trip.pricing_segments).some(isDayTripPricingSegment);
}

/** True when the trip offers a 1-day product (duration or mono-day price). */
export function tripHasDurationOne(
  trip: Pick<Trip, "duration_days" | "pricing_segments">,
): boolean {
  if (tripDistinctDurations(trip).includes(1)) return true;
  return normalizePricingSegments(trip.pricing_segments).some(
    (s) =>
      s.duration_days === 1 ||
      (s.price_day_trip != null && Number.isFinite(s.price_day_trip)),
  );
}

/** Matches Ημερήσιες Εκδρομές / `?filter=daily`. */
export function tripQualifiesForDailyFilter(
  trip: Pick<Trip, "duration_days" | "pricing_segments">,
): boolean {
  return tripHasDurationOne(trip);
}

export function tripHasSingleListPrice(
  trip: Pick<Trip, "price_num" | "pricing_segments">,
): boolean {
  const r = tripListPriceRange(trip);
  return r != null && r.min === r.max;
}

function sanitizeSegmentPrices(raw: TripPricingSegment): TripPricingSegment {
  const dayTrip = isDayTripPricingSegment(raw);
  if (dayTrip) {
    return {
      ...raw,
      price_double: null,
      price_single: null,
      price_triple: null,
      price_child: null,
    };
  }
  return {
    ...raw,
    price_day_trip: null,
  };
}

/** Room prices only (multi-day segments). */
function segmentRoomPrices(s: TripPricingSegment): number[] {
  return [s.price_double, s.price_single, s.price_triple].filter(
    (n): n is number => n != null && Number.isFinite(n),
  );
}

/** Prices used for list cards, filters, and sort (child excluded). */
export function segmentListPrices(s: TripPricingSegment): number[] {
  if (isDayTripPricingSegment(s)) {
    const p = s.price_day_trip;
    if (p != null && Number.isFinite(p)) return [p];
    return segmentRoomPrices(s);
  }
  return segmentRoomPrices(s);
}

/** Hero / primary price on a segment card. */
export function segmentDisplayPrice(s: TripPricingSegment): number | null {
  const prices = segmentListPrices(s);
  if (prices.length === 0) return null;
  return Math.min(...prices);
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
      price_day_trip: numOrNull(o.price_day_trip),
    });
  }
  return out;
}

/**
 * Min/max adult price across all pricing rows (room or day-trip; child fares excluded).
 * Falls back to legacy `price_num` when segments have no numeric adult prices.
 */
export function tripListPriceRange(
  trip: Pick<Trip, "price_num" | "pricing_segments">,
): { min: number; max: number } | null {
  const segs = normalizePricingSegments(trip.pricing_segments);
  const all: number[] = [];
  for (const s of segs) {
    all.push(...segmentListPrices(s));
  }
  if (all.length > 0) {
    return { min: Math.min(...all), max: Math.max(...all) };
  }
  const p = trip.price_num;
  if (p != null && Number.isFinite(p)) {
    return { min: p, max: p };
  }
  return null;
}

/** Minimum “from” price for sorting and badges (lowest offer across segments). */
export function effectiveTripListPrice(trip: Pick<Trip, "price_num" | "pricing_segments">): number | null {
  return tripListPriceRange(trip)?.min ?? null;
}

/** Distinct trip lengths (days) from pricing segments, else legacy `duration_days`. */
export function tripDistinctDurations(
  trip: Pick<Trip, "duration_days" | "pricing_segments">,
): number[] {
  const segs = normalizePricingSegments(trip.pricing_segments);
  const durs = segs
    .map((s) => s.duration_days)
    .filter((n): n is number => n != null && Number.isFinite(n) && n > 0);
  if (durs.length > 0) {
    return [...new Set(durs.map((n) => Math.round(n)))].sort((a, b) => a - b);
  }
  const d = trip.duration_days;
  if (d != null && Number.isFinite(d) && d > 0) {
    return [Math.round(d)];
  }
  return [];
}

/** Min/max duration in days for list/detail display. */
export function tripListDurationRange(
  trip: Pick<Trip, "duration_days" | "pricing_segments">,
): { min: number; max: number } | null {
  const ds = tripDistinctDurations(trip);
  if (ds.length === 0) return null;
  return { min: Math.min(...ds), max: Math.max(...ds) };
}

/** Shortest duration (legacy helper; prefer `tripListDurationRange` for UI). */
export function effectiveTripListDuration(
  trip: Pick<Trip, "duration_days" | "pricing_segments">,
): number | null {
  const r = tripListDurationRange(trip);
  return r?.min ?? null;
}

/** Whether [filterLo, filterHi] overlaps the trip’s price span (segment-based). */
export function tripPriceRangeOverlapsFilter(
  trip: Pick<Trip, "price_num" | "pricing_segments">,
  filterRange: [number, number],
): boolean {
  const span = tripListPriceRange(trip);
  if (!span) return true;
  const [f0, f1] = filterRange;
  return span.min <= f1 && span.max >= f0;
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
  price_day_trip?: number | null;
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
    price_day_trip: s.price_day_trip ?? null,
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
    price_day_trip?: number | null;
  }>,
): TripPricingSegment[] {
  return normalizePricingSegments(
    rows.map((r) => {
      const base: TripPricingSegment = {
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
        price_day_trip: r.price_day_trip ?? null,
      };
      return sanitizeSegmentPrices(base);
    }),
  );
}

/** Clear prices that do not apply after toggling day-trip vs multi-day in admin draft. */
export function clearPricingSegmentPricesForMode(
  row: PricingSegmentFormRow,
): PricingSegmentFormRow {
  if (isDayTripPricingSegment(row)) {
    return {
      ...row,
      price_double: null,
      price_single: null,
      price_triple: null,
      price_child: null,
      hotel_en: "",
      hotel_el: "",
    };
  }
  return { ...row, price_day_trip: null };
}
