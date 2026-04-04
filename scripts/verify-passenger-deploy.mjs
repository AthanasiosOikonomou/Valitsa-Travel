/**
 * Run before/after deploy: confirms Passenger-related files exist at repo root.
 * Does not connect to production; compare printed git revision on server with local.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const required = [
  ["passenger_entry.cjs", "CommonJS shim (Passenger require() entry)"],
  ["package.json", "Root package (must include type: module)"],
  ["Passengerfile.json", "Passenger Standalone startup_file hint"],
];

let ok = true;
for (const [rel, label] of required) {
  const abs = path.join(root, rel);
  const exists = fs.existsSync(abs);
  console.log(exists ? "OK" : "MISSING", rel, `— ${label}`);
  if (!exists) ok = false;
}

const pkgPath = path.join(root, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg.type !== "module") {
    console.warn("WARN: package.json should have \"type\": \"module\" for server ESM.");
  }
}

try {
  const rev = execSync("git rev-parse --short HEAD", {
    cwd: root,
    encoding: "utf8",
  }).trim();
  console.log("Git revision (compare with server):", rev);
} catch {
  console.log("Git revision: (not a git checkout or git unavailable)");
}

process.exit(ok ? 0 : 1);
