Branding assets

Put your final branding images in these folders:

- public/branding/navbar/logo-light.svg
- public/branding/navbar/logo-dark.svg
- public/branding/favicon/favicon-light.svg
- public/branding/favicon/favicon-dark.svg

You can replace these SVG placeholder files with PNG, SVG, ICO, or WebP files later, but if you change the filenames or extensions, update the references in src/components/Navbar.tsx and index.html.

After each production `npm run build`, the client adds `?v=<build-token>` to `/branding/*` URLs (and writes `dist/branding/asset-version.txt` for the server). Override the token with `VITE_BRAND_ASSET_VERSION` in `.env` if you need a fixed value in CI.

Confirmation emails (server) embed the same logo URL with that `?v=` when `dist/branding/asset-version.txt` is present. Staff notification mail may use `MAIL_LOGO_URL` or a CID-attached `logo-dark.svg`.
