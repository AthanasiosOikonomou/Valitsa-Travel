/**
 * Filename-based trip image variants in public bucket `trip-images`.
 * Keep in sync with `src/lib/tripImageVariants.ts`.
 */

export const VARIANT_WIDTHS = [400, 800, 1200];
export const CANONICAL_MAX_WIDTH = 1920;
export const VARIANT_CACHE_CONTROL = "31536000";
export const TRIP_IMAGES_BUCKET = "trip-images";

const VARIANT_SUFFIX_RE = /-(400|800|1200)(\.[^./]+)$/;
const PUBLIC_OBJECT_PREFIX = "/storage/v1/object/public/";

export function isTripImagesPublicUrl(src) {
  if (!src) return false;
  try {
    const url = new URL(src);
    const host = url.hostname.toLowerCase();
    if (!host.endsWith(".supabase.co")) return false;
    return url.pathname.includes(`${PUBLIC_OBJECT_PREFIX}${TRIP_IMAGES_BUCKET}/`);
  } catch {
    return false;
  }
}

export function parseTripImageObjectPath(src) {
  if (!isTripImagesPublicUrl(src)) return null;
  try {
    const url = new URL(src);
    const marker = `${PUBLIC_OBJECT_PREFIX}${TRIP_IMAGES_BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx < 0) return null;
    const objectPath = decodeURIComponent(url.pathname.slice(idx + marker.length));
    return objectPath || null;
  } catch {
    return null;
  }
}

export function stripVariantSuffix(filename) {
  return filename.replace(VARIANT_SUFFIX_RE, "$2");
}

export function toCanonicalObjectPath(objectPath) {
  const parts = objectPath.split("/").filter(Boolean);
  if (parts.length === 0) return objectPath;
  const filename = parts[parts.length - 1];
  parts[parts.length - 1] = stripVariantSuffix(filename);
  return parts.join("/");
}

export function variantObjectPath(canonicalObjectPath, width) {
  const canonical = toCanonicalObjectPath(canonicalObjectPath);
  const parts = canonical.split("/").filter(Boolean);
  const filename = parts[parts.length - 1] ?? canonical;
  const stem = filename.replace(/\.[^./]+$/, "");
  parts[parts.length - 1] = `${stem}-${width}.webp`;
  return parts.join("/");
}

export function pickVariantWidth(requestedWidth) {
  if (!Number.isFinite(requestedWidth) || requestedWidth <= 0) return null;
  for (const width of VARIANT_WIDTHS) {
    if (width >= requestedWidth) return width;
  }
  return null;
}

function replaceObjectPath(src, objectPath) {
  const url = new URL(src);
  const marker = `${PUBLIC_OBJECT_PREFIX}${TRIP_IMAGES_BUCKET}/`;
  const idx = url.pathname.indexOf(marker);
  if (idx < 0) return src;
  const prefix = url.pathname.slice(0, idx + marker.length);
  url.pathname = `${prefix}${objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
  return url.toString();
}

export function canonicalUrl(src) {
  const objectPath = parseTripImageObjectPath(src);
  if (!objectPath) return src;
  return replaceObjectPath(src, toCanonicalObjectPath(objectPath));
}

export function variantUrl(src, requestedWidth) {
  const objectPath = parseTripImageObjectPath(src);
  if (!objectPath) return src;
  const canonicalPath = toCanonicalObjectPath(objectPath);
  const width = pickVariantWidth(requestedWidth);
  if (width == null) {
    return replaceObjectPath(src, canonicalPath);
  }
  return replaceObjectPath(src, variantObjectPath(canonicalPath, width));
}

export function allVariantObjectPaths(canonicalObjectPath) {
  const canonical = toCanonicalObjectPath(canonicalObjectPath);
  return VARIANT_WIDTHS.map((width) => variantObjectPath(canonical, width));
}
