import { apiUrl } from "@/lib/apiBase";

export type SeasonalNavItem = {
  key: string;
  label_el: string;
  label_en: string;
};

/**
 * Public endpoint — no auth. Returns all **active** seasonal_configs in display_order
 * (see GET /api/seasonal-nav). Used by the marketing navbar and trip badges.
 */
export async function fetchSeasonalNavItems(): Promise<SeasonalNavItem[]> {
  try {
    const res = await fetch(apiUrl("/api/seasonal-nav"));
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
