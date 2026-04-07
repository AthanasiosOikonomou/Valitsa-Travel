/**
 * Optional origin where Express serves `/api` (no trailing slash).
 * Set `VITE_API_BASE_URL` before `npm run build` when the main domain is static-only
 * and `/api` does not reach Node (e.g. https://api.example.com).
 *
 * `VITE_SEASONAL_ADMIN_API_ORIGIN` is still read as a fallback for older deployments.
 */
function getExpressApiOrigin(): string {
  const raw =
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    import.meta.env.VITE_SEASONAL_ADMIN_API_ORIGIN?.trim() ||
    "";
  return raw.replace(/\/+$/, "");
}

/** Prefix a path such as `/api/health` when a base origin is configured. */
export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const o = getExpressApiOrigin();
  return o ? `${o}${p}` : p;
}
