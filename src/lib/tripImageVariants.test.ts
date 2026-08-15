import { describe, expect, it } from "vitest";
import {
  allVariantObjectPaths,
  canonicalUrl,
  pickVariantWidth,
  toCanonicalObjectPath,
  variantObjectPath,
  variantUrl,
} from "./tripImageVariants";

const BASE =
  "https://abcd.supabase.co/storage/v1/object/public/trip-images/";
const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("tripImageVariants", () => {
  it("does not treat UUID hyphens as variant suffixes", () => {
    expect(toCanonicalObjectPath(`${UUID}.webp`)).toBe(`${UUID}.webp`);
  });

  it("strips a trailing -400/-800/-1200 suffix", () => {
    expect(toCanonicalObjectPath(`${UUID}-400.webp`)).toBe(`${UUID}.webp`);
    expect(toCanonicalObjectPath(`${UUID}-1200.webp`)).toBe(`${UUID}.webp`);
  });

  it("builds webp variant paths next to any canonical extension", () => {
    expect(variantObjectPath(`${UUID}.webp`, 400)).toBe(`${UUID}-400.webp`);
    expect(variantObjectPath(`${UUID}.jpg`, 800)).toBe(`${UUID}-800.webp`);
  });

  it("picks the smallest variant that covers the request", () => {
    expect(pickVariantWidth(20)).toBe(400);
    expect(pickVariantWidth(400)).toBe(400);
    expect(pickVariantWidth(401)).toBe(800);
    expect(pickVariantWidth(1200)).toBe(1200);
    expect(pickVariantWidth(1201)).toBeNull();
    expect(pickVariantWidth(1920)).toBeNull();
  });

  it("maps public URLs to variant siblings and canonical fallback", () => {
    const src = `${BASE}${UUID}.webp`;
    expect(variantUrl(src, 400)).toBe(`${BASE}${UUID}-400.webp`);
    expect(variantUrl(src, 960)).toBe(`${BASE}${UUID}-1200.webp`);
    expect(variantUrl(src, 1600)).toBe(src);
    expect(canonicalUrl(`${BASE}${UUID}-800.webp`)).toBe(src);
  });

  it("leaves non-supabase URLs unchanged", () => {
    const unsplash = "https://images.unsplash.com/photo-1?w=800";
    expect(variantUrl(unsplash, 400)).toBe(unsplash);
  });

  it("lists all three variant object paths", () => {
    expect(allVariantObjectPaths(`${UUID}.webp`)).toEqual([
      `${UUID}-400.webp`,
      `${UUID}-800.webp`,
      `${UUID}-1200.webp`,
    ]);
  });
});
