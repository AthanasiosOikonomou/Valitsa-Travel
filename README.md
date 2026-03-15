# Valitsa Travel

## Email Sending Setup

Both inquiry forms now send real emails through a Node.js/Express API using your cPanel mail server (SMTP):

- Contact modal form
- Trip detail "Express Interest" form

### 1) Frontend environment

Create a `.env` file in the project root and copy values from `.env.example`:

```bash
VITE_MAIL_API_URL=http://localhost:8787/api/send-inquiry
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
# VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 2) Backend environment (Express API)

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

Notes:

- Use your real cPanel mailbox credentials for `MAIL_USER` / `MAIL_PASS`.
- `MAIL_TO` is the main recipient.
- `MAIL_CC` is the CC recipient.

### 3) Run locally

```bash
npm install
npm run dev:full
```

This starts:

- Frontend on `http://localhost:5173`
- Mail API on `http://localhost:8787`

### 4) Deploy notes for cPanel

- Deploy frontend as usual.
- Deploy and run `server/index.js` as a Node.js app in cPanel.
- Set the same backend env vars in cPanel Node app environment.
