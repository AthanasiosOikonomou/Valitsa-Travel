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

const adminTripPutSchema = z
  .object({
    title: z.string().optional(),
    title_el: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    location_el: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    country_el: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    description_el: z.string().nullable().optional(),
    program: z.string().nullable().optional(),
    program_el: z.string().nullable().optional(),
    included: z.string().nullable().optional(),
    included_el: z.string().nullable().optional(),
    price_num: z.number().nullable().optional(),
    duration_days: z.number().int().nullable().optional(),
    type: z.string().nullable().optional(),
    type_el: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    category_el: z.string().nullable().optional(),
    transport: z.string().nullable().optional(),
    transport_el: z.string().nullable().optional(),
    date_range: z.string().nullable().optional(),
    date_range_el: z.string().nullable().optional(),
    departure_city: z.string().nullable().optional(),
    departure_city_el: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    tags_el: z.array(z.string()).nullable().optional(),
    is_featured: z.boolean().nullable().optional(),
  })
  .strict();

export function registerAdminRoutes(app, { supabaseAdmin }) {
  const requireAdmin = createRequireAdmin(supabaseAdmin);
  const bucket = process.env.SUPABASE_TRIP_IMAGES_BUCKET || "trip-images";

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

  app.put(
    "/api/admin/trips/:id",
    adminLimiter,
    requireAdmin,
    express.json(),
    async (req, res) => {
      const id = req.params.id;
      const parsed = adminTripPutSchema.safeParse(req.body ?? {});
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
}
