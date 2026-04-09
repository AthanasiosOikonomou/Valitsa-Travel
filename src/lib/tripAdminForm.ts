import type { DepartureMonthBlock, Trip } from "@/types/Trip";
import { normalizeDepartureBlocks } from "@/lib/departureWindows";
import { coerceProgramSteps, coerceStringList } from "@/lib/tripLocaleArrays";

export type ProgramFormStep = { days: string; title: string; description: string };

export function stripHtmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s|&nbsp;/gi, " ").trim();
}

function coerceDaysFromRaw(o: Record<string, unknown>, index: number): string {
  const fromDays = o.days;
  if (typeof fromDays === "string" && fromDays.trim()) return fromDays.trim();
  const dayRaw = o.day;
  if (typeof dayRaw === "number" && Number.isFinite(dayRaw)) return String(Math.trunc(dayRaw));
  const parsed = parseInt(String(dayRaw ?? index + 1), 10);
  return Number.isFinite(parsed) && parsed > 0 ? String(parsed) : String(index + 1);
}

/** Build editable program steps from DB jsonb / legacy string. */
export function programDbToFormSteps(value: unknown): ProgramFormStep[] {
  const steps = coerceProgramSteps(value);
  if (
    steps.length === 0 &&
    typeof value === "string" &&
    value.trim() &&
    !value.trim().startsWith("[")
  ) {
    const plain = stripHtmlToText(value) || value.trim();
    return [{ days: "1", title: "Legacy", description: plain }];
  }
  return steps.map((raw, i) => {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const o = raw as Record<string, unknown>;
      return {
        days: coerceDaysFromRaw(o, i),
        title: String(o.title ?? o.label ?? ""),
        description: String(
          o.description ?? o.body ?? o.text ?? o.content ?? o.detail ?? "",
        ),
      };
    }
    return { days: String(i + 1), title: String(raw ?? ""), description: "" };
  });
}

export function stringListDbToForm(value: unknown): string[] {
  return coerceStringList(value);
}

export function formStepsToDbPayload(
  steps: ProgramFormStep[],
): { days: string; title: string; description: string }[] {
  return steps.map((s) => ({
    days: s.days.trim(),
    title: s.title.trim(),
    description: s.description.trim(),
  }));
}

export type DepartureWindowFormRow = {
  month: number;
  days: number[];
  label_en: string;
  label_el: string;
};

/** Load departure rows: merged month blocks from DB (new + legacy ISO + legacy text fallback). */
export function departureWindowsDbToForm(row: Record<string, unknown>): DepartureWindowFormRow[] {
  const tripLike = {
    departure_windows: row.departure_windows,
    date_range: row.date_range,
    date_range_el: row.date_range_el,
  } as Trip;
  const blocks = normalizeDepartureBlocks(tripLike);
  if (blocks.length > 0) {
    return blocks.map((b) => ({
      month: b.month,
      days: [...b.days],
      label_en: b.label_en ?? "",
      label_el: b.label_el ?? "",
    }));
  }
  const fallbackEn = String(row.date_range ?? "").trim();
  const fallbackEl = String(row.date_range_el ?? "").trim();
  if (fallbackEn || fallbackEl) {
    return [{ month: 1, days: [], label_en: fallbackEn, label_el: fallbackEl }];
  }
  return [{ month: 1, days: [], label_en: "", label_el: "" }];
}

export function departureWindowsFormToPayload(
  rows: DepartureWindowFormRow[],
): DepartureMonthBlock[] {
  const tripLike = {
    departure_windows: rows.map((r) => ({
      month: r.month,
      days: r.days,
      label_en: r.label_en.trim() || null,
      label_el: r.label_el.trim() || null,
    })),
  } as Trip;
  return normalizeDepartureBlocks(tripLike);
}
