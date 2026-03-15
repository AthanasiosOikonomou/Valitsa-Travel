import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";

dotenv.config({ path: "server/.env" });

const app = express();
const port = Number(process.env.API_PORT || 8787);

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
        "Mail server configuration is missing. Set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_TO, and MAIL_CC in server/.env",
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
    submitted_at,
  } = req.body ?? {};

  if (!from_name || !from_email || !message || !source) {
    res.status(400).json({ error: "Missing required inquiry fields." });
    return;
  }

  const sourceLabel =
    source === "trip-detail" ? "Trip Detail Inquiry" : "Contact Modal Inquiry";

  const subject = `[Valitsa] ${sourceLabel} - ${from_name}`;

  const textBody = [
    `Source: ${source}`,
    `Name: ${from_name}`,
    `Email: ${from_email}`,
    `Phone: ${phone || "-"}`,
    `Message: ${message}`,
    `Trip: ${trip_title || "-"}`,
    `Location: ${trip_location || "-"}`,
    `Price: ${trip_price || "-"}`,
    `Submitted At: ${submitted_at || new Date().toISOString()}`,
  ].join("\n");

  const htmlBody = `
    <h2>${sourceLabel}</h2>
    <p><strong>Source:</strong> ${source}</p>
    <p><strong>Name:</strong> ${from_name}</p>
    <p><strong>Email:</strong> ${from_email}</p>
    <p><strong>Phone:</strong> ${phone || "-"}</p>
    <p><strong>Message:</strong><br/>${String(message).replace(/\n/g, "<br/>")}</p>
    <hr/>
    <p><strong>Trip:</strong> ${trip_title || "-"}</p>
    <p><strong>Location:</strong> ${trip_location || "-"}</p>
    <p><strong>Price:</strong> ${trip_price || "-"}</p>
    <p><strong>Submitted At:</strong> ${submitted_at || new Date().toISOString()}</p>
  `;

  try {
    const mailOptions = {
      from: `Valitsa Travel <${required.user}>`,
      to: required.to,
      ...(mailCc ? { cc: mailCc } : {}),
      replyTo: `${from_name} <${from_email}>`,
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
