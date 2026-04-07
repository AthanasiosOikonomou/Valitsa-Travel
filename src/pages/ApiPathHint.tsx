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
      <p className="mt-4 text-sm leading-relaxed">
        Fix: make{" "}
        <code className="rounded bg-slate-100 px-1 font-mono text-xs dark:bg-zinc-800">
          /api
        </code>{" "}
        hit your Node app (Passenger / nginx proxy). Test from a terminal:{" "}
        <code className="mt-2 block whitespace-pre-wrap break-all rounded bg-slate-100 p-2 font-mono text-xs dark:bg-zinc-800">
          curl -sI https://valitsatravel.gr/api/health
        </code>
        <span className="mt-2 block">
          A healthy API responds with JSON and status 200, not HTML.
        </span>
      </p>
    </div>
  );
}
