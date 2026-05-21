import type { Trip } from "@/types/Trip";
import {
  countTripDepartureDates,
  tripHasSingleListPrice,
  tripListDurationRange,
  tripListPriceRange,
} from "@/lib/tripPricing";

export type TripFormatLang = "en" | "gr";

const PRICE_PLACEHOLDER = "—";

export function formatTripPrice(
  priceNum: number | null | undefined,
  lang: TripFormatLang,
): string {
  if (priceNum == null || Number.isNaN(priceNum)) {
    return PRICE_PLACEHOLDER;
  }
  const locale = lang === "gr" ? "el-GR" : "en-GB";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(priceNum);
}

export function formatTripDuration(
  days: number | null | undefined,
  lang: TripFormatLang,
): string {
  if (days == null || Number.isNaN(days)) {
    return PRICE_PLACEHOLDER;
  }
  const n = Math.round(days);
  if (lang === "gr") {
    return n === 1 ? "1 Ημέρα" : `${n} Ημέρες`;
  }
  return n === 1 ? "1 Day" : `${n} Days`;
}

/** List/card line: min–max from pricing segments (or legacy trip fields). */
export function formatTripListPriceLabel(
  trip: Pick<Trip, "price_num" | "pricing_segments">,
  lang: TripFormatLang,
): string {
  const r = tripListPriceRange(trip);
  if (!r) return PRICE_PLACEHOLDER;
  if (r.min === r.max) return formatTripPrice(r.min, lang);
  return `${formatTripPrice(r.min, lang)} – ${formatTripPrice(r.max, lang)}`;
}

export function formatTripListDurationLabel(
  trip: Pick<Trip, "duration_days" | "pricing_segments">,
  lang: TripFormatLang,
): string {
  const r = tripListDurationRange(trip);
  if (!r) return PRICE_PLACEHOLDER;
  if (r.min === r.max) return formatTripDuration(r.min, lang);
  if (lang === "gr") return `${r.min}–${r.max} Ημέρες`;
  return `${r.min}–${r.max} Days`;
}

/** Hide duration chip/span when it would show "—" or redundant for single-price single-date trips. */
export function shouldShowTripListDuration(
  trip: Pick<Trip, "duration_days" | "pricing_segments" | "departure_windows">,
): boolean {
  const durationRange = tripListDurationRange(trip);
  if (!durationRange) return false;
  if (tripHasSingleListPrice(trip) && countTripDepartureDates(trip) === 1) {
    return false;
  }
  return true;
}
