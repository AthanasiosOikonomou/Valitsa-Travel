Branding assets

Put your final branding images in these folders:

- public/branding/navbar/logo-light.svg
- public/branding/navbar/logo-dark.svg
- public/branding/favicon/favicon-light.svg
- public/branding/favicon/favicon-dark.svg

You can replace these SVG placeholder files with PNG, SVG, ICO, or WebP files later, but if you change the filenames or extensions, update the references in src/components/Navbar.tsx and index.html.

Confirmation emails (server) use `logo-light.png` (or `logo-light.svg`) via `MAIL_LOGO_CONFIRMATION_URL` or `PUBLIC_SITE_URL` + `/branding/navbar/logo-light.png`. Staff notification mail may use `MAIL_LOGO_URL` or a CID-attached `logo-dark.png`.
