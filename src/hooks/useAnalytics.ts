import { useCallback } from "react";

const sessionKey = (tripId: string) => `trip_viewed_${tripId}`;

/**
 * Tracks a trip detail open once per browser session (sessionStorage).
 * Fire-and-forget POST to the Express API; does not block the UI.
 */
export function useAnalytics() {
  const trackTripView = useCallback(
    (tripId: string, name: string, image: string | null) => {
      if (typeof sessionStorage === "undefined") return;
      const key = sessionKey(tripId);
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      void fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trip_id: tripId,
          name,
          image: image ?? "",
        }),
      }).catch(() => {});
    },
    [],
  );

  return { trackTripView };
}
