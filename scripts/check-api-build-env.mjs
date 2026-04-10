/**
 * Optional gate for Path 2 (static main site + API on another origin).
 * When CHECK_PRODUCTION_API=1, require VITE_API_BASE_URL in env before vite build.
 *
 * Usage:
 *   CHECK_PRODUCTION_API=1 npm run build
 *
 * Loads root .env / .env.production / .env.local (same order as Vite-style precedence is approximated).
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const flag = process.env.CHECK_PRODUCTION_API?.trim();
if (!flag || !/^1|true|yes$/i.test(flag)) {
  process.exit(0);
}

function loadEnv(name) {
  const p = path.join(root, name);
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
  }
}

loadEnv(".env");
loadEnv(".env.production");
loadEnv(".env.local");
loadEnv(".env.production.local");

const base =
  process.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, "") ||
  process.env.VITE_SEASONAL_ADMIN_API_ORIGIN?.trim().replace(/\/+$/, "") ||
  "";

if (!base) {
  console.error(
    "[check-api-build-env] CHECK_PRODUCTION_API is set but VITE_API_BASE_URL is empty.",
  );
  console.error(
    "Set VITE_API_BASE_URL (no trailing slash) to the origin where GET /api/health returns JSON,",
  );
  console.error(
    "e.g. VITE_API_BASE_URL=https://api.example.com — see HOSTING_PASSENGER.txt section 7.",
  );
  process.exit(1);
}

console.log(
  "[check-api-build-env] OK — VITE_API_BASE_URL will prefix /api calls:",
  base,
);
process.exit(0);
