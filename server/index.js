import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import fs from "fs";
import http from "http";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { registerAdminRoutes } from "./adminRoutes.js";
import {
  buildTripOgHtml,
  isSocialCrawlerUserAgent,
  resolveTripOgImageRedirect,
  shouldInjectTripOg,
  isValidTripId,
} from "./tripOgHtml.js";
import {
  confirmationSubject,
  confirmationTextBody,
  generateEmailTemplate,
  normalizeInquiryLanguage,
  resolveDisplayNames,
} from "./confirmationEmailTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root .env first (Vite / shared secrets), then server/.env overrides — cwd-independent paths.
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = Number(process.env.PORT || process.env.API_PORT || 8787);
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "Production";
const requireCaptcha = isProduction;

app.disable("x-powered-by");
app.set("trust proxy", 1);

/** Social crawlers must receive 200 + OG HTML/images (never blocked by app middleware). */
app.use((req, res, next) => {
  if (isSocialCrawlerUserAgent(req.get("user-agent"))) {
    res.setHeader("X-Social-Crawler", "1");
  }
  next();
});

const normalizeOrigin = (value) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
};

const isLocalDevOrigin = (value) => {
  try {
    const url = new URL(value);
    return /^(localhost|127\.0\.0\.1)$/i.test(url.hostname);
  } catch {
    return false;
  }
};

const parseCorsOrigins = (rawValue) =>
  rawValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter((origin) => origin !== "*")
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

const defaultCorsOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://127.0.0.1:5180",
  "http://localhost:5180",
];

const configuredOrigins = parseCorsOrigins(process.env.CORS_ORIGIN || "");
const corsOrigins = new Set(
  isProduction
    ? configuredOrigins
    : [...defaultCorsOrigins, ...configuredOrigins],
);

if (isProduction && corsOrigins.size === 0) {
  throw new Error(
    "CORS_ORIGIN must define exact production origins when NODE_ENV=production.",
  );
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
    referrerPolicy: { policy: "no-referrer" },
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!isProduction && isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);
      if (normalized && corsOrigins.has(normalized)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: false, limit: "20kb" }));

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many requests from this IP. Please wait a few minutes and try again.",
  },
});

const inquirySpeedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3,
  delayMs: () => 500,
});

const trackClickLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

const seasonalNavLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please try again later.",
  },
});

const inquiryRoutes = ["/api/send-inquiry", "/send-inquiry"];

app.use(inquiryRoutes, inquiryLimiter, inquirySpeedLimiter);

const inquirySchema = z.object({
  from_name: z.string().trim().min(2).max(120),
  from_email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+\d\s\-().]*$/, "Invalid phone")
    .optional()
    .default(""),
  message: z.string().trim().min(10).max(4000),
  source: z.enum(["contact-modal", "trip-detail"]),
  trip_id: z.string().uuid().nullable().optional(),
  trip_title: z.string().trim().max(180).optional().default(""),
  trip_location: z.string().trim().max(180).optional().default(""),
  trip_price: z.string().trim().max(60).optional().default(""),
  trip_url: z
    .string()
    .trim()
    .url()
    .max(500)
    .or(z.literal(""))
    .optional()
    .default(""),
  trip_image: z.string().trim().max(2000).optional().default(""),
  submitted_at: z.string().trim().datetime({ offset: true }).optional(),
  captcha_token: z.string().trim().max(4000).optional().default(""),
  first_name: z.string().trim().max(60).optional().default(""),
  last_name: z.string().trim().max(60).optional().default(""),
  language: z.enum(["en", "gr", "el"]).optional(),
  locale: z.enum(["en", "gr", "el"]).optional(),
});

const trackClickSchema = z.object({
  trip_id: z.string().uuid(),
  name: z.string().trim().max(400).optional().default(""),
  image: z.string().trim().max(2000).optional().default(""),
});

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("`", "&#96;");

