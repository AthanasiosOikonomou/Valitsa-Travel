import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import path from "path";

// Match server/index.js so API_PORT in server/.env is visible here (fixes /api proxy → wrong port → 404).
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "server/.env") });

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const prod = mode === "production";
  const apiDevTarget =
    process.env.VITE_API_PROXY_TARGET ??
    `http://127.0.0.1:${process.env.API_PORT ?? "8787"}`;

  const logApiProxyPlugin = {
    name: "valitsa-log-api-proxy",
    configureServer() {
      if (!prod) {
        console.log(`[vite] /api proxy -> ${apiDevTarget}`);
      }
    },
  };

  return {
  // Production: esbuild minify + drop (Vite 8 defaults to Oxc minify, which ignores esbuild.drop).
  esbuild: prod ? { drop: ["console", "debugger"] } : {},
  server: {
    host: "localhost",
    port: 5180,
    strictPort: false,
    // Forward /api to Express (npm run dev:api on API_PORT, default 8787) so fetch('/api/...') works in dev.
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
  plugins: [react(), logApiProxyPlugin],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});

