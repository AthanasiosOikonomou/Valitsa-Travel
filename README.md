<div align="center">

# VALITSA TRAVEL

### A flagship product experience — part of my **PORTOFOLIO** lineage

**Live:** [valitsatravel.gr](https://valitsatravel.gr/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

</div>

---

> [!NOTE]
> **Architecture at a glance:** This repository is a **Vite 8 + React 18** single-page application with a **Node / Express 5** API — not Next.js. Routing is **React Router v6**; deployment targets **cPanel / Phusion Passenger** with rsync-based release automation.

---

## Executive summary

**Valitsa Travel** is a production luxury-travel discovery and inquiry platform: cinematic storytelling on the marketing surface, a data-rich **trips archive** with faceted filters and URL-driven presets, and a **conversion-oriented inquiry pipeline** (contact modal + trip-detail flows) backed by SMTP confirmation and abuse-resistant APIs.

The product is engineered to feel **smooth, fast, and high-touch** — motion that respects preference, imagery that loads intelligently, and a visual language built on **violet–cyan gradients** and precision elevation shadows — while remaining **auditable and operable** for a real business (SEO, structured data, admin tools, Supabase-backed staff workflows).

---

## Under the Hood — the engineering secret sauce

### Perceived performance (what users feel)

| Technique                  | Where it lives                                                                                                                        | What it does                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route-level code splitting | [`src/App.tsx`](src/App.tsx) — `React.lazy` for `Index`, `Trips`, admin pages                                                         | Keeps initial JS lean; heavy routes load on demand inside `Suspense`.                                                                                                            |
| Vendor chunk strategy      | [`vite.config.ts`](vite.config.ts) — `manualChunks` splits `react-vendor`, `motion-vendor`, `router-vendor`, `radix-vendor`, `vendor` | Improves cacheability and parallel download behavior.                                                                                                                            |
| Progressive imagery        | [`src/components/ProgressiveImage.tsx`](src/components/ProgressiveImage.tsx)                                                          | `IntersectionObserver` with `rootMargin: "400px"` kicks off loads before the user hits the fold; LQIP-style blur path; `fetchPriority` / `loading` tuned for hero vs below-fold. |
| CDN-aware URLs             | [`src/lib/utils.ts`](src/lib/utils.ts) — `optimizeImageUrl`, `buildResponsiveImageSet`                                                | Unsplash (and similar) URLs get width, format, and quality parameters for responsive `srcset`.                                                                                   |
| Scroll & route UX          | [`src/lib/instantScrollToTop.ts`](src/lib/instantScrollToTop.ts), [`src/App.tsx`](src/App.tsx) `ScrollToTop`                          | Instant scroll reset on navigation (`useLayoutEffect` + location key) — no “stuck scroll” between views.                                                                         |
| Motion system              | [`src/App.tsx`](src/App.tsx) — `MotionConfig` with `reducedMotion="user"`                                                             | Honors OS “reduce motion”; animations degrade gracefully.                                                                                                                        |

### Visual identity — neon-adjacent purple & electric cyan

Design tokens are centralized in CSS variables, not scattered magic numbers:

- **Primary (brand violet):** `--primary: 270 91% 65%` — aligned with Tailwind semantic `primary` in [`src/index.css`](src/index.css).
- **Accent (cool cyan):** `--accent: 199 89% 48%` — used for highlights and secondary emphasis.
- **Layered elevation:** `--shadow-elev-*` stacks combine edge rings + ambient + direct shadows for “floating glass” panels and CTAs.

Typography pairs **Plus Jakarta Sans** (UI) with **Playfair Display** (trip titles) — see [`src/index.css`](src/index.css) imports and `--font-trip-title`.

### Trust, content safety, and forms

| Concern                      | Implementation                                                                                                                                                                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rich HTML from CMS/editor    | [`src/lib/sanitizeTripRichTextHtml.ts`](src/lib/sanitizeTripRichTextHtml.ts) — **DOMPurify** with an explicit tag/attribute allowlist; rendered via [`src/components/SafeRichTextHtml.tsx`](src/components/SafeRichTextHtml.tsx).                                                |
| Bot resistance               | [`src/components/CaptchaField.tsx`](src/components/CaptchaField.tsx) — Cloudflare **Turnstile** (or reCAPTCHA) with responsive `size` (`compact` / `flexible`) for mobile layouts.                                                                                               |
| Theme & language persistence | [`src/lib/themeStorage.ts`](src/lib/themeStorage.ts), [`src/lib/languageStorage.ts`](src/lib/languageStorage.ts) — `valitsa-theme` / `valitsa-lang` in `localStorage`, aligned with [`next-themes`](https://github.com/pacocoursey/next-themes) in [`src/App.tsx`](src/App.tsx). |
| Modal ergonomics             | [`src/hooks/useScrollLock.ts`](src/hooks/useScrollLock.ts) — locks `html`/`body` overflow while overlays are open (`TripDetail`, `ContactModal`, `TermsModal`).                                                                                                                  |

### Backend hardening (Express)

From [`server/index.js`](server/index.js) and [`server/adminRoutes.js`](server/adminRoutes.js):

```text
Helmet (HSTS in prod, referrer policy, CORP) · CORS allow-list (production requires CORS_ORIGIN)
· express-rate-limit + express-slow-down on hot paths · Zod schemas for inquiry payloads
· CAPTCHA verification in production · multer + sharp for bounded admin uploads
· Supabase JWT + profiles.role === "admin" for protected /api/admin/* routes
```

`app.disable("x-powered-by")` and `trust proxy` are set explicitly for sane rate limiting behind reverse proxies.

### Infrastructure & delivery

| Artifact                                                                     | Role                                                                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [`.cpanel.yml`](.cpanel.yml)                                                 | Rsync deploy to managed hosting, `tmp/restart.txt` for Passenger bounce.                                      |
| [`passenger_entry.cjs`](passenger_entry.cjs)                                 | CommonJS bridge — dynamic `import()` of ESM [`server/index.js`](server/index.js) for Phusion Passenger.       |
| [`scripts/verify-passenger-deploy.mjs`](scripts/verify-passenger-deploy.mjs) | Invoked via `npm run verify:deploy` — post-deploy sanity checks.                                              |
| [`scripts/check-api-health.mjs`](scripts/check-api-health.mjs)               | `npm run verify:api-health` — GET `/api/health` must return JSON (fails if edge serves HTML only).            |
| [`HOSTING_PASSENGER.txt`](HOSTING_PASSENGER.txt)                             | Path A vs Path B when `/api` does not reach Node; post-deploy checklist.                                     |
| [`vite.config.ts`](vite.config.ts)                                           | Dev `/api` proxy to `API_PORT` (default `8787`); production build drops `console` / `debugger` via `esbuild`. |

---

## Scalability

- **Front / API split:** Static Vite build + stateless Express API — scale horizontally behind a load balancer without sticky sessions for public traffic.
- **Data layer:** Supabase client for trip content; TanStack Query in the app for cache-friendly async patterns.
- **Admin domain:** Isolated under `/admin/*` with role-checked server middleware — clear boundary for future SSO or stricter RBAC.

---

## Maintainability

- **TypeScript** end-to-end on the client; **Zod** at API boundaries for runtime truth.
- **Component architecture:** `src/components/` (UI + domain), `src/pages/` (routes), `src/lib/` (pure utilities), `src/admin/` (operations console).
- **Styling:** Tailwind + `cn()` ([`src/lib/utils.ts`](src/lib/utils.ts)) merges class names without conflicting utilities.
- **Content editing:** TipTap ([`@tiptap/*`](package.json)) in admin for structured trip copy — normalized server-side in admin routes.

---

## Accessibility & inclusive motion

- **Radix UI** primitives for dialogs, scroll areas, tooltips — focus management and keyboard semantics by default.
- **Framer Motion** gated by **`reducedMotion="user"`** globally ([`src/App.tsx`](src/App.tsx)).
- **Semantic HTML & SEO:** [`src/components/Seo.tsx`](src/components/Seo.tsx) (react-helmet-async) sets canonical, Open Graph, and JSON-LD; root document language is Greek-first ([`index.html`](index.html) `lang="el"`).

---

## Security checklist (evidence-based)

| Layer               | Mechanism                                                                        |
| ------------------- | -------------------------------------------------------------------------------- |
| Transport & headers | Helmet, HSTS when `NODE_ENV=production`, no `X-Powered-By`                       |
| Origin control      | Strict CORS in production — **throws** if `CORS_ORIGIN` is empty when production |
| Input validation    | Zod `inquirySchema` / `trackClickSchema` in [`server/index.js`](server/index.js) |
| Abuse control       | Dedicated limiters + slowdown middleware                                         |
| HTML injection      | DOMPurify allowlist for public rich text                                         |
| Admin surface       | Bearer JWT → Supabase `getUser` + `profiles.role` gate                           |

> [!IMPORTANT]
> **Secrets** live in environment variables only (see root `.env.example` and `server/.env.example`). Never commit credentials.

---

## cPanel Build Fix (Vite)

If cPanel shows `vite: command not found` during `npm run build`, it means dev dependencies were not installed.

Use these commands in cPanel terminal (inside the app directory):

```bash
npm ci --include=dev
npm run build
```

Equivalent helper command in this repo:

```bash
npm run build:cpanel
```

Notes:
- Do not force `NODE_ENV=production` for the install/build step.
- If your host supports separate build and runtime phases, you can prune after build:

```bash
npm prune --omit=dev
```

## Scripts

| Command                 | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`           | Concurrent Vite (`localhost:5180`) + Express API (`API_PORT`, default `8787`) |
| `npm run build`         | Optimized client bundle                                                       |
| `npm run start:api`     | Production API process                                                        |
| `npm run verify:deploy` | Passenger deploy verification                                                 |
| `npm run verify:api-health` | Smoke-test `GET /api/health` on production (see `API_HEALTH_URL`)      |
| `npm test`              | Vitest                                                                        |

---

## Let’s connect

This build is a deliberate **portfolio-grade** artifact: opinionated UX, disciplined security, and infrastructure you can explain in a boardroom.

| Channel      | Link                                                        |
| ------------ | ----------------------------------------------------------- |
| **LinkedIn** | [Athanasios Oikonomou](https://www.linkedin.com/in/ath-oik) |
| **Email**    | `ath.oikonomou@hotmail.com`                                 |

---

## License

See [LICENSE](LICENSE) in this repository.

---

<p align="center"><sub>Built with intent. Shipped with care. <strong>VALITSA TRAVEL</strong> — premium travel, engineered.</sub></p>