const sanitizeHeader = (value) =>
  String(value)
    .replace(/[\r\n]+/g, " ")
    .trim();

const isSafeHttpUrl = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const verifyCaptcha = async (token, remoteIp) => {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || "";
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || "";

  if (turnstileSecret) {
    const body = new URLSearchParams({
      secret: turnstileSecret,
      response: token,
    });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    const result = await response.json();
    return Boolean(result?.success);
  }

  if (recaptchaSecret) {
    const body = new URLSearchParams({
      secret: recaptchaSecret,
      response: token,
    });
    if (remoteIp) body.set("remoteip", remoteIp);

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );

    const result = await response.json();
    return Boolean(result?.success);
  }

  return false;
};

const hasCaptchaProviderConfigured =
  Boolean(process.env.TURNSTILE_SECRET_KEY) ||
  Boolean(process.env.RECAPTCHA_SECRET_KEY);

const required = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  to: process.env.MAIL_TO,
};

// MAIL_CC is optional
const mailCc = process.env.MAIL_CC || "";
/** Visible From address (SMTP auth uses MAIL_USER). Defaults to sales inbox. */
const mailFrom = process.env.MAIL_FROM?.trim() || "sales@valitsatravel.gr";

const normalizeEmailAddress = (addr) => {
  const s = String(addr ?? "").trim();
  const m = s.match(/<([^>]+)>/);
  return (m ? m[1] : s).trim().toLowerCase();
};

/** When display From ≠ authenticated mailbox, many SMTP servers only deliver to internal addresses unless envelope MAIL FROM uses the auth user. */
const useSmtpEnvelopeFromAuth =
  Boolean(required.user) &&
  normalizeEmailAddress(required.user) !== normalizeEmailAddress(mailFrom);

const smtpEnvelopeFromAuth = (toList) =>
  useSmtpEnvelopeFromAuth
    ? {
        envelope: {
          from: required.user,
          to: toList,
        },
      }
    : {};

const supabaseUrl =
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

if (
  !supabaseAdmin &&
  !isProduction &&
  process.env.NODE_ENV !== "test"
) {
  console.warn(
    "[api] Supabase service client not configured: set VITE_SUPABASE_URL or SUPABASE_URL plus SUPABASE_SERVICE_ROLE_KEY in .env or server/.env. Admin DB routes return 503 until configured.",
  );
}

const inquiriesDbEnabled = Boolean(supabaseAdmin);

const persistInquiry = async ({
  trip_id,
  from_name,
  from_email,
  phone,
  message,
}) => {
  if (!supabaseAdmin) {
    console.warn(
      "[inquiries] Supabase not configured — set VITE_SUPABASE_URL or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or server/.env. Email is still sent; the row is not saved.",
    );
    return;
  }

  const { error } = await supabaseAdmin.from("inquiries").insert({
    trip_id: trip_id ?? null,
    name: from_name.trim(),
    email: from_email.trim().toLowerCase(),
    phone: phone?.trim() ? phone.trim() : null,
    message: message.trim(),
  });

  if (error) {
    console.error("[inquiries] Supabase insert failed:", error);
    throw new Error("Could not save your inquiry. Please try again.");
  }
};

/**
 * Atomic upsert + increment for analytics_events (see increment_trip_analytics in Supabase).
 * @param {{ trip_id: string, trip_name: string | null, trip_image: string | null, kind: 'click' | 'inquiry' }} params
 */
const incrementTripAnalytics = async ({
  trip_id,
  trip_name,
  trip_image,
  kind,
}) => {
  if (!supabaseAdmin) {
    return { error: new Error("Supabase admin client not configured") };
  }
  const name =
    trip_name && String(trip_name).trim() ? String(trip_name).trim() : null;
  const image =
    trip_image && String(trip_image).trim() ? String(trip_image).trim() : null;
  const { error } = await supabaseAdmin.rpc("increment_trip_analytics", {
    p_trip_id: trip_id,
    p_trip_name: name,
    p_trip_image: image,
    p_kind: kind,
  });
  return { error };
};

