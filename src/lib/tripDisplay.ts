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
