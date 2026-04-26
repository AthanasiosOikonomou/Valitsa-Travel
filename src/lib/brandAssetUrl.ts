/** Set at build time in vite.config (`production`) or `"dev"` in development. */
const VERSION = import.meta.env.VITE_BRAND_ASSET_VERSION ?? "";

/**
 * Public paths under `/public` (e.g. `/branding/navbar/logo-light.svg`).
 * Appends `?v=` in production so long-lived `Cache-Control` on SVG does not
 * strand old users after a logo deploy. Omits the query in dev (`"dev"`).
 */
export function brandAssetUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!VERSION || VERSION === "dev") return p;
  const sep = p.includes("?") ? "&" : "?";
  return `${p}${sep}v=${encodeURIComponent(VERSION)}`;
}

/** Absolute site URL + cache-busted branding path (for JSON-LD, etc.). */
export function absoluteBrandAssetUrl(siteOrigin: string, path: string): string {
  const origin = siteOrigin.replace(/\/+$/, "");
  return `${origin}${brandAssetUrl(path)}`;
}
