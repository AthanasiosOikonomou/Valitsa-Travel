import { Calendar, MapPin } from "lucide-react";

const strField = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Day / day-range prefix and title, before `||` or comma splitting.
 * Supports: "Day 1", "Days 2-4", "Day -2", optional Greek prefixes, ":" or em dash before title.
 */
const ITINERARY_HEAD_RE =
  /^(?:(?:Day|Days|Ημέρα|Ημέρες)\s+)?(-?\d+)(?:\s*[–-]\s*(\d+))?\s*[:\u2014]\s*(.+)$/i;

export interface ItineraryItem {
  dayLabel: string;
  title: string;
  description: string;
  isRange: boolean;
}

function parseItineraryHead(head: string): {
  dayLabel: string;
  title: string;
  isRange: boolean;
} {
  const trimmed = head.trim();
  const m = trimmed.match(ITINERARY_HEAD_RE);
  if (!m) {
    return { dayLabel: "", title: trimmed, isRange: false };
  }
  const first = m[1];
  const rangeEnd = m[2];
  const title = m[3].trim();
  if (rangeEnd != null && rangeEnd !== "") {
    return { dayLabel: `${first}-${rangeEnd}`, title, isRange: true };
  }
  return { dayLabel: first, title, isRange: false };
}

function splitTitleDetail(titlePart: string): { title: string; detail: string } {
  const parts = titlePart.split(/,\s+|·\s+|•\s+/);
  if (parts.length <= 1) {
    return { title: titlePart.trim(), detail: "" };
  }
  return {
    title: parts[0].trim(),
    detail: parts.slice(1).join(", ").trim(),
  };
}

function fromProgramString(raw: string): ItineraryItem {
  const richParts = raw.split(/\s*\|\|\s*/);
  const head = richParts[0].trim();
  const tailFromPipe = richParts.slice(1).join(" ").trim();

  const parsed = parseItineraryHead(head);
  const { title, detail: detailFromComma } = splitTitleDetail(parsed.title);
  const description = [tailFromPipe, detailFromComma].filter(Boolean).join(" ").trim();

  return {
    dayLabel: parsed.dayLabel,
    title,
    description,
    isRange: parsed.isRange,
  };
}

/** Maps arbitrary program rows (strings or loose objects) into itinerary rows. */
export function toItineraryItem(raw: unknown): ItineraryItem {
  if (raw == null) {
    return { dayLabel: "", title: "", description: "", isRange: false };
  }

  if (typeof raw === "string") {
    return fromProgramString(raw);
  }

  if (typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const titleField =
      strField(o.title) || strField(o.label) || strField(o.heading);
    const description =
      strField(o.description) ||
      strField(o.body) ||
      strField(o.text) ||
      strField(o.content) ||
      strField(o.detail);
    const step = strField(o.step);
    const dayNum = typeof o.day === "number" ? String(o.day) : "";

    if (titleField || description) {
      if (titleField) {
        const parsed = parseItineraryHead(titleField);
        const split = splitTitleDetail(parsed.title);
        const dayLabel = parsed.dayLabel || dayNum;
        const isRange =
          parsed.isRange ||
          (dayLabel.length > 0 && /^-?\d+-\d+$/.test(dayLabel));
        return {
          dayLabel,
          title: split.title,
          description: [description, split.detail].filter(Boolean).join(" ").trim(),
          isRange,
        };
      }
      if (description) {
        const fromDesc = fromProgramString(description);
        return {
          dayLabel: dayNum || fromDesc.dayLabel,
          title: fromDesc.title,
          description: fromDesc.description,
          isRange:
            fromDesc.isRange ||
            (Boolean(dayNum) && /^-?\d+-\d+$/.test(dayNum)),
        };
      }
    }

    if (step) {
      const fromStep = fromProgramString(step);
      if (dayNum && !fromStep.dayLabel) {
        return { ...fromStep, dayLabel: dayNum, isRange: fromStep.isRange };
      }
      return fromStep;
    }

    return fromProgramString(String(raw));
  }

  return fromProgramString(String(raw));
}

interface ItineraryTimelineProps {
  items: ItineraryItem[];
}

const badgeBase =
  "shrink-0 border border-[#a855f7]/30 bg-slate-100 transition-colors dark:bg-white/5 dark:border-[#a855f7]/35 group-hover:border-[#a855f7]/50";
const accentIcon = "text-[#a855f7]";

export function ItineraryTimeline({ items }: ItineraryTimelineProps) {
  const last = items.length - 1;

  return (
    <ul className="space-y-0 pt-2">
      {items.map((item, i) => {
        const connectorTall = item.isRange;
        const showConnector = i < last;

        return (
          <li
            key={i}
            className="group flex items-stretch gap-5 pb-10 last:pb-0 sm:gap-6"
          >
            {/* Fixed-width timeline column */}
            <div className="flex w-14 shrink-0 flex-col items-center sm:w-16">
              <div className="relative z-10 flex shrink-0 justify-center">
                {item.isRange ? (
                  <div
                    className={`flex max-w-full flex-row flex-nowrap items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 ${badgeBase}`}
                  >
                    <Calendar
                      className={`h-3.5 w-3.5 shrink-0 ${accentIcon}`}
                      aria-hidden
                    />
                    {item.dayLabel ? (
                      <span className="text-[11px] font-semibold leading-none tracking-tight text-slate-800 dark:text-zinc-200">
                        {item.dayLabel}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div
                    className={`flex h-9 w-9 flex-col items-center justify-center gap-0.5 rounded-full sm:h-10 sm:w-10 ${badgeBase}`}
                  >
                    <MapPin
                      className={`shrink-0 ${item.dayLabel ? "h-3 w-3 sm:h-3.5 sm:w-3.5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} ${accentIcon}`}
                      aria-hidden
                    />
                    {item.dayLabel ? (
                      <span className="text-[10px] font-bold leading-none text-slate-800 dark:text-zinc-200">
                        {item.dayLabel}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {showConnector ? (
                <div
                  aria-hidden="true"
                  className={`mt-2.5 w-px flex-1 border-l border-dashed border-slate-200 transition-colors group-hover:border-[#a855f7]/20 dark:border-zinc-800 dark:group-hover:border-[#a855f7]/25 ${
                    connectorTall ? "min-h-[5rem]" : "min-h-[2.5rem]"
                  }`}
                />
              ) : null}
            </div>

            {/* Content: no card chrome — sits on page background */}
            <div className="min-w-0 flex-1 pt-0.5">
              {item.title ? (
                <h4 className="text-[0.94rem] font-semibold leading-snug tracking-[-0.012em] text-slate-900 dark:text-white">
                  {item.title}
                </h4>
              ) : null}
              {item.description ? (
                <p
                  className={`mt-1.5 text-[0.9rem] leading-relaxed tracking-[-0.008em] text-slate-500 dark:text-zinc-400 ${
                    item.title ? "" : "font-medium text-slate-900 dark:text-white"
                  }`}
                >
                  {item.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
