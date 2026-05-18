const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SITE_ORIGIN = "https://valitsatravel.gr";
const OG_FALLBACK_IMAGE = `${SITE_ORIGIN}/hero/hero.webp`;

const CRAWLER_UA_RE =
  /facebookexternalhit|Facebot|meta-externalagent|WhatsApp|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|Pinterest|Googlebot|bingbot/i;

export function isSocialCrawlerUserAgent(userAgent) {
  return CRAWLER_UA_RE.test(String(userAgent || ""));
}

export function isValidTripId(id) {
  return UUID_RE.test(String(id || "").trim());
}

export function isSocialCrawler(userAgent) {
  return isSocialCrawlerUserAgent(userAgent);
}

function stripHtmlToText(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s|&nbsp;/gi, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pickLocalized(trip, field, lang) {
  if (lang === "gr") {
    const el = trip[`${field}_el`];
    if (el != null && String(el).trim()) return String(el).trim();
  }
  const base = trip[field];
  return base != null && String(base).trim() ? String(base).trim() : "";
}

export function resolveOgImage(image) {
  const raw = String(image || "").trim();
  if (!raw) return OG_FALLBACK_IMAGE;
  if (raw.startsWith("https://")) return raw;
  if (raw.startsWith("http://")) return `https://${raw.slice("http://".length)}`;
  return `${SITE_ORIGIN}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

/** Same-origin OG image URL — Facebook fetches this; server redirects to the trip photo. */
export function buildOgTripImageUrl(tripId) {
  return `${SITE_ORIGIN}/og/trip/${encodeURIComponent(String(tripId).trim())}.jpg`;
}

/** Prefer Supabase render URL (resize) for crawler compatibility. */
export function toFacebookFriendlyImageUrl(imageUrl) {
  const url = String(imageUrl || "").trim();
  if (!url) return OG_FALLBACK_IMAGE;

  const objectMatch = url.match(
    /^(https:\/\/[^/]+)\/storage\/v1\/object\/public\/(.+)$/i,
  );
  if (objectMatch) {
    const [, origin, objectPath] = objectMatch;
    return `${origin}/storage/v1/render/image/public/${objectPath}?width=1200&height=630&resize=cover&quality=85`;
  }

  return url;
}

/**
 * Resolve redirect target for GET /og/trip/:tripId(.jpg)
 * @param {import('@supabase/supabase-js').SupabaseClient | null} supabaseAdmin
 */
export async function resolveTripOgImageRedirect(tripId, supabaseAdmin) {
  if (!isValidTripId(tripId) || !supabaseAdmin) {
    return OG_FALLBACK_IMAGE;
  }

  const { data: trip, error } = await supabaseAdmin
    .from("trips")
    .select("image, status")
    .eq("id", tripId)
    .or("status.eq.active,status.is.null")
    .maybeSingle();

  if (error || !trip) {
    return OG_FALLBACK_IMAGE;
  }

  return toFacebookFriendlyImageUrl(resolveOgImage(trip.image));
}

/** Replace one meta tag (including multiline tags in index.html). */
function upsertMeta(html, key, content, { isName = false } = {}) {
  const attr = isName ? "name" : "property";
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  const needles = [`${attr}="${key}"`, `${attr}='${key}'`];

  let idx = 0;
  while (idx < html.length) {
    const metaStart = html.indexOf("<meta", idx);
    if (metaStart === -1) break;
    const metaEnd = html.indexOf(">", metaStart);
    if (metaEnd === -1) break;
    const chunk = html.slice(metaStart, metaEnd + 1);
    if (needles.some((needle) => chunk.includes(needle))) {
      return html.slice(0, metaStart) + tag + html.slice(metaEnd + 1);
    }
    idx = metaEnd + 1;
  }

  return html.replace("</head>", `  ${tag}\n</head>`);
}

function upsertLinkCanonical(html, href) {
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  let idx = 0;
  while (idx < html.length) {
    const start = html.indexOf("<link", idx);
    if (start === -1) break;
    const end = html.indexOf(">", start);
    if (end === -1) break;
    const chunk = html.slice(start, end + 1);
    if (/rel=["']canonical["']/i.test(chunk)) {
      return html.slice(0, start) + tag + html.slice(end + 1);
    }
    idx = end + 1;
  }
  return html.replace("</head>", `  ${tag}\n</head>`);
}

/**
 * @param {import('fs').readFileSync} readFileSync
 * @param {string} indexHtmlPath
 * @param {import('@supabase/supabase-js').SupabaseClient | null} supabaseAdmin
 */
export async function buildTripOgHtml({
  tripId,
  indexHtmlPath,
  readFileSync,
  supabaseAdmin,
  lang = "gr",
}) {
  if (!isValidTripId(tripId) || !supabaseAdmin) return null;

  const { data: trip, error } = await supabaseAdmin
    .from("trips")
    .select("id, title, title_el, description, description_el, image, status")
    .eq("id", tripId)
    .or("status.eq.active,status.is.null")
    .maybeSingle();

  if (error || !trip) return null;

  const title =
    pickLocalized(trip, "title", lang) ||
    pickLocalized(trip, "title", "en") ||
    "Valitsa Travel";
  const description =
    stripHtmlToText(pickLocalized(trip, "description", lang)).slice(0, 200) ||
    stripHtmlToText(pickLocalized(trip, "description", "en")).slice(0, 200) ||
    "Valitsa Travel — curated trips and premium travel experiences.";
  const hasTripImage = Boolean(String(trip.image || "").trim());
  const image = buildOgTripImageUrl(tripId);
  const imageWidth = hasTripImage ? "1200" : "1920";
  const imageHeight = hasTripImage ? "630" : "1152";
  const pageUrl = `${SITE_ORIGIN}/trips?trip=${encodeURIComponent(tripId)}`;
  const fullTitle = title.includes("Valitsa Travel")
    ? title
    : `${title} | Valitsa Travel`;

  let html = readFileSync(indexHtmlPath, "utf8");

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);

  html = upsertMeta(html, "description", description, { isName: true });
  html = upsertMeta(html, "og:site_name", "Valitsa Travel");
  html = upsertMeta(html, "og:title", fullTitle);
  html = upsertMeta(html, "og:description", description);
  html = upsertMeta(html, "og:type", "website");
  html = upsertMeta(html, "og:url", pageUrl);
  html = upsertMeta(html, "og:image", image);
  html = upsertMeta(html, "og:image:secure_url", image);
  html = upsertMeta(html, "og:image:alt", title);
  html = upsertMeta(html, "og:image:width", imageWidth);
  html = upsertMeta(html, "og:image:height", imageHeight);
  html = upsertMeta(html, "og:image:type", hasTripImage ? "image/jpeg" : "image/webp");
  html = upsertMeta(html, "twitter:card", "summary_large_image", { isName: true });
  html = upsertMeta(html, "twitter:title", fullTitle, { isName: true });
  html = upsertMeta(html, "twitter:description", description, { isName: true });
  html = upsertMeta(html, "twitter:image", image, { isName: true });
  html = upsertLinkCanonical(html, pageUrl);

  return html;
}

export function shouldInjectTripOg({ path, queryTrip, userAgent }) {
  if (!queryTrip || !isValidTripId(queryTrip)) return false;
  if (path === "/trips" || path.startsWith("/trips")) return true;
  return isSocialCrawler(userAgent);
}
