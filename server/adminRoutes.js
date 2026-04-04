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
