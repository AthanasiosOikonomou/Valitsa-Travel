import { supabase } from "@/lib/supabaseClient";

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function uploadTripImage(file: File): Promise<{ url: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload-image", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Upload failed");
  }
  return res.json() as Promise<{ url: string }>;
}

export async function patchTripFeatured(tripId: string, is_featured: boolean): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`/api/admin/trips/${tripId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_featured }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Update failed");
  }
}

export type TripUpdatePayload = Record<string, unknown>;

export async function putTrip(tripId: string, payload: TripUpdatePayload): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`/api/admin/trips/${tripId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Save failed");
  }
}
