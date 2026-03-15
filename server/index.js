import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

dotenv.config({ path: "server/.env" });

const app = express();
const port = Number(process.env.API_PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";
const requireCaptcha = isProduction;

app.disable("x-powered-by");
app.set("trust proxy", 1);

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
];

const configuredOrigins = parseCorsOrigins(process.env.CORS_ORIGIN || "");
const corsOrigins = new Set(
  isProduction
    ? configuredOrigins
    : configuredOrigins.length > 0
      ? configuredOrigins
      : defaultCorsOrigins,
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

      const normalized = normalizeOrigin(origin);
      if (normalized && corsOrigins.has(normalized)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json({ limit: "20kb" }));
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
  message: z.string().trim().min(10).max(2000),
  source: z.enum(["contact-modal", "trip-detail"]),
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
  submitted_at: z.string().trim().datetime({ offset: true }).optional(),
  captcha_token: z.string().trim().max(4000).optional().default(""),
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
const mailLogoUrl = process.env.MAIL_LOGO_URL || "";
const localLogoPath = path.resolve(
  __dirname,
  "../public/branding/navbar/logo-light.svg",
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
  res.json({ ok: true });
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
    res
      .status(400)
      .json({ error: `Invalid ${field}: ${firstIssue.message}` });
    return;
  }

  const {
    from_name,
    from_email,
    phone,
    message,
    source,
    trip_title,
    trip_location,
    trip_price,
    trip_url,
    submitted_at,
    captcha_token,
  } = parsed.data;

  if (requireCaptcha) {
    const captchaValid = await verifyCaptcha(captcha_token, req.ip);
    if (!captchaValid) {
      res.status(400).json({ error: "CAPTCHA verification failed." });
      return;
    }
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

  try {
    const mailOptions = {
      from: `Valitsa Travel <${required.user}>`,
      to: required.to,
      ...(mailCc ? { cc: mailCc } : {}),
      replyTo: `${sanitizeHeader(from_name)} <${sanitizeHeader(from_email)}>`,
      ...(!mailLogoUrl && hasLocalLogo
        ? {
            attachments: [
              {
                filename: "logo-light.svg",
                path: localLogoPath,
                cid: "valitsa-logo",
              },
            ],
          }
        : {}),
    };

    const result = await transporter.sendMail({
      ...mailOptions,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log("Inquiry email accepted by SMTP", {
      to: required.to,
      cc: mailCc || null,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    });

    res.json({
      ok: true,
      to: required.to,
      cc: mailCc || null,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
      response: result.response,
    });
  } catch (error) {
    console.error("Failed to send inquiry email:", error);
    const message =
      error instanceof Error ? error.message : "Failed to send email";
    res.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`Mail API running on http://localhost:${port}`);
});
