/** Instant jump to document top (bypasses CSS smooth scroll). */
export function instantScrollToTop() {
  const prev = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.documentElement.style.scrollBehavior = prev;
}

/** Smooth scroll to top (e.g. scroll-up FAB). `prefers-reduced-motion` CSS may force instant scroll. */
export function smoothScrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

/** Smooth scroll a scrollable container (e.g. modal body) to top. */
export function smoothScrollElementToTop(el: HTMLElement | null | undefined) {
  if (!el) return;
  el.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}
