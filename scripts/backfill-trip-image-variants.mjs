/**
 * Additive backfill of trip-images variants (400 / 800 / 1200 WebP).
 *
 * Safety:
 * - Defaults to --dry-run (no uploads).
 * - --execute only uploads missing variants with upsert: false.
 * - Never deletes, overwrites, or renames existing objects.
 *
 * Usage (from repo root, uses .env / server/.env):
 *   npm run backfill:trip-images
 *   npm run backfill:trip-images:execute
 *   npm run backfill:trip-images:verify
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import {
  CANONICAL_MAX_WIDTH,
  isTripImagesPublicUrl,
  parseTripImageObjectPath,
  toCanonicalObjectPath,
  TRIP_IMAGES_BUCKET,
  VARIANT_CACHE_CONTROL,
  VARIANT_WIDTHS,
  variantObjectPath,
} from "./lib/tripImageVariants.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../server/.env") });

const REPORT_PATH = path.join(__dirname, "backfill-report.json");
const PAGE_SIZE = 100;
const DELAY_MS = 200;

const args = new Set(process.argv.slice(2));
const dryRunFlag = args.has("--dry-run");
const execute = args.has("--execute") && !dryRunFlag;
const verify = args.has("--verify");
const dryRun = dryRunFlag || (!execute && !verify);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function publicObjectUrl(supabase, bucket, objectPath) {
  return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

async function objectExists(url) {
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (head.ok) return true;
    if (head.status === 405 || head.status === 403 || head.status === 400) {
      const ranged = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
      });
      return ranged.ok || ranged.status === 206;
    }
    return false;
  } catch {
    return false;
  }
}

async function fetchAllTrips(supabase) {
  const rows = [];
  let from = 0;
  for (;;) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("trips")
      .select("id, image, gallery")
      .range(from, to);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

function collectCanonicalPaths(trips) {
  const byPath = new Map();
  const skipped = [];

  const consider = (tripId, raw) => {
    const src = typeof raw === "string" ? raw.trim() : "";
    if (!src) return;
    if (!isTripImagesPublicUrl(src)) {
      skipped.push({ tripId, url: src, reason: "not-trip-images-public-url" });
      return;
    }
    const objectPath = parseTripImageObjectPath(src);
    if (!objectPath) {
      skipped.push({ tripId, url: src, reason: "unparsed-object-path" });
      return;
    }
    const canonical = toCanonicalObjectPath(objectPath);
    const entry = byPath.get(canonical) ?? { canonical, tripIds: [] };
    if (!entry.tripIds.includes(tripId)) entry.tripIds.push(tripId);
    byPath.set(canonical, entry);
  };

  for (const trip of trips) {
    consider(trip.id, trip.image);
    for (const item of trip.gallery ?? []) consider(trip.id, item);
  }

  return { canonicals: [...byPath.values()], skipped };
}

async function inspectCanonical(supabase, bucket, canonicalPath) {
  const originalUrl = publicObjectUrl(supabase, bucket, canonicalPath);
  const originalExists = await objectExists(originalUrl);
  const variants = [];
  for (const width of VARIANT_WIDTHS) {
    const objectPath = variantObjectPath(canonicalPath, width);
    const url = publicObjectUrl(supabase, bucket, objectPath);
    const exists = await objectExists(url);
    variants.push({ width, objectPath, url, exists });
  }
  return { canonicalPath, originalUrl, originalExists, variants };
}

async function createMissingVariants(supabase, bucket, inspection) {
  const missing = inspection.variants.filter((v) => !v.exists);
  if (missing.length === 0) return { uploaded: [], errors: [] };

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(inspection.canonicalPath);
  if (error || !data) {
    return {
      uploaded: [],
      errors: [
        {
          canonicalPath: inspection.canonicalPath,
          error: error?.message || "download-failed",
        },
      ],
    };
  }

  const input = Buffer.from(await data.arrayBuffer());
  const uploaded = [];
  const errors = [];

  for (const variant of missing) {
    try {
      const buffer = await sharp(input)
        .rotate()
        .resize({ width: variant.width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(variant.objectPath, buffer, {
          contentType: "image/webp",
          upsert: false,
          cacheControl: VARIANT_CACHE_CONTROL,
        });
      if (upErr) {
        const duplicate =
          /already exists|duplicate|resource already/i.test(upErr.message || "");
        if (duplicate) {
          uploaded.push({
            objectPath: variant.objectPath,
            width: variant.width,
            skipped: "already-exists",
          });
        } else {
          errors.push({
            objectPath: variant.objectPath,
            error: upErr.message,
          });
        }
      } else {
        uploaded.push({
          objectPath: variant.objectPath,
          width: variant.width,
          bytes: buffer.length,
        });
      }
    } catch (err) {
      errors.push({
        objectPath: variant.objectPath,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { uploaded, errors };
}

function writeReport(report) {
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`[backfill] wrote ${path.relative(process.cwd(), REPORT_PATH)}`);
}

async function main() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    console.error(
      "[backfill] Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY.",
    );
    process.exit(1);
  }

  const bucket = process.env.SUPABASE_TRIP_IMAGES_BUCKET || TRIP_IMAGES_BUCKET;
  const mode = execute ? (verify ? "execute+verify" : "execute") : verify ? "verify" : "dry-run";

  console.log(`[backfill] mode=${mode} bucket=${bucket} canonicalMax=${CANONICAL_MAX_WIDTH}`);
  if (dryRun && !execute) {
    console.log("[backfill] dry-run: no uploads will be made.");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const trips = await fetchAllTrips(supabase);
  const { canonicals, skipped } = collectCanonicalPaths(trips);
  console.log(
    `[backfill] trips=${trips.length} canonical objects=${canonicals.length} skipped urls=${skipped.length}`,
  );

  const wouldCreate = [];
  const missingOriginal = [];
  const complete = [];
  const uploaded = [];
  const errors = [];
  const verified = [];

  const shouldUpload = execute;
  const shouldVerify = verify;

  for (let i = 0; i < canonicals.length; i += 1) {
    const item = canonicals[i];
    const inspection = await inspectCanonical(supabase, bucket, item.canonical);
    const missing = inspection.variants.filter((v) => !v.exists);

    if (!inspection.originalExists) {
      missingOriginal.push({
        canonicalPath: item.canonical,
        tripIds: item.tripIds,
      });
      console.warn(`[backfill] missing original: ${item.canonical}`);
    } else if (missing.length === 0) {
      complete.push(item.canonical);
    } else {
      wouldCreate.push({
        canonicalPath: item.canonical,
        tripIds: item.tripIds,
        missing: missing.map((v) => v.objectPath),
      });
      console.log(
        `[backfill] ${item.canonical} missing ${missing.map((v) => v.width).join(",")}`,
      );
    }

    if (shouldUpload && inspection.originalExists && missing.length > 0) {
      const result = await createMissingVariants(supabase, bucket, inspection);
      uploaded.push(...result.uploaded);
      errors.push(...result.errors);
      await sleep(DELAY_MS);
    } else if (shouldUpload) {
      await sleep(50);
    }

    if (shouldVerify) {
      const after =
        shouldUpload && inspection.originalExists
          ? await inspectCanonical(supabase, bucket, item.canonical)
          : inspection;
      verified.push({
        canonicalPath: item.canonical,
        tripIds: item.tripIds,
        originalExists: after.originalExists,
        variants: after.variants.map((v) => ({
          width: v.width,
          objectPath: v.objectPath,
          exists: v.exists,
        })),
      });
    }

    if ((i + 1) % 10 === 0) {
      console.log(`[backfill] inspected ${i + 1}/${canonicals.length}`);
    }
  }

  const gaps = verify
    ? verified.filter(
        (row) =>
          !row.originalExists || row.variants.some((v) => !v.exists),
      )
    : wouldCreate;

  const report = {
    mode,
    generatedAt: new Date().toISOString(),
    bucket,
    tripCount: trips.length,
    canonicalCount: canonicals.length,
    completeCount: complete.length,
    wouldCreate,
    missingOriginal,
    skipped,
    uploaded,
    errors,
    verified: verify ? verified : undefined,
    gapCount: gaps.length,
  };
  writeReport(report);

  console.log(
    `[backfill] complete=${complete.length} wouldCreate=${wouldCreate.length} missingOriginal=${missingOriginal.length} uploaded=${uploaded.length} errors=${errors.length}`,
  );

  if (verify && gaps.length > 0) {
    console.error(`[backfill] verify failed: ${gaps.length} canonical(s) still have gaps`);
    process.exit(1);
  }
  if (errors.length > 0) {
    console.error(`[backfill] finished with ${errors.length} upload error(s)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[backfill] fatal:", err);
  process.exit(1);
});