const mailLogoUrl = process.env.MAIL_LOGO_URL || "";
const localLogoPath = path.resolve(
  __dirname,
  "../public/branding/navbar/logo-dark.svg",
);
const hasLocalLogo = fs.existsSync(localLogoPath);

const hasMissingConfig = Object.values(required).some((value) => !value);

const transporter = !hasMissingConfig
  ? nodemailer.createTransport({
      host: required.host,
      port: Number(required.port),
      secure: Number(required.port) === 465,
      auth: {
        user: required.user,
        pass: required.pass,
      },
    })
  : null;

app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ ok: true, inquiries_db: inquiriesDbEnabled });
});

app.get("/api/seasonal-nav", seasonalNavLimiter, async (_req, res) => {
  if (!supabaseAdmin) {
    res.json({ items: [] });
    return;
  }
  try {
    const { data: configs, error: cErr } = await supabaseAdmin
      .from("seasonal_configs")
      .select("seasonal_key, nav_label_el, nav_label_en, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("seasonal_key", { ascending: true });
    if (cErr) {
      if (cErr.code === "42P01" || cErr.message?.includes("does not exist")) {
        res.json({ items: [] });
        return;
      }
      throw cErr;
    }
    const items = (configs ?? []).map((row) => ({
      key: row.seasonal_key,
      label_el: row.nav_label_el,
      label_en: row.nav_label_en,
    }));
    res.json({ items });
  } catch (err) {
    console.error("[seasonal-nav]", err);
    res.json({ items: [] });
  }
});

app.post("/api/track-click", trackClickLimiter, async (req, res) => {
  const parsed = trackClickSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    if (!firstIssue) {
      res.status(400).json({ error: "Invalid track-click payload." });
      return;
    }
    const field = firstIssue.path.join(".") || "payload";
    res.status(400).json({ error: `Invalid ${field}: ${firstIssue.message}` });
    return;
  }

  if (!supabaseAdmin) {
    res.status(503).json({
      error:
        "Analytics is not configured. Set VITE_SUPABASE_URL or SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
    return;
  }

  const { trip_id, name, image } = parsed.data;
  const { error } = await incrementTripAnalytics({
    trip_id,
    trip_name: name || null,
    trip_image: image || null,
    kind: "click",
  });

  if (error) {
    console.error("[analytics] track-click RPC failed:", error);
    res.status(500).json({ error: "Could not record analytics." });
    return;
  }

  res.status(204).end();
});

app.post(inquiryRoutes, async (req, res) => {
  if (hasMissingConfig || !transporter) {
    res.status(500).json({
      error:
        "Mail server configuration is missing. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS and MAIL_TO in server/.env",
    });
    return;
  }

  if (requireCaptcha && !hasCaptchaProviderConfigured) {
    res.status(500).json({
      error:
        "CAPTCHA is not configured. Set TURNSTILE_SECRET_KEY or RECAPTCHA_SECRET_KEY.",
    });
    return;
  }

  const parsed = inquirySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    if (!firstIssue) {
      res.status(400).json({ error: "Invalid inquiry payload." });
      return;
    }

    const field = firstIssue.path.join(".") || "payload";
    res.status(400).json({ error: `Invalid ${field}: ${firstIssue.message}` });
    return;
  }

  const {
    from_name,
    from_email,
    phone,
    message,
    source,
    trip_id,
    trip_title,
    trip_location,
    trip_price,
    trip_url,
    trip_image,
    submitted_at,
    captcha_token,
    first_name,
    last_name,
    language,
    locale,
  } = parsed.data;

  const languageRaw = language ?? locale;
  const normalizedLang = normalizeInquiryLanguage(languageRaw);
  const { firstName, lastName } = resolveDisplayNames({
    from_name,
    first_name,
    last_name,
  });

  if (requireCaptcha) {
    const captchaValid = await verifyCaptcha(captcha_token, req.ip);
    if (!captchaValid) {
      res.status(400).json({ error: "CAPTCHA verification failed." });
      return;
    }
  }

  const effectiveTripId = source === "trip-detail" ? (trip_id ?? null) : null;

  if (source === "trip-detail" && !effectiveTripId) {
    res.status(400).json({
      error: "Trip reference is required for trip inquiries.",
    });
    return;
  }

  try {
    await persistInquiry({
      trip_id: effectiveTripId,
      from_name,
      from_email,
      phone,
      message,
    });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Could not save inquiry.";
    res.status(500).json({ error: messageText });
    return;
  }

  const isTripInquiry = source === "trip-detail";
  const safeName = escapeHtml(from_name.trim());
  const safeEmail = escapeHtml(from_email.trim());
  const safePhone = escapeHtml(phone.trim()) || "-";
  const safeMessage = escapeHtml(message.trim());
  const safeTripTitle = escapeHtml(trip_title.trim()) || "Χωρίς τίτλο";
  const safeTripLocation = escapeHtml(trip_location.trim()) || "-";
  const safeTripPrice = escapeHtml(trip_price.trim()) || "-";
  const safeTripUrl = isSafeHttpUrl(trip_url.trim()) ? trip_url.trim() : "";

  const subject = isTripInquiry
    ? `Ερώτηση Ταξιδιού '${safeTripTitle}'`
    : "Γενική Ερώτηση";

  const submittedDate = submitted_at ? new Date(submitted_at) : new Date();
  const formattedSubmittedAt = new Intl.DateTimeFormat("el-GR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Athens",
  }).format(submittedDate);

  const tripSectionText = isTripInquiry
    ? [
        `Τίτλος Ταξιδιού: ${safeTripTitle}`,
        `Προορισμός: ${safeTripLocation}`,
        `Τιμή: ${safeTripPrice}`,
        `Σύνδεσμος Ταξιδιού: ${safeTripUrl || "-"}`,
      ]
    : [];

  const textBody = [
    `Θέμα: ${subject}`,
    `Ονοματεπώνυμο: ${safeName}`,
    `Email: ${safeEmail}`,
    `Τηλέφωνο: ${safePhone}`,
    `Μήνυμα: ${safeMessage}`,
    ...tripSectionText,
    `Υποβλήθηκε: ${formattedSubmittedAt}`,
  ].join("\n");

  const tripSectionHtml = isTripInquiry
    ? `
      <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
        <h3 style="margin:0 0 12px 0;font-size:16px;color:#0f172a;">Στοιχεία Ταξιδιού</h3>
        <p style="margin:6px 0;color:#1e293b;"><strong>Τίτλος:</strong> ${safeTripTitle}</p>
        <p style="margin:6px 0;color:#1e293b;"><strong>Προορισμός:</strong> ${safeTripLocation}</p>
        <p style="margin:6px 0;color:#1e293b;"><strong>Τιμή:</strong> ${safeTripPrice}</p>
        ${
          safeTripUrl
            ? `<p style="margin:10px 0 0 0;"><a href="${safeTripUrl}" style="color:#1d4ed8;text-decoration:none;font-weight:600;">Δείτε το ταξίδι</a></p>`
            : ""
        }
      </div>
    `
    : "";

  const htmlBody = `
    <div style="margin:0;padding:24px;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <div style="padding:20px 24px;background:#0f172a;color:#ffffff;">
          ${
            mailLogoUrl
              ? `<img src="${mailLogoUrl}" alt="Valitsa Travel" style="height:32px;display:block;margin-bottom:12px;" />`
              : hasLocalLogo
                ? '<img src="cid:valitsa-logo" alt="Valitsa Travel" style="height:32px;display:block;margin-bottom:12px;" />'
                : ""
          }
          <h2 style="margin:0;font-size:22px;line-height:1.3;">${subject}</h2>
        </div>

        <div style="padding:24px;">
          <div style="padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <p style="margin:6px 0;color:#1e293b;"><strong>Ονοματεπώνυμο:</strong> ${safeName}</p>
            <p style="margin:6px 0;color:#1e293b;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin:6px 0;color:#1e293b;"><strong>Τηλέφωνο:</strong> ${safePhone}</p>
          </div>

          <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <h3 style="margin:0 0 12px 0;font-size:16px;color:#0f172a;">Μήνυμα</h3>
            <p style="margin:0;color:#1e293b;line-height:1.6;white-space:pre-line;">${safeMessage}</p>
          </div>

          ${tripSectionHtml}

          <p style="margin:20px 0 0 0;color:#64748b;font-size:13px;">Υποβλήθηκε: ${formattedSubmittedAt}</p>
        </div>
      </div>
    </div>
  `;

  const staffMailOptions = {
    from: `Valitsa Travel <${mailFrom}>`,
    to: required.to,
    ...(mailCc ? { cc: mailCc } : {}),
    replyTo: `${sanitizeHeader(from_name)} <${sanitizeHeader(from_email)}>`,
    ...(!mailLogoUrl && hasLocalLogo
      ? {
          attachments: [
            {
              filename: "logo-dark.svg",
              path: localLogoPath,
              cid: "valitsa-logo",
              contentType: "image/svg+xml",
            },
          ],
        }
      : {}),
  };

  const staffToList = [
    required.to,
    ...mailCc
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean),
  ];

  let staffMailSent = false;
  let staffResult = null;

  try {
    staffResult = await transporter.sendMail({
      ...staffMailOptions,
      ...smtpEnvelopeFromAuth(staffToList),
      subject,
      text: textBody,
      html: htmlBody,
    });
    staffMailSent = true;
    console.log("Inquiry email accepted by SMTP", {
      to: required.to,
      cc: mailCc || null,
      messageId: staffResult.messageId,
      accepted: staffResult.accepted,
      rejected: staffResult.rejected,
      response: staffResult.response,
    });
  } catch (error) {
    console.error("[inquiry] staff mail failed:", error);
  }

  const confirmTo = from_email.trim();
  let confirmationSent = false;
  let confirmationResult = null;
  try {
    confirmationResult = await transporter.sendMail({
      from: `Valitsa Travel <${mailFrom}>`,
      replyTo: `Valitsa Travel <${mailFrom}>`,
      to: confirmTo,
      ...smtpEnvelopeFromAuth([confirmTo]),
      subject: confirmationSubject(normalizedLang),
      text: confirmationTextBody(firstName, lastName, normalizedLang),
      html: generateEmailTemplate(firstName, lastName, normalizedLang),
    });
    confirmationSent = true;
    console.log("[inquiry] confirmation mail sent", {
      to: confirmTo,
      messageId: confirmationResult.messageId,
      accepted: confirmationResult.accepted,
      rejected: confirmationResult.rejected,
      smtpEnvelopeFromAuth: useSmtpEnvelopeFromAuth,
    });
  } catch (error) {
    console.error("[inquiry] confirmation mail failed:", {
      to: confirmTo,
      smtpEnvelopeFromAuth: useSmtpEnvelopeFromAuth,
      error,
    });
  }

  if (effectiveTripId) {
    const inquiryImage =
      trip_image && String(trip_image).trim()
        ? String(trip_image).trim()
        : null;
    const { error: analyticsError } = await incrementTripAnalytics({
      trip_id: effectiveTripId,
      trip_name: trip_title.trim() || null,
      trip_image: inquiryImage,
      kind: "inquiry",
    });
    if (analyticsError) {
      console.error("[analytics] inquiry increment failed:", analyticsError);
    }
  }

  res.json({
    ok: true,
    staffMailSent,
    confirmationSent,
    confirmationTo: confirmTo,
    to: required.to,
    cc: mailCc || null,
    ...(staffResult
      ? {
          messageId: staffResult.messageId,
          accepted: staffResult.accepted,
          rejected: staffResult.rejected,
          response: staffResult.response,
        }
      : {}),
    ...(confirmationResult
      ? { confirmationMessageId: confirmationResult.messageId }
      : {}),
  });
});

