import type { DepartureMonthBlock, DepartureWindow, Trip } from "@/types/Trip";

export type TripLang = "en" | "gr";

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Leap year for validating day-in-month only (not stored). */
const REF_YEAR = 2000;

export function parseISODateLocal(s: string): Date | null {
  const m = ISO_RE.exec(String(s).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) {
    return null;
  }
  return dt;
}

function isLegacyWindowRow(o: Record<string, unknown>): o is Record<string, unknown> & {
  start: string;
  end: string;
} {
  return (
    typeof o.start === "string" &&
    String(o.start).trim() !== "" &&
    typeof o.end === "string" &&
    String(o.end).trim() !== "" &&
    coerceMonth(o) == null
  );
}

function coerceMonth(o: Record<string, unknown>): number | null {
  const raw = o.month;
  const m =
    typeof raw === "number" && Number.isFinite(raw)
      ? Math.trunc(raw)
      : parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(m) || m < 1 || m > 12) return null;
  return m;
}

function isMonthBlockRow(o: Record<string, unknown>): boolean {
  return coerceMonth(o) != null && Array.isArray(o.days);
}

/** Days in calendar month 1–12 (reference leap year). */
export function daysInCalendarMonth(month: number): number {
  if (month < 1 || month > 12) return 0;
  return new Date(REF_YEAR, month, 0).getDate();
}

export function isValidDayForMonth(month: number, day: number): boolean {
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;
  return day <= daysInCalendarMonth(month);
}

function dedupeSortDays(days: number[]): number[] {
  return [...new Set(days.filter((d) => Number.isInteger(d)))].sort((a, b) => a - b);
}

/** Collapse consecutive day numbers into ranges; separate groups with comma + space. */
export function formatDaysForMonth(days: number[], _lang: TripLang): string {
  const sorted = dedupeSortDays(days);
  if (sorted.length === 0) return "";
  const dash = "–";
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) {
      j += 1;
    }
    const a = sorted[i];
    const b = sorted[j];
    if (a === b) {
      parts.push(String(a));
    } else {
      parts.push(`${a}${dash}${b}`);
    }
    i = j + 1;
  }
  return parts.join(", ");
}

/** Standalone month name for tables (sentence case; not uppercase). */
export function formatMonthNameLong(month: number, lang: TripLang): string {
  const loc = lang === "gr" ? "el-GR" : "en-GB";
  const d = new Date(REF_YEAR, month - 1, 1);
  return new Intl.DateTimeFormat(loc, { month: "long" }).format(d);
}

/** One segment for card/list summary: "April 9–10" / Greek uppercase month optional. */
export function formatMonthSummarySegment(block: DepartureMonthBlock, lang: TripLang): string {
  const monthName = formatMonthNameLong(block.month, lang);
  const displayMonth = lang === "gr" ? monthName.toLocaleUpperCase("el-GR") : monthName;
  const daysPart = formatDaysForMonth(block.days, lang);
  return daysPart ? `${displayMonth} ${daysPart}` : displayMonth;
}

function mergeMonthBlocks(blocks: DepartureMonthBlock[]): DepartureMonthBlock[] {
  const map = new Map<
    number,
    { days: Set<number>; label_en: string | null; label_el: string | null }
  >();

  for (const b of blocks) {
    const m = b.month;
    if (m < 1 || m > 12) continue;
    const validDays = dedupeSortDays(b.days.filter((d) => isValidDayForMonth(m, d)));
    if (validDays.length === 0) continue;

    const cur =
      map.get(m) ?? { days: new Set<number>(), label_en: null, label_el: null };
    for (const d of validDays) {
      cur.days.add(d);
    }
    const le = b.label_en != null ? String(b.label_en).trim() : "";
    const ll = b.label_el != null ? String(b.label_el).trim() : "";
    if (le && !cur.label_en) cur.label_en = le;
    if (ll && !cur.label_el) cur.label_el = ll;
    map.set(m, cur);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([month, { days, label_en, label_el }]) => ({
      month,
      days: [...days].sort((x, y) => x - y),
      label_en: label_en || null,
      label_el: label_el || null,
    }));
}

function parseNewMonthRow(o: Record<string, unknown>): DepartureMonthBlock | null {
  if (!isMonthBlockRow(o)) return null;
  const month = coerceMonth(o)!;
  const rawDays = o.days as unknown[];
  const days = rawDays
    .map((x) => (typeof x === "number" ? Math.trunc(x) : parseInt(String(x), 10)))
    .filter((n) => Number.isFinite(n) && isValidDayForMonth(month, n));
  const unique = dedupeSortDays(days);
  if (unique.length === 0) return null;
  return {
    month,
    days: unique,
    label_en: o.label_en != null ? String(o.label_en) : null,
    label_el: o.label_el != null ? String(o.label_el) : null,
  };
}

function expandLegacyWindow(w: DepartureWindow): DepartureMonthBlock[] {
  const a = parseISODateLocal(w.start);
  const b = parseISODateLocal(w.end);
  if (!a || !b || a > b) return [];
  const le = w.label_en != null ? String(w.label_en).trim() || null : null;
  const ll = w.label_el != null ? String(w.label_el).trim() || null : null;

  const byMonth = new Map<number, Set<number>>();
  const cur = new Date(a.getTime());
  const endT = b.getTime();
  while (cur.getTime() <= endT) {
    const mo = cur.getMonth() + 1;
    const day = cur.getDate();
    if (!byMonth.has(mo)) byMonth.set(mo, new Set());
    byMonth.get(mo)!.add(day);
    cur.setDate(cur.getDate() + 1);
  }

  return [...byMonth.entries()].map(([month, set]) => ({
    month,
    days: [...set].sort((x, y) => x - y),
    label_en: le,
    label_el: ll,
  }));
}

/**
 * Raw DB rows → merged month blocks (new shape + legacy ISO ranges).
 */
export function normalizeDepartureBlocks(trip: Trip): DepartureMonthBlock[] {
  const raw = trip.departure_windows;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const pieces: DepartureMonthBlock[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const o = row as Record<string, unknown>;
    const parsed = parseNewMonthRow(o);
    if (parsed) {
      pieces.push(parsed);
      continue;
    }
    if (isLegacyWindowRow(o)) {
      pieces.push(...expandLegacyWindow(o as DepartureWindow));
    }
  }

  return mergeMonthBlocks(pieces);
}

function legacyDepartureLine(trip: Trip, lang: TripLang): string | null {
  const en = String(trip.date_range ?? "").trim();
  const el = String(trip.date_range_el ?? "").trim();
  if (lang === "gr" && el) return el;
  if (lang === "gr" && en) return en;
  if (en) return en;
  if (el) return el;
  return null;
}

const SUMMARY_MAX_MONTHS = 4;

export function formatTripDepartureSummary(trip: Trip, lang: TripLang): string {
  const merged = normalizeDepartureBlocks(trip);
  if (merged.length === 0) {
    return legacyDepartureLine(trip, lang) ?? "";
  }
  const parts = merged
    .slice(0, SUMMARY_MAX_MONTHS)
    .map((b) => formatMonthSummarySegment(b, lang))
    .filter(Boolean);
  const extra = merged.length - SUMMARY_MAX_MONTHS;
  const joined = parts.join(lang === "gr" ? " · " : " · ");
  if (extra > 0) {
    return `${joined} (+${extra})`;
  }
  return joined;
}

/** Months 1–12 present in structured data (legacy free-text excluded). */
export function tripDepartureMonths(trip: Trip): Set<number> {
  const out = new Set<number>();
  for (const b of normalizeDepartureBlocks(trip)) {
    out.add(b.month);
  }
  return out;
}
