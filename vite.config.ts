import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const prod = mode === "production";
  return {
  // Production: esbuild minify + drop (Vite 8 defaults to Oxc minify, which ignores esbuild.drop).
  esbuild: prod ? { drop: ["console", "debugger"] } : {},
  server: {
    host: "localhost",
    port: 5180,
    strictPort: false,
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "localhost",
    port: 5180,
    strictPort: false,
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
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});

