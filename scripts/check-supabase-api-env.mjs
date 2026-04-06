/**
 * Verifies Supabase URL + service role are set for server/index.js (seasonal-nav, admin, inquiries).
 * Does not print secrets. Exit 0 = both present, 1 = missing.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config({ path: path.join(__dirname, "../server/.env") });

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const okUrl = Boolean(url);
const okKey = Boolean(key);

console.log(
  `[check-supabase-api-env] SUPABASE_URL: ${okUrl ? "set" : "MISSING (VITE_SUPABASE_URL or SUPABASE_URL)"}`,
);
console.log(
  `[check-supabase-api-env] SUPABASE_SERVICE_ROLE_KEY: ${okKey ? `set (${key.length} chars)` : "MISSING"}`,
);

if (!okUrl || !okKey) {
  console.error(
    "[check-supabase-api-env] Without both, GET /api/seasonal-nav returns { items: [] }.",
  );
  process.exit(1);
}

process.exit(0);
