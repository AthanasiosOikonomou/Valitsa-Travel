const ATHENS_TZ = "Europe/Athens";
const ANCHOR_HOUR = 5;
const STORAGE_KEY = "valitsa:admin-athens-refresh";

type AthensParts = {
  y: number;
  m: number;
  d: number;
  h: number;
  min: number;
  sec: number;
};

function getAthensParts(date: Date): AthensParts {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: ATHENS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    y: parseInt(get("year"), 10),
    m: parseInt(get("month"), 10),
    d: parseInt(get("day"), 10),
    h: parseInt(get("hour"), 10),
    min: parseInt(get("minute"), 10),
    sec: parseInt(get("second"), 10),
  };
}

/** Convert Athens wall-clock to UTC instant (iterative offset correction). */
function athensWallClockToUtc(
  y: number,
  m: number,
  d: number,
  h: number,
  min: number,
  sec = 0,
): Date {
  let utc = Date.UTC(y, m - 1, d, h - 2, min, sec);
  for (let i = 0; i < 8; i++) {
    const p = getAthensParts(new Date(utc));
    const deltaMin =
      (h - p.h) * 60 +
      (min - p.min) +
      (sec - p.sec) / 60 +
      (d - p.d) * 24 * 60 +
      (m - p.m) * 30 * 24 * 60;
    if (deltaMin === 0) break;
    utc += deltaMin * 60 * 1000;
  }
  return new Date(utc);
}

function addAthensCalendarDays(y: number, m: number, d: number, days: number): AthensParts {
  const noon = athensWallClockToUtc(y, m, d, 12, 0);
  const next = new Date(noon.getTime() + days * 24 * 60 * 60 * 1000);
  const p = getAthensParts(next);
  return { y: p.y, m: p.m, d: p.d, h: p.h, min: p.min, sec: p.sec };
}

function isPastAthens5AM(parts: AthensParts): boolean {
  return parts.h > ANCHOR_HOUR || (parts.h === ANCHOR_HOUR && (parts.min > 0 || parts.sec > 0));
}

/** Most recent 05:00 Europe/Athens at or before `now`. */
export function getLatestAthens5AM(now = new Date()): Date {
  const parts = getAthensParts(now);
  let { y, m, d } = parts;
  if (!isPastAthens5AM(parts)) {
    const prev = addAthensCalendarDays(y, m, d, -1);
    y = prev.y;
    m = prev.m;
    d = prev.d;
  }
  return athensWallClockToUtc(y, m, d, ANCHOR_HOUR, 0, 0);
}

/** Next 05:00 Europe/Athens strictly after `now`. */
export function getNextAthens5AM(now = new Date()): Date {
  const parts = getAthensParts(now);
  let { y, m, d } = parts;
  if (isPastAthens5AM(parts)) {
    const next = addAthensCalendarDays(y, m, d, 1);
    y = next.y;
    m = next.m;
    d = next.d;
  }
  return athensWallClockToUtc(y, m, d, ANCHOR_HOUR, 0, 0);
}

export function msUntilNextAthens5AM(now = new Date()): number {
  return Math.max(0, getNextAthens5AM(now).getTime() - now.getTime());
}

export function readLastAthensRefresh(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function markAthensSessionRefreshed(at = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(at));
  } catch {
    /* ignore quota / private mode */
  }
}

export function shouldRefreshAthensSession(
  lastRefreshMs: number | null,
  now = new Date(),
): boolean {
  if (lastRefreshMs == null) return true;
  return lastRefreshMs < getLatestAthens5AM(now).getTime();
}
