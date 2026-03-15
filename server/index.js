import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "server/.env" });

const app = express();
const port = Number(process.env.API_PORT || 8787);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultCorsOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://localhost:5173",
];
const corsOrigins = (process.env.CORS_ORIGIN || defaultCorsOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/send-inquiry", async (req, res) => {
  if (hasMissingConfig || !transporter) {
    res.status(500).json({
      error:
        "Mail server configuration is missing. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS and MAIL_TO in server/.env",
    });
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
  } = req.body ?? {};

  if (!from_name || !from_email || !message || !source) {
    res.status(400).json({ error: "Missing required inquiry fields." });
    return;
  }

  const isTripInquiry = source === "trip-detail";
  const safeTripTitle = (trip_title || "").trim() || "Χωρίς τίτλο";
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
        `Προορισμός: ${trip_location || "-"}`,
        `Τιμή: ${trip_price || "-"}`,
        `Σύνδεσμος Ταξιδιού: ${trip_url || "-"}`,
      ]
    : [];

  const textBody = [
    `Θέμα: ${subject}`,
    `Ονοματεπώνυμο: ${from_name}`,
    `Email: ${from_email}`,
    `Τηλέφωνο: ${phone || "-"}`,
    `Μήνυμα: ${message}`,
    ...tripSectionText,
    `Υποβλήθηκε: ${formattedSubmittedAt}`,
  ].join("\n");

  const tripSectionHtml = isTripInquiry
    ? `
      <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
        <h3 style="margin:0 0 12px 0;font-size:16px;color:#0f172a;">Στοιχεία Ταξιδιού</h3>
        <p style="margin:6px 0;color:#1e293b;"><strong>Τίτλος:</strong> ${safeTripTitle}</p>
        <p style="margin:6px 0;color:#1e293b;"><strong>Προορισμός:</strong> ${trip_location || "-"}</p>
        <p style="margin:6px 0;color:#1e293b;"><strong>Τιμή:</strong> ${trip_price || "-"}</p>
        ${
          trip_url
            ? `<p style="margin:10px 0 0 0;"><a href="${trip_url}" style="color:#1d4ed8;text-decoration:none;font-weight:600;">Δείτε το ταξίδι</a></p>`
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
            <p style="margin:6px 0;color:#1e293b;"><strong>Ονοματεπώνυμο:</strong> ${from_name}</p>
            <p style="margin:6px 0;color:#1e293b;"><strong>Email:</strong> ${from_email}</p>
            <p style="margin:6px 0;color:#1e293b;"><strong>Τηλέφωνο:</strong> ${phone || "-"}</p>
          </div>

          <div style="margin-top:20px;padding:16px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
            <h3 style="margin:0 0 12px 0;font-size:16px;color:#0f172a;">Μήνυμα</h3>
            <p style="margin:0;color:#1e293b;line-height:1.6;white-space:pre-line;">${String(message)}</p>
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
      replyTo: `${from_name} <${from_email}>`,
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
