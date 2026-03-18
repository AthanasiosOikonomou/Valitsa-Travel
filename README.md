# Valitsa Travel Platform

> Premium travel discovery and inquiry platform engineered for conversion, trust, and operational reliability.

![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-API-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active_Development-16A34A)

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Architecture and Product Surfaces](#architecture-and-product-surfaces)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Engineering Excellence](#engineering-excellence)
  - [Security](#security)
  - [Performance](#performance)
  - [Scalability](#scalability)
- [Documentation](#documentation)
  - [API Endpoints](#api-endpoints)
  - [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Contribution](#contribution)
- [License](#license)

---

## The Problem

Luxury travel brands need digital experiences that do more than look beautiful. They must:

- Communicate trust and brand quality from the first interaction.
- Handle multilingual audiences and diverse device contexts.
- Convert discovery traffic into qualified inquiries without friction.
- Protect backend services from abuse while preserving a smooth user journey.

Traditional brochure-style sites often fail this balance: they are visually strong but operationally weak, or operationally safe but conversion-hostile.

## The Solution

Valitsa Travel is a full-stack, conversion-focused travel platform that combines:

- A fast, animated React front-end optimized for premium storytelling.
- Structured filtering and search ergonomics to reduce decision fatigue.
- A hardened Express inquiry API with validation, rate limits, and CAPTCHA verification.
- SEO and structured data layers that improve discoverability and social share quality.

The engineering intent is clear: deliver a premium experience that is measurable, maintainable, and secure in production.

---

## Architecture and Product Surfaces

### System Architecture (placeholder)

![Architecture Diagram Placeholder](docs/images/architecture-diagram-placeholder.png)

Suggested diagram scope:

- SPA routes and component boundaries.
- Inquiry API request flow.
- CAPTCHA verification path.
- SMTP delivery path.

### UI Screenshots (placeholders)

![Homepage UI Placeholder](docs/images/ui-home-placeholder.png)
![Trips Archive UI Placeholder](docs/images/ui-trips-placeholder.png)
![Trip Detail UI Placeholder](docs/images/ui-detail-placeholder.png)

---

## Tech Stack

### Frontend

- ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827) React 18 + TypeScript SPA architecture.
- ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) Vite for fast iteration and optimized production builds.
- ![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white) Route-driven UX (`/`, `/trips`, fallback page).
- ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white) Utility-first design system.
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white) Motion and transition orchestration.
- ![Radix UI](https://img.shields.io/badge/Radix_UI-Primitives-161618?logo=radixui&logoColor=white) Accessible UI primitives.
- ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white) Data layer foundation for scalable async state.
- ![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1) Runtime schema alignment where needed.

### Backend

- ![Node.js](https://img.shields.io/badge/Node.js-Server-339933?logo=nodedotjs&logoColor=white) Node.js runtime.
- ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white) API service for inquiry submission and health checks.
- ![Nodemailer](https://img.shields.io/badge/Nodemailer-SMTP-0F766E) SMTP integration for operational email delivery.
- ![Helmet](https://img.shields.io/badge/Helmet-Security-111827) Hardened HTTP headers baseline.
- ![CORS](https://img.shields.io/badge/CORS-Origin_Control-1F2937) Explicit origin controls by environment.
- ![Rate Limit](https://img.shields.io/badge/Rate_Limit-Express-DC2626) Abuse mitigation via rate limiting and slowdown.

### Quality and Tooling

- ![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white) Linting and code quality gates.
- ![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white) Unit test framework.
- ![Testing Library](https://img.shields.io/badge/Testing_Library-UI-CA4245?logo=testinglibrary&logoColor=white) UI testing utilities.
- ![PostCSS](https://img.shields.io/badge/PostCSS-8-DD3A0A?logo=postcss&logoColor=white) CSS processing pipeline.

### SEO and Discovery

- ![Open Graph](https://img.shields.io/badge/Open_Graph-Enabled-0EA5E9)
- ![Twitter Cards](https://img.shields.io/badge/Twitter_Cards-Enabled-1D9BF0?logo=x&logoColor=white)
- ![Schema.org](https://img.shields.io/badge/Schema.org-JSON--LD-0F766E)
- ![Sitemap](https://img.shields.io/badge/XML_Sitemap-Managed-2563EB)

---

## Features

- Premium, animated landing experience with curated destination storytelling.
- Dedicated trips archive with advanced faceted filtering and sorting.
- URL-driven filter presets for campaign-friendly navigation (daily, two-day, domestic, international).
- Trip detail overlay with itinerary tabs, highlights, and guided inquiry flow.
- Reusable contact and inquiry forms wired to backend email dispatch.
- CAPTCHA integration (Cloudflare Turnstile or Google reCAPTCHA) for bot mitigation.
- Multilingual user experience (Greek and English).
- Theme-aware rendering (light/dark support).
- SEO-ready pages with canonical tags, Open Graph, Twitter cards, and JSON-LD.
- Progressive image loading and route-level lazy loading for smoother perceived performance.

---

## Engineering Excellence

### Security

Security choices were made to protect both infrastructure and brand reputation:

- Strict payload validation with Zod on inquiry input before processing.
- Sanitization routines (`escapeHtml`, `sanitizeHeader`) to reduce injection vectors.
- Helmet middleware for safer default HTTP headers.
- Environment-aware CORS allow-listing with production enforcement.
- Request throttling with `express-rate-limit` and `express-slow-down`.
- CAPTCHA verification against Turnstile or reCAPTCHA before accepting production submissions.
- Reduced attack surface with disabled `x-powered-by` and constrained body size limits.

Authentication note:

- The current product does not expose authenticated user accounts.
- If account-based workflows are introduced, JWT/OAuth2 is the recommended next layer for delegated auth and token-based session strategy.

Data protection note:

- SMTP is configured over secure transport (`secure` mode for SMTPS port 465).
- Secrets are externalized via environment variables, not committed to source.

### Performance

Performance investments target both objective speed and perceived responsiveness:

- Route-level code splitting through `React.lazy` + `Suspense`.
- Dedicated route prefetch utility to reduce navigation latency.
- Progressive image rendering to improve visual stability and loading experience.
- Motion tuned with reduced-motion support and GPU-friendly transitions.
- Vite production bundling for modern output and fast build performance.
- Lean API responses and bounded payload sizes for predictable backend behavior.

Caching strategy status:

- Redis is not currently required by workload shape, but the API boundary is ready for introducing Redis-backed response or throttle state caching when traffic patterns demand it.

### Scalability

Scalability is achieved by separation of concerns and clear runtime boundaries:

- Decoupled SPA and API runtimes allow independent deployment and scaling.
- Modular front-end architecture (components, contexts, pages, libs) supports team parallelism.
- Stateless API design eases horizontal scaling behind a load balancer.
- Environment-driven behavior (`NODE_ENV`, explicit CORS origins) supports staged rollouts.
- Existing boundaries are compatible with containerization (Docker) and future service decomposition if business growth requires microservices.

Design pattern perspective:

- This is intentionally a modular monolith today: simple enough for velocity, structured enough to evolve.

---

## Documentation

### API Endpoints

Base URL (local): `http://localhost:8787`

| Method | Endpoint            | Description                      |
| ------ | ------------------- | -------------------------------- |
| GET    | `/api/health`       | Health check endpoint            |
| GET    | `/health`           | Health check alias               |
| POST   | `/api/send-inquiry` | Main inquiry submission endpoint |
| POST   | `/send-inquiry`     | Inquiry submission alias         |

Inquiry payload shape (high-level):

- `from_name` (string)
- `from_email` (email)
- `phone` (optional)
- `message` (string)
- `source` (`contact-modal` or `trip-detail`)
- `trip_title`, `trip_location`, `trip_price`, `trip_url` (contextual)
- `captcha_token` (required in production)
- `submitted_at` (ISO datetime)

### Project Structure

```text
Valitsa_Travel/
|- public/                  # Static assets, robots, sitemap, branding
|- server/
|  |- index.js              # Express API, validation, security middleware, SMTP
|  |- .env.example          # Backend environment template
|- src/
|  |- components/           # Reusable UI and domain components
|  |- contexts/             # Theme and language providers
|  |- data/                 # Mock trip dataset and localized content
|  |- hooks/                # Custom React hooks
|  |- lib/                  # Utilities (email client, route prefetch, filters)
|  |- pages/                # Route-level screens
|  |- App.tsx               # App composition and route registration
|  |- main.tsx              # Frontend entrypoint
|- test/                    # Vitest setup and tests
|- .env.example             # Frontend environment template
|- package.json             # Scripts and dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### 1) Install dependencies

```bash
npm install
```

### 2) Configure frontend environment

Create `.env` from `.env.example` in the repository root:

```bash
VITE_MAIL_API_URL=http://localhost:8787/api/send-inquiry
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
# VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 3) Configure backend environment

Create `server/.env` from `server/.env.example`:

```bash
API_PORT=8787
CORS_ORIGIN=https://valitsatravel.gr,https://www.valitsatravel.gr

MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USER=noreply@yourdomain.com
MAIL_PASS=your_email_password
MAIL_TO=bookings@yourdomain.com
MAIL_CC=manager@yourdomain.com

TURNSTILE_SECRET_KEY=your_turnstile_secret
# RECAPTCHA_SECRET_KEY=your_recaptcha_secret
```

### 4) Run the full stack locally

```bash
npm run dev:full
```

Services:

- Frontend: `http://localhost:5173`
- API: `http://localhost:8787`

### 5) Build and test

```bash
npm run build
npm run test
npm run lint
```

---

## Contribution

Contributions are welcome from product, design, and engineering collaborators.

Recommended workflow:

1. Create a feature branch from `dev`.
2. Keep pull requests focused and reviewable.
3. Include tests or validation notes for behavior changes.
4. Ensure lint and test commands pass before requesting review.

For substantial changes, include a short design rationale that explains the trade-offs and expected user impact.

---

## License

This repository currently does not include a dedicated `LICENSE` file.

Until a license is added, treat all source code and brand assets as proprietary and all rights reserved.
