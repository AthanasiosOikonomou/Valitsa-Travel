/**
 * Smoke-test that GET /api/health returns JSON { ok: true } from a deployed host.
 * Use after deploy (Passenger restart) — fails fast if nginx serves static HTML instead of Express.
 *
 * Usage:
 *   npm run verify:api-health
 *   node scripts/check-api-health.mjs https://valitsatravel.gr
 *   API_HEALTH_URL=https://example.com node scripts/check-api-health.mjs
 */
import { request } from "https";
import { request as httpRequest } from "http";

const defaultUrl =
  process.env.API_HEALTH_URL?.trim() || "https://valitsatravel.gr";
const baseArg = process.argv[2]?.trim();
const base = (baseArg || defaultUrl).replace(/\/+$/, "");
const url = `${base}/api/health`;

function fetchText(targetUrl) {
  return new Promise((resolve, reject) => {
    const u = new URL(targetUrl);
    const lib = u.protocol === "https:" ? request : httpRequest;
    const req = lib(
      u,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
            ct: res.headers["content-type"] ?? "",
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

try {
  const { status, body, ct } = await fetchText(url);
  const trimmed = body.trimStart();
  const looksLikeHtml =
    ct.includes("text/html") ||
    trimmed.toLowerCase().startsWith("<!doctype") ||
    trimmed.toLowerCase().startsWith("<html");

  if (looksLikeHtml || status === 404) {
    console.error(
      `FAIL: ${url} → HTTP ${status}, content-type=${ct || "(none)"}`,
    );
    console.error(
      "Expected JSON {\"ok\":true,...}. Got HTML or 404 — /api is not reaching Express on this host.",
    );
    console.error(
      "Fix: align Passenger/nginx so /api hits Node (see HOSTING_PASSENGER.txt), or set VITE_API_BASE_URL + rebuild.",
    );
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(body);
  } catch {
    console.error(`FAIL: ${url} → not valid JSON`);
    console.error(body.slice(0, 200));
    process.exit(1);
  }

  if (data && data.ok === true) {
    console.log(`OK: ${url} → HTTP ${status} {"ok":true}`);
    process.exit(0);
  }

  console.error(`FAIL: ${url} → JSON missing ok:true`, data);
  process.exit(1);
} catch (err) {
  console.error("FAIL: request error", err?.message || err);
  process.exit(1);
}
