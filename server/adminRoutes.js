import crypto from "crypto";
import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import sharp from "sharp";
import { z } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin requests. Try again later." },
});

export function createRequireAdmin(supabaseAdmin) {
  return async function requireAdmin(req, res, next) {
    if (!supabaseAdmin) {
      res.status(503).json({ error: "Supabase is not configured on the server." });
      return;
    }
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = auth.slice(7);
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      console.error("[admin] profiles lookup failed:", profileError);
      res.status(500).json({ error: "Could not verify admin role" });
      return;
    }
    if (profile?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    req.adminUser = user;
    next();
  };
}

const programStepSchema = z.object({
  days: z.string(),
  title: z.string(),
  description: z.string(),
});

function stripHtmlToText(s) {
  return String(s ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s|&nbsp;/gi, " ")
    .trim();
}

/** Coerce legacy string / JSON string / array into program step objects for Supabase jsonb. */
function normalizeProgramField(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map((raw, i) => normalizeProgramStep(raw, i));
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return null;
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed.map((raw, i) => normalizeProgramStep(raw, i));
      if (parsed !== null && typeof parsed === "object") {
        return [normalizeProgramStep(parsed, 0)];
      }
    } catch {
      /* legacy HTML or plain text */
    }
    return [{ days: "1", title: "Legacy", description: stripHtmlToText(s) || s }];
  }
  if (typeof value === "object") {
    return [normalizeProgramStep(value, 0)];
  }
  return null;
}

function normalizeProgramStep(raw, index) {
  const i = Number.isFinite(index) ? index : 0;
  if (raw == null) {
    return { days: String(i + 1), title: "", description: "" };
  }
  if (typeof raw === "object") {
    const daysStr = raw.days;
    if (typeof daysStr === "string" && daysStr.trim()) {
      return {
        days: daysStr.trim(),
        title: String(raw.title ?? raw.label ?? ""),
        description: String(
          raw.description ?? raw.body ?? raw.text ?? raw.content ?? raw.detail ?? "",
        ),
      };
    }
    const dayRaw = raw.day;
    const day =
      typeof dayRaw === "number" && Number.isFinite(dayRaw)
        ? Math.trunc(dayRaw)
        : parseInt(String(dayRaw ?? i + 1), 10) || i + 1;
    return {
      days: String(day),
      title: String(raw.title ?? raw.label ?? ""),
      description: String(
        raw.description ?? raw.body ?? raw.text ?? raw.content ?? raw.detail ?? "",
      ),
    };
  }
  return { days: String(i + 1), title: String(raw), description: "" };
}

