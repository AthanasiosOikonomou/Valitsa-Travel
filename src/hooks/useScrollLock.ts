import { useEffect } from "react";

/** Locks document scroll on `html` and `body` while active; restores previous inline styles on cleanup. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [active]);
}
