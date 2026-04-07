import type { StaticImageSources } from "@/components/ProgressiveImage";

/**
 * Same-origin hero under `public/hero/`.
 *
 * Required: one WebP (or use JPEG/PNG as `HERO_IMAGE_SRC` and set `staticSources.webp` to that path).
 * Optional: `HERO_AVIF_SRC` — smaller for Chrome/Safari/Firefox when you export `hero.avif`.
 * Optional: `HERO_LQIP_SRC` — tiny WebP (~40px wide) for the blurred placeholder; if omitted, the
 *   panel uses the neutral background until the main image loads (no extra file).
 */
export const HERO_IMAGE_SRC = "/hero/hero.webp";

/** Set to e.g. `/hero/hero.avif` after you add an AVIF export. */
export const HERO_AVIF_SRC: string | undefined = undefined;

/** Set to e.g. `/hero/hero-lqip.webp` after you add a tiny WebP. */
export const HERO_LQIP_SRC: string | undefined = undefined;

export function getHeroStaticSources(): StaticImageSources {
  return {
    webp: HERO_IMAGE_SRC,
    ...(HERO_AVIF_SRC ? { avif: HERO_AVIF_SRC } : {}),
  };
}

/** Intrinsic dimensions of the main hero file — update if you change aspect ratio. */
export const HERO_IMAGE_WIDTH = 1920;
export const HERO_IMAGE_HEIGHT = 1152;
