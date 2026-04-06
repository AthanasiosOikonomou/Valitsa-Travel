export type SeasonalNavItem = {
  key: string;
  label_el: string;
  label_en: string;
};

/**
 * Public endpoint — no auth. Used by the marketing navbar.
 */
export async function fetchSeasonalNavItems(): Promise<SeasonalNavItem[]> {
  try {
    const res = await fetch("/api/seasonal-nav");
    if (!res.ok) return [];
    const j = (await res.json()) as { items?: unknown };
    if (!Array.isArray(j.items)) return [];
    return j.items.filter(
      (x): x is SeasonalNavItem =>
        x != null &&
        typeof x === "object" &&
        typeof (x as SeasonalNavItem).key === "string" &&
        typeof (x as SeasonalNavItem).label_el === "string" &&
        typeof (x as SeasonalNavItem).label_en === "string",
    );
  } catch {
    return [];
  }
}
