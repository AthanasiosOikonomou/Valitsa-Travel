import fs from "node:fs";
import path from "path";
import dotenv from "dotenv";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Match server/index.js port resolution (PORT || API_PORT || 8787) so /api proxy hits the same process.
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "server/.env") });

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const prod = mode === "production";
  const rawBrandVersion =
    process.env.VITE_BRAND_ASSET_VERSION?.trim() || String(Date.now());
  const brandVersion = prod ? rawBrandVersion : "dev";

  const apiListenPort =
    process.env.PORT || process.env.API_PORT || "8787";
  const apiDevTarget =
    process.env.VITE_API_PROXY_TARGET ??
    `http://127.0.0.1:${apiListenPort}`;

  const logApiProxyPlugin = {
    name: "valitsa-log-api-proxy",
    configureServer() {
      if (!prod) {
        console.log(`[vite] /api proxy -> ${apiDevTarget}`);
      }
    },
  };

  const brandAssetVersionPlugin = {
    name: "valitsa-brand-asset-version",
    closeBundle() {
      if (!prod) return;
      const distDir = path.join(__dirname, "dist");
      const brandingDir = path.join(distDir, "branding");
      try {
        fs.mkdirSync(brandingDir, { recursive: true });
        fs.writeFileSync(
          path.join(brandingDir, "asset-version.txt"),
          `${brandVersion}\n`,
          "utf8",
        );
      } catch {
        return;
      }

      const manifestPath = path.join(distDir, "manifest.json");
      if (!fs.existsSync(manifestPath)) return;
      try {
        const raw = fs.readFileSync(manifestPath, "utf8");
        const j = JSON.parse(raw);
        const q = `?v=${encodeURIComponent(brandVersion)}`;
        const patch = (src: string | undefined) => {
          if (typeof src !== "string" || !src.startsWith("/branding/")) return src;
          if (src.includes("?v=")) return src;
          return `${src}${q}`;
        };
        const icons = Array.isArray(j?.icons) ? j.icons : [];
        for (const icon of icons) {
          if (icon?.src) icon.src = patch(icon.src) ?? icon.src;
        }
        const screenshots = Array.isArray(j?.screenshots) ? j.screenshots : [];
        for (const sc of screenshots) {
          if (sc?.src) sc.src = patch(sc.src) ?? sc.src;
        }
        const shortcuts = Array.isArray(j?.shortcuts) ? j.shortcuts : [];
        for (const sh of shortcuts) {
          const shIcons = Array.isArray(sh?.icons) ? sh.icons : [];
          for (const ic of shIcons) {
            if (ic?.src) ic.src = patch(ic.src) ?? ic.src;
          }
        }
        fs.writeFileSync(manifestPath, `${JSON.stringify(j, null, 2)}\n`, "utf8");
      } catch {
        /* ignore */
      }
    },
  };

  return {
  define: {
    "import.meta.env.VITE_BRAND_ASSET_VERSION": JSON.stringify(brandVersion),
  },
  // Production: esbuild minify + drop (Vite 8 defaults to Oxc minify, which ignores esbuild.drop).
  esbuild: prod ? { drop: ["console", "debugger"] } : {},
  server: {
    host: "localhost",
    port: 5180,
    strictPort: false,
    // Forward /api to Express (same port as server: PORT || API_PORT || 8787) so fetch('/api/...') works in dev.
    proxy: {
      "/api": {
        target: apiDevTarget,
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "localhost",
    port: 5180,
    strictPort: false,
    proxy: {
      "/api": {
        target: apiDevTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: prod ? "esbuild" : "oxc",
    target: "es2020",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("react") || id.includes("scheduler")) {
            return "react-vendor";
          }

          if (id.includes("react-router")) {
            return "router-vendor";
          }

          if (id.includes("framer-motion")) {
            return "motion-vendor";
          }

          if (id.includes("@radix-ui")) {
            return "radix-vendor";
          }

          return "vendor";
        },
      },
    },
  },
  plugins: [react(), logApiProxyPlugin, brandAssetVersionPlugin],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});

