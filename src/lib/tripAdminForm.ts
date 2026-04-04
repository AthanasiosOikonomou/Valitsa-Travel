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