/** Coerce string / JSON / array into string[] for text[] columns. */
function normalizeStringArrayField(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim()).filter(Boolean);
      }
    } catch {
      /* plain text / lines */
    }
    return s
      .split(/\n|,/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizePriceNumField(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeDurationDaysField(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const n = Math.trunc(Number(value));
  return Number.isFinite(n) ? n : null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const REF_YEAR = 2000;

function daysInCalendarMonthServer(month) {
  if (month < 1 || month > 12) return 0;
  return new Date(REF_YEAR, month, 0).getDate();
}

function isValidDayForMonthServer(month, day) {
  if (day < 1 || day > 31 || month < 1 || month > 12) return false;
  return day <= daysInCalendarMonthServer(month);
}

function mergeDepartureMonthRows(rows) {
  const map = new Map();
  for (const r of rows) {
    if (!r || typeof r !== "object") continue;
    const month = Math.trunc(Number(r.month));
    if (month < 1 || month > 12 || !Array.isArray(r.days)) continue;
    const daySet = new Set();
    for (const d of r.days) {
      const day = Math.trunc(Number(d));
      if (Number.isFinite(day) && isValidDayForMonthServer(month, day)) {
        daySet.add(day);
      }
    }
    const days = [...daySet].sort((a, b) => a - b);
    if (days.length === 0) continue;
    const le = r.label_en != null ? String(r.label_en).trim() : "";
    const ll = r.label_el != null ? String(r.label_el).trim() : "";
    const cur = map.get(month) ?? { days: new Set(), label_en: null, label_el: null };
    for (const d of days) {
      cur.days.add(d);
    }
    if (le && !cur.label_en) cur.label_en = le;
    if (ll && !cur.label_el) cur.label_el = ll;
    map.set(month, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([month, { days, label_en, label_el }]) => ({
      month,
      days: [...days].sort((x, y) => x - y),
      label_en: label_en || null,
      label_el: label_el || null,
    }));
}

/** Normalize legacy ISO range rows into month+days (year dropped). */
function expandLegacyIsoRow(raw) {
  const start = String(raw.start ?? "").trim();
  const end = String(raw.end ?? "").trim();
  if (!ISO_DATE.test(start) || !ISO_DATE.test(end) || start > end) return [];
  const a = new Date(start + "T12:00:00");
  const b = new Date(end + "T12:00:00");
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || a > b) return [];
  const le = raw.label_en != null ? String(raw.label_en).trim() : "";
  const ll = raw.label_el != null ? String(raw.label_el).trim() : "";
  const byMonth = new Map();
  const cur = new Date(a.getTime());
  const endT = b.getTime();
  while (cur.getTime() <= endT) {
    const mo = cur.getMonth() + 1;
    const day = cur.getDate();
    if (!byMonth.has(mo)) byMonth.set(mo, new Set());
    byMonth.get(mo).add(day);
    cur.setDate(cur.getDate() + 1);
  }
  return [...byMonth.entries()].map(([month, set]) => ({
    month,
    days: [...set].sort((x, y) => x - y),
    label_en: le || null,
    label_el: ll || null,
  }));
}

function normalizeDepartureWindowsArray(arr) {
  if (!Array.isArray(arr)) return [];
  const monthRows = [];
  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    if (Array.isArray(raw.days)) {
      const month = Math.trunc(Number(raw.month));
      if (!Number.isFinite(month) || month < 1 || month > 12) continue;
      const daySet = new Set();
      for (const d of raw.days) {
        const day = Math.trunc(Number(d));
        if (Number.isFinite(day) && isValidDayForMonthServer(month, day)) {
          daySet.add(day);
        }
      }
      const days = [...daySet].sort((a, b) => a - b);
      if (days.length === 0) continue;
      const le = raw.label_en != null ? String(raw.label_en).trim() : "";
      const ll = raw.label_el != null ? String(raw.label_el).trim() : "";
      monthRows.push({
        month,
        days,
        label_en: le || null,
        label_el: ll || null,
      });
      continue;
    }
    if (typeof raw.start === "string" && typeof raw.end === "string") {
      monthRows.push(...expandLegacyIsoRow(raw));
    }
  }
  return mergeDepartureMonthRows(monthRows);
}

/** Coerce JSON string / array into normalized departure_windows for jsonb. */
function normalizeDepartureWindowsField(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return normalizeDepartureWindowsArray(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return normalizeDepartureWindowsArray(value);
  }
  return [];
}

/** Per-departure pricing rows: validate month/days only; do not merge months. */
function normalizePricingSegmentsArray(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const raw of arr) {
    if (!raw || typeof raw !== "object") continue;
    const month = Math.trunc(Number(raw.month));
    if (!Number.isFinite(month) || month < 1 || month > 12) continue;
    const daySet = new Set();
    if (Array.isArray(raw.days)) {
      for (const d of raw.days) {
        const day = Math.trunc(Number(d));
        if (Number.isFinite(day) && isValidDayForMonthServer(month, day)) {
          daySet.add(day);
        }
      }
    }
    const days = [...daySet].sort((a, b) => a - b);
    if (days.length === 0) continue;

    const strOrNull = (v) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s || null;
    };
    const numOrNull = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const intOrNull = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const n = Math.trunc(Number(v));
      return Number.isFinite(n) ? n : null;
    };

    out.push({
      month,
      days,
      hotel_en: strOrNull(raw.hotel_en),
      hotel_el: strOrNull(raw.hotel_el),
      duration_days: intOrNull(raw.duration_days),
      price_double: numOrNull(raw.price_double),
      price_single: numOrNull(raw.price_single),
      price_triple: numOrNull(raw.price_triple),
      price_child: numOrNull(raw.price_child),
    });
  }
  return out;
}

function normalizePricingSegmentsField(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return normalizePricingSegmentsArray(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return normalizePricingSegmentsArray(value);
  }
  return [];
}

