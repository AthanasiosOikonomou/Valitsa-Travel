import { supabase } from "@/lib/supabaseClient";
import type { TripUpdate } from "@/types/Trip";

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

type UnauthorizedHandler = () => void;

let adminUnauthorizedHandler: UnauthorizedHandler | null = null;

/** Registered from AdminSessionSync (inside LanguageProvider) for 401/403 API responses. */
export function setAdminUnauthorizedHandler(
  handler: UnauthorizedHandler | null,
) {
  adminUnauthorizedHandler = handler;
}

let unauthorizedFiring = false;

function triggerAdminUnauthorized() {
  if (unauthorizedFiring) return;
  unauthorizedFiring = true;
  try {
    adminUnauthorizedHandler?.();
  } finally {
    setTimeout(() => {
      unauthorizedFiring = false;
    }, 1500);
  }
}

/**
 * Authenticated fetch for /api/admin/*. Attaches Bearer token; on 401/403 runs global sign-out + redirect.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    triggerAdminUnauthorized();
    throw new Error("Not signed in");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 || res.status === 403) {
    triggerAdminUnauthorized();
  }

  return res;
}

export async function uploadTripImage(file: File): Promise<{ url: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await adminFetch("/api/admin/upload-image", {
    method: "POST",
    body,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Upload failed");
  }
  return res.json() as Promise<{ url: string }>;
}

export async function patchTripFeatured(
  tripId: string,
  is_featured: boolean,
): Promise<void> {
  const res = await adminFetch(`/api/admin/trips/${tripId}`, {
    method: "PATCH",
    body: JSON.stringify({ is_featured }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Update failed");
  }
}

export async function putTrip(
  tripId: string,
  payload: TripUpdate,
): Promise<void> {
  const res = await adminFetch(`/api/admin/trips/${tripId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Save failed");
  }
}

export async function postTrip(payload: TripUpdate): Promise<{ id: string }> {
  const res = await adminFetch("/api/admin/trips", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Create failed");
  }
  const j = (await res.json()) as { id?: string };
  if (!j.id) throw new Error("Create failed: no id");
  return { id: j.id };
}
