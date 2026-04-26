import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("`", "&#96;");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Same token as `dist/branding/asset-version.txt` after `vite build` (cache-bust). */
function readBrandAssetVersion() {
  try {
    const p = path.join(__dirname, "../dist/branding/asset-version.txt");
    return fs.readFileSync(p, "utf8").trim();
  } catch {
    return "";
  }
}

const CONFIRMATION_LOGO_BASE =
  "https://valitsatravel.gr/branding/navbar/logo-light.svg";
const brandV = readBrandAssetVersion();
const CONFIRMATION_LOGO_URL =
  brandV !== ""
    ? `${CONFIRMATION_LOGO_BASE}?v=${encodeURIComponent(brandV)}`
    : CONFIRMATION_LOGO_BASE;

export function buildConfirmationLogoUrl() {
  return CONFIRMATION_LOGO_URL;
}

/** @param {unknown} raw */
export function normalizeInquiryLanguage(raw) {
  if (raw === "en") return "en";
  if (raw === "el" || raw === "gr") return "gr";
  return "gr";
}

/**
 * @param {{ from_name: string, first_name?: string, last_name?: string }} p
 * @returns {{ firstName: string, lastName: string }}
 */
export function resolveDisplayNames(p) {
  const fn = (p.first_name && String(p.first_name).trim()) || "";
  const ln = (p.last_name && String(p.last_name).trim()) || "";
  if (fn || ln) {
    return { firstName: fn || ln, lastName: ln };
  }
  const parts = String(p.from_name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * @param {string} firstName
 * @param {string} lastName
 * @param {"en" | "gr"} language
 */
export function generateEmailTemplate(firstName, lastName, language) {
  const safeFirst = escapeHtml(firstName);
  const safeLast = escapeHtml(lastName);
  const logoUrl = buildConfirmationLogoUrl();
  const logoBlock = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="Valitsa Travel Logo" style="max-height: 50px;" />`
    : "";

  if (language === "en") {
    return `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
  <div style="text-align: left; margin-bottom: 20px;">
    ${logoBlock}
  </div>
  <h2 style="color: #2c3e50;">Hello ${safeFirst} ${safeLast},</h2>
  <p style="font-size: 16px; line-height: 1.5;">
    We have received your message and someone from our team will contact you in the next 24 hours.
  </p>
  <p style="font-size: 16px; line-height: 1.5;">
    Thank you for choosing us for your next adventure!
  </p>
  <br/>
  <p style="font-size: 14px; color: #7f8c8d; margin-top: 20px;">
    Kind regards,<br/>
    <strong>Valitsa Travel Team</strong><br/>
    <a href="https://valitsatravel.gr" style="color: #3498db; text-decoration: none;">valitsatravel.gr</a>
  </p>
</div>`;
  }

  return `<div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
  <div style="text-align: left; margin-bottom: 20px;">
    ${logoBlock}
  </div>
  <h2 style="color: #2c3e50;">Γεια σας ${safeFirst} ${safeLast},</h2>
  <p style="font-size: 16px; line-height: 1.5;">
    Λάβαμε το μήνυμά σας και κάποιος από την ομάδα μας θα επικοινωνήσει μαζί σας εντός 24 ωρών.
  </p>
  <p style="font-size: 16px; line-height: 1.5;">
    Σας ευχαριστούμε που μας επιλέξατε για την επόμενη περιπέτειά σας!
  </p>
  <br/>
  <p style="font-size: 14px; color: #7f8c8d; margin-top: 20px;">
    Με εκτίμηση,<br/>
    <strong>Η ομάδα του Valitsa Travel</strong><br/>
    <a href="https://valitsatravel.gr" style="color: #3498db; text-decoration: none;">valitsatravel.gr</a>
  </p>
</div>`;
}

/** @param {"en" | "gr"} language */
export function confirmationSubject(language) {
  return language === "en"
    ? "We received your message — Valitsa Travel"
    : "Λάβαμε το μήνυμά σας — Valitsa Travel";
}

/**
 * @param {string} firstName
 * @param {string} lastName
 * @param {"en" | "gr"} language
 */
export function confirmationTextBody(firstName, lastName, language) {
  const name = `${firstName} ${lastName}`.trim();
  if (language === "en") {
    return [
      `Hello ${name},`,
      "",
      "We have received your message and someone from our team will contact you in the next 24 hours.",
      "",
      "Thank you for choosing us for your next adventure!",
      "",
      "Kind regards,",
      "Valitsa Travel Team",
      "https://valitsatravel.gr",
    ].join("\n");
  }
  return [
    `Γεια σας ${name},`,
    "",
    "Λάβαμε το μήνυμά σας και κάποιος από την ομάδα μας θα επικοινωνήσει μαζί σας εντός 24 ωρών.",
    "",
    "Σας ευχαριστούμε που μας επιλέξατε για την επόμενη περιπέτειά σας!",
    "",
    "Με εκτίμηση,",
    "Η ομάδα του Valitsa Travel",
    "https://valitsatravel.gr",
  ].join("\n");
}