const LEGACY_TRIP_BODY_KEYS = ["type", "type_el", "category", "category_el"];

function normalizeTripPutBody(body) {
  if (!body || typeof body !== "object") return body;
  const out = { ...body };
  for (const key of LEGACY_TRIP_BODY_KEYS) {
    delete out[key];
  }
  for (const key of ["program", "program_el"]) {
    if (key in out) {
      out[key] = normalizeProgramField(out[key]);
    }
  }
  for (const key of [
    "included",
    "included_el",
    "not_included",
    "not_included_el",
    "tags",
    "tags_el",
    "transport",
    "transport_el",
    "gallery",
  ]) {
    if (key in out) {
      out[key] = normalizeStringArrayField(out[key]);
    }
  }
  if ("price_num" in out) {
    out.price_num = normalizePriceNumField(out.price_num);
  }
  if ("duration_days" in out) {
    out.duration_days = normalizeDurationDaysField(out.duration_days);
  }
  if ("departure_windows" in out) {
    out.departure_windows = normalizeDepartureWindowsField(out.departure_windows);
  }
  if ("pricing_segments" in out) {
    out.pricing_segments = normalizePricingSegmentsField(out.pricing_segments);
  }
  if (out.is_seasonal === false) {
    out.seasonal_name = null;
  }
  if (out.is_seasonal === true && (out.seasonal_name === "" || out.seasonal_name === undefined)) {
    out.seasonal_name = null;
  }
  return out;
}

const adminTripPutSchema = z
  .object({
    title: z.string().optional(),
    title_el: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    location_el: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    country_el: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    gallery: z.array(z.string()).max(4).nullable().optional(),
    description: z.string().nullable().optional(),
    description_el: z.string().nullable().optional(),
    trip_notes: z.string().nullable().optional(),
    trip_notes_el: z.string().nullable().optional(),
    program: z.array(programStepSchema).nullable().optional(),
    program_el: z.array(programStepSchema).nullable().optional(),
    included: z.array(z.string()).nullable().optional(),
    included_el: z.array(z.string()).nullable().optional(),
    not_included: z.array(z.string()).nullable().optional(),
    not_included_el: z.array(z.string()).nullable().optional(),
    price_num: z.number().nullable().optional(),
    duration_days: z.number().int().nullable().optional(),
    transport: z.array(z.string()).nullable().optional(),
    transport_el: z.array(z.string()).nullable().optional(),
    date_range: z.string().nullable().optional(),
    date_range_el: z.string().nullable().optional(),
    departure_windows: z
      .array(
        z.object({
          month: z.coerce.number().int().min(1).max(12),
          days: z.array(z.coerce.number().int().min(1).max(31)),
          label_en: z.string().nullable().optional(),
          label_el: z.string().nullable().optional(),
        }),
      )
      .nullable()
      .optional(),
    pricing_segments: z
      .array(
        z.object({
          month: z.coerce.number().int().min(1).max(12),
          days: z.array(z.coerce.number().int().min(1).max(31)),
          hotel_en: z.string().nullable().optional(),
          hotel_el: z.string().nullable().optional(),
          duration_days: z.coerce.number().int().nullable().optional(),
          price_double: z.number().nullable().optional(),
          price_single: z.number().nullable().optional(),
          price_triple: z.number().nullable().optional(),
          price_child: z.number().nullable().optional(),
        }),
      )
      .nullable()
      .optional(),
    departure_city: z.string().nullable().optional(),
    departure_city_el: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    tags_el: z.array(z.string()).nullable().optional(),
    is_featured: z.boolean().nullable().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    is_seasonal: z.boolean().optional(),
    seasonal_name: z.string().nullable().optional(),
  })
  .strict();