registerAdminRoutes(app, { supabaseAdmin });

// Serve Vite build when dist exists (not gated on NODE_ENV — many hosts omit NODE_ENV=production).
const distDir = path.join(__dirname, "../dist");
const indexHtml = path.join(distDir, "index.html");
const immutableAssetPattern =
  /^assets\/.+-[A-Za-z0-9_-]{8,}\.(?:css|js|mjs|png|jpe?g|gif|svg|webp|avif|ico|woff2?|ttf|eot)$/i;
const setIndexHtmlHeaders = (res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
};
const isApiRequestPath = (requestPath) =>
  requestPath === "/api" || requestPath.startsWith("/api/");

const OG_IMAGE_FALLBACK = "https://valitsatravel.gr/hero/hero.webp";

app.get("/og/trip/:tripId", async (req, res) => {
  const tripId = String(req.params.tripId || "").replace(/\.jpg$/i, "");
  if (!isValidTripId(tripId)) {
    res.redirect(302, OG_IMAGE_FALLBACK);
    return;
  }
  try {
    const target = await resolveTripOgImageRedirect(tripId, supabaseAdmin);
    const upstream = await fetch(target, {
      headers: { "User-Agent": "ValitsaTravel-OG-Proxy/1.0" },
      redirect: "follow",
    });
    if (!upstream.ok) {
      console.warn("[trip-og] upstream image", upstream.status, target);
      res.redirect(302, OG_IMAGE_FALLBACK);
      return;
    }
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200).send(buffer);
  } catch (err) {
    console.warn("[trip-og] image proxy failed:", err?.message || err);
    res.redirect(302, OG_IMAGE_FALLBACK);
  }
});

