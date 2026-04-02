import type { TripFormatLang } from "@/lib/tripDisplay";

/**
 * Normalizes Supabase jsonb / JSON text into an array of program steps.
 * Handles: null, arrays, JSON strings, and a single step stored as one object.
 */
export function coerceProgramSteps(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    try {
      const parsed: unknown = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
      if (parsed !== null && typeof parsed === "object") return [parsed];
    } catch {
      return [];
    }
    return [];
  }
  if (typeof value === "object") return [value];
  return [];
}

/**
 * Normalizes tags or included lines from jsonb, text[], or JSON strings.
 */
export function coerceStringList(value: unknown): string[] {
  const raw = coerceProgramSteps(value);
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) out.push(item);
  }
  return out;
}

export function pickLocalizedProgram(
  lang: TripFormatLang,
  programEl: unknown,
  program: unknown,
): unknown[] {
  const el = coerceProgramSteps(programEl);
  const en = coerceProgramSteps(program);
  if (lang === "gr" && el.length > 0) return el;
  return en;
}

export function pickLocalizedStringList(
  lang: TripFormatLang,
  elField: unknown,
  enField: unknown,
): string[] {
  const el = coerceStringList(elField);
  const en = coerceStringList(enField);
  if (lang === "gr" && el.length > 0) return el;
  return en;
}