export function registerAdminRoutes(app, { supabaseAdmin }) {
  const requireAdmin = createRequireAdmin(supabaseAdmin);
  const bucket = process.env.SUPABASE_TRIP_IMAGES_BUCKET || "trip-images";
  const inquiryAttachmentsBucket =
    process.env.SUPABASE_INQUIRY_ATTACHMENTS_BUCKET || "inquiry-attachments";

  app.post(
    "/api/admin/upload-image",
    adminLimiter,
    requireAdmin,
    upload.single("file"),
    async (req, res) => {
      if (!req.file?.buffer) {
        res.status(400).json({ error: "Missing file field 'file'" });
        return;
      }
      const allowed = new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
      ]);
      if (!allowed.has(req.file.mimetype)) {
        res.status(400).json({ error: "Unsupported image type" });
        return;
      }
      try {
        const webpBuffer = await sharp(req.file.buffer)
          .rotate()
          .resize({ width: 1920, withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toBuffer();

        const filename = `${crypto.randomUUID()}.webp`;
        const { error: upErr } = await supabaseAdmin.storage
          .from(bucket)
          .upload(filename, webpBuffer, {
            contentType: "image/webp",
            upsert: false,
          });
        if (upErr) {
          console.error("[admin] storage upload:", upErr);
          res.status(500).json({ error: "Storage upload failed" });
          return;
        }
        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename);
        res.json({ url: publicUrl, path: filename });
      } catch (err) {
        console.error("[admin] upload-image:", err);
        res.status(500).json({ error: "Image processing failed" });
      }
    },
  );

  app.patch(
    "/api/admin/trips/:id",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      const id = req.params.id;
      const parsed = z
        .object({ is_featured: z.boolean() })
        .safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({ error: "Body must include is_featured (boolean)" });
        return;
      }
      const { error } = await supabaseAdmin
        .from("trips")
        .update({ is_featured: parsed.data.is_featured })
        .eq("id", id);
      if (error) {
        console.error("[admin] patch trip:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ ok: true });
    },
  );

  app.post(
    "/api/admin/trips",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      const parsed = adminTripPutSchema.safeParse(normalizeTripPutBody(req.body ?? {}));
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        res.status(400).json({
          error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid body",
        });
        return;
      }
      const row = { ...parsed.data };
      Object.keys(row).forEach((k) => {
        if (row[k] === undefined) delete row[k];
      });
      if (row.is_featured === undefined || row.is_featured === null) {
        row.is_featured = false;
      }
      if (row.status === undefined || row.status === null) {
        row.status = "inactive";
      }
      const { data, error } = await supabaseAdmin.from("trips").insert(row).select("id").single();
      if (error) {
        console.error("[admin] post trip:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ id: data?.id });
    },
  );

  app.put(
    "/api/admin/trips/:id",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      const id = req.params.id;
      const parsed = adminTripPutSchema.safeParse(normalizeTripPutBody(req.body ?? {}));
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        res.status(400).json({
          error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid body",
        });
        return;
      }
      const updates = { ...parsed.data };
      Object.keys(updates).forEach((k) => {
        if (updates[k] === undefined) delete updates[k];
      });
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No fields to update" });
        return;
      }
      const { error } = await supabaseAdmin.from("trips").update(updates).eq("id", id);
      if (error) {
        console.error("[admin] put trip:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ ok: true });
    },
  );

  const seasonalKeySlug = z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9_-]+$/, "seasonal_key must be lowercase alphanumeric with _ or -");

  const seasonalConfigPostSchema = z
    .object({
      seasonal_key: seasonalKeySlug,
      nav_label_el: z.string().min(1).max(200),
      nav_label_en: z.string().min(1).max(200),
      display_order: z.number().int(),
      is_active: z.boolean(),
    })
    .strict();

  const seasonalConfigPutSchema = z
    .object({
      nav_label_el: z.string().min(1).max(200).optional(),
      nav_label_en: z.string().min(1).max(200).optional(),
      display_order: z.number().int().optional(),
      is_active: z.boolean().optional(),
    })
    .strict()
    .refine((o) => Object.keys(o).length > 0, { message: "No fields to update" });

  /** Match trips to configs even if DB has different casing or stray whitespace. */
  function normalizeSeasonalKey(s) {
    return String(s ?? "")
      .trim()
      .toLowerCase();
  }

  app.get(
    "/api/admin/seasonal-configs",
    adminLimiter,
    requireAdmin,
    async (req, res) => {
      if (!supabaseAdmin) {
        res.status(503).json({ error: "Supabase is not configured on the server." });
        return;
      }
      const { data: configs, error: cErr } = await supabaseAdmin
        .from("seasonal_configs")
        .select(
          "seasonal_key, nav_label_el, nav_label_en, display_order, is_active, created_at",
        )
        .order("display_order", { ascending: true })
        .order("seasonal_key", { ascending: true });
      if (cErr) {
        // 42P01 = undefined_table only — do not treat missing columns (42703) as "table missing"
        if (cErr.code === "42P01") {
          res.status(503).json({ error: "seasonal_configs table is not available." });
          return;
        }
        console.error("[admin] seasonal-configs list:", cErr);
        res.status(500).json({ error: cErr.message });
        return;
      }
      const { data: tripRows, error: tErr } = await supabaseAdmin
        .from("trips")
        .select("seasonal_name");
      if (tErr) {
        console.error("[admin] seasonal-configs trips:", tErr);
        res.status(500).json({ error: tErr.message });
        return;
      }
      const keySet = new Set(
        (configs ?? []).map((c) => normalizeSeasonalKey(c.seasonal_key)),
      );
      const distinct = new Set();
      for (const row of tripRows ?? []) {
        const n = row.seasonal_name;
        if (n == null) continue;
        const nk = normalizeSeasonalKey(n);
        if (nk) distinct.add(nk);
      }
      const orphanSeasonalNames = [...distinct].filter((k) => !keySet.has(k)).sort();

      const tripCountByKey = new Map();
      for (const row of tripRows ?? []) {
        const n = row.seasonal_name;
        if (n == null) continue;
        const nk = normalizeSeasonalKey(n);
        if (!nk) continue;
        tripCountByKey.set(nk, (tripCountByKey.get(nk) ?? 0) + 1);
      }
      const configsWithCounts = (configs ?? []).map((c) => ({
        ...c,
        trip_count: tripCountByKey.get(normalizeSeasonalKey(c.seasonal_key)) ?? 0,
      }));

      res.json({ configs: configsWithCounts, orphanSeasonalNames });
    },
  );

  app.post(
    "/api/admin/seasonal-configs",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      if (!supabaseAdmin) {
        res.status(503).json({ error: "Supabase is not configured on the server." });
        return;
      }
      const parsed = seasonalConfigPostSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        res.status(400).json({
          error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid body",
        });
        return;
      }
      const row = { ...parsed.data };
      const { error } = await supabaseAdmin.from("seasonal_configs").insert(row);
      if (error) {
        if (error.code === "42P01") {
          res.status(503).json({ error: "seasonal_configs table is not available." });
          return;
        }
        console.error("[admin] post seasonal-config:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      res.status(201).json({ ok: true });
    },
  );

  app.put(
    "/api/admin/seasonal-configs/:key",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      if (!supabaseAdmin) {
        res.status(503).json({ error: "Supabase is not configured on the server." });
        return;
      }
      const keyParse = seasonalKeySlug.safeParse(req.params.key ?? "");
      if (!keyParse.success) {
        res.status(400).json({ error: "Invalid seasonal key" });
        return;
      }
      const parsed = seasonalConfigPutSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        res.status(400).json({
          error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid body",
        });
        return;
      }
      const updates = { ...parsed.data };
      const { error } = await supabaseAdmin
        .from("seasonal_configs")
        .update(updates)
        .eq("seasonal_key", keyParse.data);
      if (error) {
        if (error.code === "42P01") {
          res.status(503).json({ error: "seasonal_configs table is not available." });
          return;
        }
        console.error("[admin] put seasonal-config:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ ok: true });
    },
  );

  app.delete(
    "/api/admin/seasonal-configs/:key",
    adminLimiter,
    requireAdmin,
    async (req, res) => {
      if (!supabaseAdmin) {
        res.status(503).json({ error: "Supabase is not configured on the server." });
        return;
      }
      const keyParse = seasonalKeySlug.safeParse(req.params.key ?? "");
      if (!keyParse.success) {
        res.status(400).json({ error: "Invalid seasonal key" });
        return;
      }
      const key = keyParse.data;
      const keyNorm = normalizeSeasonalKey(key);

      const { data: tripRows, error: tripsErr } = await supabaseAdmin
        .from("trips")
        .select("id, seasonal_name")
        .not("seasonal_name", "is", null);

      if (tripsErr) {
        console.error("[admin] delete seasonal-config load trips:", tripsErr);
        res.status(500).json({ error: tripsErr.message });
        return;
      }

      const idsToUnlink = (tripRows ?? [])
        .filter((r) => normalizeSeasonalKey(r.seasonal_name) === keyNorm)
        .map((r) => r.id);

      const tripCount = idsToUnlink.length;

      if (idsToUnlink.length > 0) {
        const { error: unlinkErr } = await supabaseAdmin
          .from("trips")
          .update({ is_seasonal: false, seasonal_name: null })
          .in("id", idsToUnlink);

        if (unlinkErr) {
          console.error("[admin] delete seasonal-config unlink trips:", unlinkErr);
          res.status(500).json({ error: unlinkErr.message });
          return;
        }
      }

      const { error: delErr } = await supabaseAdmin
        .from("seasonal_configs")
        .delete()
        .eq("seasonal_key", key);

      if (delErr) {
        if (delErr.code === "42P01") {
          res.status(503).json({ error: "seasonal_configs table is not available." });
          return;
        }
        console.error("[admin] delete seasonal-config row:", delErr);
        res.status(500).json({ error: delErr.message });
        return;
      }

      res.json({ ok: true, unlinkedTrips: tripCount });
    },
  );

  const inquiryAttachmentItemSchema = z.object({
    name: z.string().min(1).max(500),
    path: z.string().min(1).max(2000),
    type: z.string().min(1).max(200),
  });

  function inquiryCommentContentMeaningful(html) {
    const stripped = String(html ?? "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s|&nbsp;/gi, "");
    return stripped.length > 0;
  }

  const inquiryCommentBodySchema = z
    .object({
      content: z.string().max(500_000).default(""),
      attachments: z.array(inquiryAttachmentItemSchema).max(5).default([]),
    })
    .superRefine((data, ctx) => {
      if (!inquiryCommentContentMeaningful(data.content) && data.attachments.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Add comment text or at least one attachment",
          path: ["content"],
        });
      }
      data.attachments.forEach((a, i) => {
        if (a.path.includes("..") || a.path.startsWith("/")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid storage path",
            path: ["attachments", i, "path"],
          });
        }
      });
    });

  app.get(
    "/api/admin/inquiries/:id/comments",
    adminLimiter,
    requireAdmin,
    async (req, res) => {
      const inquiryId = req.params.id;
      const commentColumns =
        "id, inquiry_id, admin_id, content, created_at, author_label, attachments";
      const { data, error } = await supabaseAdmin
        .from("inquiry_comments")
        .select(commentColumns)
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });
      if (error) {
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          res.status(503).json({ error: "inquiry_comments table is not available." });
          return;
        }
        console.error("[admin] get inquiry comments:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ comments: data ?? [] });
    },
  );

  app.post(
    "/api/admin/inquiries/:id/comments",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      const inquiryId = req.params.id;
      const parsed = inquiryCommentBodySchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        res.status(400).json({
          error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid body",
        });
        return;
      }
      const safeDecodePath = (p) => {
        const s = String(p ?? "").trim();
        try {
          return decodeURIComponent(s);
        } catch {
          return s;
        }
      };
      const inquiryPrefix = `${safeDecodePath(inquiryId)}/`;
      for (const a of parsed.data.attachments) {
        const decoded = safeDecodePath(a.path);
        if (decoded.includes("..") || decoded.startsWith("/")) {
          res.status(400).json({ error: "Invalid storage path" });
          return;
        }
        if (!decoded.startsWith(inquiryPrefix)) {
          res.status(400).json({ error: "Attachment path must belong to this inquiry" });
          return;
        }
      }

      const user = req.adminUser;
      const author_label =
        user.email ??
        (typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : null) ??
        "Admin";
      const row = {
        inquiry_id: inquiryId,
        admin_id: user.id,
        content: parsed.data.content,
        author_label,
        attachments: parsed.data.attachments,
      };
      const commentSelect =
        "id, inquiry_id, admin_id, content, created_at, author_label, attachments";
      const { data, error } = await supabaseAdmin
        .from("inquiry_comments")
        .insert(row)
        .select(commentSelect)
        .single();
      if (error) {
        if (error.message?.includes("author_label")) {
          const { author_label: _a, ...withoutLabel } = row;
          const retry = await supabaseAdmin
            .from("inquiry_comments")
            .insert(withoutLabel)
            .select("id, inquiry_id, admin_id, content, created_at, attachments")
            .single();
          if (retry.error) {
            console.error("[admin] post inquiry comment:", retry.error);
            res.status(500).json({ error: retry.error.message });
            return;
          }
          res.status(201).json({ comment: { ...retry.data, author_label: author_label } });
          return;
        }
        console.error("[admin] post inquiry comment:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      if (process.env.NODE_ENV !== "production") {
        console.log("[admin] inquiry comment inserted attachments:", data?.attachments);
      }
      res.status(201).json({ comment: data });
    },
  );

  const removeCommentAttachmentBodySchema = z.object({
    removeAttachmentPath: z.string().min(1).max(2000),
  });

  app.patch(
    "/api/admin/inquiries/:inquiryId/comments/:commentId",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      const inquiryId = req.params.inquiryId;
      const commentId = req.params.commentId;
      const parsed = removeCommentAttachmentBodySchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        res.status(400).json({
          error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid body",
        });
        return;
      }
      const removePath = parsed.data.removeAttachmentPath;
      if (removePath.includes("..") || removePath.startsWith("/")) {
        res.status(400).json({ error: "Invalid storage path" });
        return;
      }
      if (!removePath.startsWith(`${inquiryId}/`)) {
        res.status(400).json({ error: "Attachment path must belong to this inquiry" });
        return;
      }

      const user = req.adminUser;
      const { data: comment, error: fetchErr } = await supabaseAdmin
        .from("inquiry_comments")
        .select("id, inquiry_id, admin_id, attachments")
        .eq("id", commentId)
        .eq("inquiry_id", inquiryId)
        .maybeSingle();

      if (fetchErr) {
        console.error("[admin] fetch comment for attachment delete:", fetchErr);
        res.status(500).json({ error: fetchErr.message });
        return;
      }
      if (!comment) {
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      if (comment.admin_id !== user.id) {
        res.status(403).json({ error: "You can only delete attachments from your own comments" });
        return;
      }

      const attachments = Array.isArray(comment.attachments) ? comment.attachments : [];
      const nextAttachments = attachments.filter((a) => a && a.path !== removePath);
      if (nextAttachments.length === attachments.length) {
        res.status(400).json({ error: "Attachment not found on this comment" });
        return;
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("inquiry_comments")
        .update({ attachments: nextAttachments })
        .eq("id", commentId)
        .eq("inquiry_id", inquiryId)
        .select("id, inquiry_id, admin_id, content, created_at, author_label, attachments")
        .single();

      if (updateErr) {
        console.error("[admin] update comment attachments:", updateErr);
        res.status(500).json({ error: updateErr.message });
        return;
      }

      const { error: rmErr } = await supabaseAdmin.storage
        .from(inquiryAttachmentsBucket)
        .remove([removePath]);
      if (rmErr) {
        console.error("[admin] storage remove attachment:", rmErr);
        await supabaseAdmin
          .from("inquiry_comments")
          .update({ attachments })
          .eq("id", commentId)
          .eq("inquiry_id", inquiryId);
        res.status(500).json({ error: "Could not remove file from storage" });
        return;
      }

      res.json({ comment: updated });
    },
  );

  app.patch(
    "/api/admin/inquiries/:id",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      const id = req.params.id;
      const parsed = z
        .object({
          status: z.enum(["new", "contacted", "resolved"]).optional(),
        })
        .safeParse(req.body ?? {});
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        res.status(400).json({
          error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid body",
        });
        return;
      }
      const updates = { ...parsed.data };
      Object.keys(updates).forEach((k) => {
        if (updates[k] === undefined) delete updates[k];
      });
      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No fields to update" });
        return;
      }
      const { error } = await supabaseAdmin.from("inquiries").update(updates).eq("id", id);
      if (error) {
        console.error("[admin] patch inquiry:", error);
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ ok: true });
    },
  );

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[admin] Inquiry comments API registered: GET|POST /api/admin/inquiries/:id/comments",
    );
  }
}
