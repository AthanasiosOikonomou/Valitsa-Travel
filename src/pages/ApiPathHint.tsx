/**
 * Shown only when the host incorrectly serves the SPA for /api/* (static fallback).
 * A working setup returns JSON from Node before this app loads — open DevTools → Network or use curl.
 */
export default function ApiPathHint() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-slate-700 dark:text-zinc-300">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
        /api — server routing
      </h1>
      <p className="mt-3 text-sm leading-relaxed">
        You should not see this page if the API works. The browser asked for{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-zinc-800">
          /api/…
        </code>{" "}
        but the host sent the website (HTML) instead of JSON — so React loaded and you were about
        to be sent home by the app router.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-slate-900 dark:text-zinc-100">
        Check from a terminal
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        Use a normal GET (not <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-zinc-800">-I</code> only), so you see the response body:
      </p>
      <code className="mt-2 block whitespace-pre-wrap break-all rounded bg-slate-100 p-2 font-mono text-xs dark:bg-zinc-800">
        curl -s https://valitsatravel.gr/api/health
      </code>
      <p className="mt-2 text-sm leading-relaxed">
        <strong className="font-medium text-slate-800 dark:text-zinc-200">Good:</strong> the body
        starts with JSON like <code className="font-mono text-xs">{`{"ok":true}`}</code>.{" "}
        <strong className="font-medium text-slate-800 dark:text-zinc-200">Bad:</strong> HTML or 404
        — <code className="font-mono text-xs">/api</code> is not reaching Node on this host.
      </p>

      <h2 className="mt-8 text-sm font-semibold text-slate-900 dark:text-zinc-100">
        Path A — same domain
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        In cPanel, the Node app root (Passenger + <code className="font-mono text-xs">passenger_entry.cjs</code>)
        must be the site that serves <code className="font-mono text-xs">valitsatravel.gr</code>, or nginx must
        proxy <code className="font-mono text-xs">/api/</code> to that process. See{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-zinc-800">
          deploy/nginx-spa-snippet.conf
        </code>{" "}
        (proxy option).
      </p>

      <h2 className="mt-8 text-sm font-semibold text-slate-900 dark:text-zinc-100">
        Path B — API on a subdomain
      </h2>
      <p className="mt-2 text-sm leading-relaxed">
        If the main domain stays static-only: create e.g.{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-zinc-800">
          api.valitsatravel.gr
        </code>{" "}
        with document root = your full Node app folder (not only a <code className="font-mono text-xs">dist</code>{" "}
        upload). Confirm{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-zinc-800">
          curl -s https://api.valitsatravel.gr/api/health
        </code>{" "}
        returns JSON. Then set{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-zinc-800">
          VITE_API_BASE_URL=https://api.valitsatravel.gr
        </code>{" "}
        in the project root <code className="font-mono text-xs">.env</code>, run{" "}
        <code className="font-mono text-xs">npm run build</code>, deploy <code className="font-mono text-xs">dist/</code>{" "}
        to the main site, and add <code className="font-mono text-xs">https://valitsatravel.gr</code> to{" "}
        <code className="font-mono text-xs">CORS_ORIGIN</code> in <code className="font-mono text-xs">server/.env</code>.
        Full steps: <code className="font-mono text-xs">HOSTING_PASSENGER.txt</code> section 9.
      </p>
    </div>
  );
}
