# Facebook link preview (403 / missing image)

## If Sharing Debugger shows **403**

1. **robots.txt** — deploy the updated `public/robots.txt` (allows `facebookexternalhit`, `Facebot`, `meta-externalagent`).

2. **nginx** — if the site uses nginx + static `try_files` (only `/api/` proxied to Node), add  
   `deploy/nginx-og-proxy.include.conf` so `/trips` and `/og/` hit Node. Then:
   ```bash
   nginx -t && systemctl reload nginx
   ```

3. **Hosting bot firewall** (Hostinger / cPanel / Imunify360 / Cloudflare):
   - Allow user-agents: `facebookexternalhit`, `Facebot`, `meta-externalagent`
   - Or disable “Bot Protection” for the domain temporarily and test again

4. **Facebook cache** — [Sharing Debugger](https://developers.facebook.com/tools/debug/) → paste full trip URL  
   `https://valitsatravel.gr/trips?trip=<uuid>` → **Scrape Again**

## Verify after deploy

```bash
curl -A "facebookexternalhit/1.1" "https://valitsatravel.gr/trips?trip=<uuid>" | grep 'og:image'
```

`og:image` should be `https://valitsatravel.gr/og/trip/<uuid>.jpg` (not only `hero.webp`).

```bash
curl -I -A "facebookexternalhit/1.1" "https://valitsatravel.gr/og/trip/<uuid>.jpg"
```

Should return `200` and `Content-Type: image/...` (not `text/html`).
