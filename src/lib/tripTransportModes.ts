export const TRANSPORT_MODE_SLUGS = ["bus", "plane", "ship", "train"] as const;
export type TransportModeSlug = (typeof TRANSPORT_MODE_SLUGS)[number];

const LABELS_EL: Record<TransportModeSlug, string> = {
  bus: "Λεωφορείο",
  plane: "Αεροπλάνο",
  ship: "Πλοίο",
  train: "Τρένο",
};

const LABELS_EN: Record<TransportModeSlug, string> = {
  bus: "Bus",
  plane: "Plane",
  ship: "Ship",
  train: "Train",
};

/** Lowercase label → slug (Greek + English). */
const TOKEN_TO_SLUG = new Map<string, TransportModeSlug>();
for (const slug of TRANSPORT_MODE_SLUGS) {
  TOKEN_TO_SLUG.set(slug, slug);
  TOKEN_TO_SLUG.set(LABELS_EN[slug].toLowerCase(), slug);
  TOKEN_TO_SLUG.set(LABELS_EL[slug].toLowerCase(), slug);
}
TOKEN_TO_SLUG.set("aeroplane", "plane");
TOKEN_TO_SLUG.set("airplane", "plane");

export function transportLabelForSlug(slug: TransportModeSlug, lang: "en" | "gr"): string {
  return lang === "gr" ? LABELS_EL[slug] : LABELS_EN[slug];
}

export function transportSlugFromToken(raw: string): TransportModeSlug | null {
  const t = raw.trim().toLowerCase();
  if (!t) return null;
  if ((TRANSPORT_MODE_SLUGS as readonly string[]).includes(t)) return t as TransportModeSlug;
  return TOKEN_TO_SLUG.get(t) ?? null;
}

/** Parse comma- or newline-separated transport text into unique slugs (order preserved). */
export function parseTransportCsv(csv: string): TransportModeSlug[] {
  const s = csv.trim();
  if (!s) return [];
  const parts = s.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
  const seen = new Set<TransportModeSlug>();
  const out: TransportModeSlug[] = [];
  for (const p of parts) {
    const slug = transportSlugFromToken(p);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

function transportUnknownToCsv(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean).join(", ");
  }
  return String(value).trim();
}

/** Merge DB `transport` / `transport_el` (legacy CSV string or PostgreSQL text[]). */
export function mergeTransportSlugsFromColumns(transportEl: unknown, transport: unknown): TransportModeSlug[] {
  const a = parseTransportCsv(transportUnknownToCsv(transportEl));
  const b = parseTransportCsv(transportUnknownToCsv(transport));
  const seen = new Set<TransportModeSlug>();
  const out: TransportModeSlug[] = [];
  for (const slug of [...a, ...b]) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export function slugsToCsvEl(slugs: TransportModeSlug[]): string {
  return slugs.map((s) => LABELS_EL[s]).join(", ");
}

export function slugsToCsvEn(slugs: TransportModeSlug[]): string {
  return slugs.map((s) => LABELS_EN[s]).join(", ");
}

/** Labels per slug for PostgreSQL `text[]` columns (send real JS arrays to Supabase). */
export function slugsToLabelArray(slugs: TransportModeSlug[], lang: "en" | "gr"): string[] {
  return slugs.map((s) => transportLabelForSlug(s, lang));
}
