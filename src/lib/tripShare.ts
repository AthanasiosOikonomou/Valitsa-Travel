/** Canonical public trip URL used for copy, chat apps, and deep links. */
export const SITE_ORIGIN = "https://valitsatravel.gr";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type TripShareLang = "en" | "gr";

export function isValidTripId(id: string): boolean {
  return UUID_RE.test(String(id).trim());
}

/** Origin used in shared links (production in prod builds). */
export function getShareOrigin(): string {
  if (typeof window === "undefined") return SITE_ORIGIN;
  if (import.meta.env.PROD) return SITE_ORIGIN;
  return window.location.origin;
}

export function isLocalDevOrigin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const host = new URL(window.location.origin).hostname;
    return /^(localhost|127\.0\.0\.1)$/i.test(host);
  } catch {
    return false;
  }
}

export function buildTripShareUrl(tripId: string): string {
  const id = String(tripId).trim();
  return `${getShareOrigin()}/trips?trip=${encodeURIComponent(id)}`;
}

/** Always the live site URL — required for Facebook/Messenger link previews. */
export function buildPublicTripShareUrl(tripId: string): string {
  return `${SITE_ORIGIN}/trips?trip=${encodeURIComponent(String(tripId).trim())}`;
}

export function buildTripShareMessage(
  title: string,
  url: string,
  lang: TripShareLang,
): string {
  const name = title.trim() || (lang === "gr" ? "ταξίδι" : "trip");
  if (lang === "gr") {
    return `Δείτε αυτό το ταξίδι: ${name}\n${url}`;
  }
  return `Check out this trip: ${name}\n${url}`;
}

export function isMobileShareDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 &&
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches)
  );
}

export type TripShareNativePayload = {
  title: string;
  text: string;
  url: string;
};

export type TripShareTargets = {
  url: string;
  message: string;
  native: TripShareNativePayload;
  whatsapp: string;
  viber: string;
  messenger: string;
  facebookPost: string;
};

export function getTripShareTargets({
  title,
  tripId,
  lang,
}: {
  title: string;
  tripId: string;
  lang: TripShareLang;
}): TripShareTargets {
  const url = buildTripShareUrl(tripId);
  const publicUrl = buildPublicTripShareUrl(tripId);
  const message = buildTripShareMessage(title, url, lang);
  const encodedMessage = encodeURIComponent(message);
  const encodedPublicUrl = encodeURIComponent(publicUrl);

  return {
    url,
    message,
    native: {
      title: title.trim() || (lang === "gr" ? "Ταξίδι" : "Trip"),
      text: message,
      url,
    },
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    viber: `viber://forward?text=${encodedMessage}`,
    messenger: `fb-messenger://share?link=${encodedPublicUrl}`,
    facebookPost: `https://www.facebook.com/sharer/sharer.php?u=${encodedPublicUrl}`,
  };
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

/** Short display URL without protocol for preview line. */
export function formatShareLinkDisplay(url: string): string {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}${u.search}`;
  } catch {
    return url;
  }
}