if (fs.existsSync(indexHtml)) {
  app.use(
    express.static(distDir, {
      setHeaders(res, filePath) {
        const relativePath = path
          .relative(distDir, filePath)
          .split(path.sep)
          .join("/");

        if (relativePath === "index.html") {
          setIndexHtmlHeaders(res);
          return;
        }

        if (immutableAssetPattern.test(relativePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );
  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (isApiRequestPath(req.path)) {
      next();
      return;
    }

    setIndexHtmlHeaders(res);

    const queryTrip = typeof req.query.trip === "string" ? req.query.trip.trim() : "";
    const injectOg = shouldInjectTripOg({
      path: req.path,
      queryTrip,
      userAgent: req.get("user-agent") || "",
    });

    if (injectOg && queryTrip) {
      try {
        const ogHtml = await buildTripOgHtml({
          tripId: queryTrip,
          indexHtmlPath: indexHtml,
          readFileSync: fs.readFileSync,
          supabaseAdmin,
          lang: "gr",
        });
        if (ogHtml) {
          res.type("html").send(ogHtml);
          return;
        }
      } catch (err) {
        console.warn("[trip-og] failed to build OG HTML:", err?.message || err);
      }
    }

    res.sendFile(indexHtml);
  });
} else {
  console.warn(
    "[static] dist/index.html not found — run `npm run build` before deploy; SPA routes will 404.",
  );
}

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Mail API running on http://localhost:${port}`);
  console.log(
    inquiriesDbEnabled
      ? "[inquiries] Supabase persistence enabled (public.inquiries)."
      : "[inquiries] Supabase persistence OFF — inquiries are email-only until URL + service role key are set.",
  );
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "Production"
  ) {
    console.log(
      `[vite proxy] Use http://127.0.0.1:${port} as API target (Vite default: vite.config.ts).`,
    );
  }
});
