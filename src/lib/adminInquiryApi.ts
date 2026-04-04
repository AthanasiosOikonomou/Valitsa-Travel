import { getAccessToken } from "@/lib/adminApi";
import type { InquiryCommentRow } from "@/types/admin";

export async function fetchInquiryComments(inquiryId: string): Promise<InquiryCommentRow[]> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`/api/admin/inquiries/${inquiryId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Failed to load comments");
  }
  const data = (await res.json()) as { comments: InquiryCommentRow[] };
  return data.comments ?? [];
}

export async function postInquiryComment(
  inquiryId: string,
  content: string,
): Promise<InquiryCommentRow> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`/api/admin/inquiries/${inquiryId}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Failed to post comment");
  }
  const data = (await res.json()) as { comment: InquiryCommentRow };
  return data.comment;
}

export async function patchInquiry(
  inquiryId: string,
  body: { status?: "new" | "contacted" | "resolved" },
): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`/api/admin/inquiries/${inquiryId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Update failed");
  }
}
