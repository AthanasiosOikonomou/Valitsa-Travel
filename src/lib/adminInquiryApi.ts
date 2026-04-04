import { adminFetch } from "@/lib/adminApi";
import type { InquiryCommentRow } from "@/types/admin";

export async function fetchInquiryComments(inquiryId: string): Promise<InquiryCommentRow[]> {
  const res = await adminFetch(`/api/admin/inquiries/${inquiryId}/comments`);
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
  const res = await adminFetch(`/api/admin/inquiries/${inquiryId}/comments`, {
    method: "POST",
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
  const res = await adminFetch(`/api/admin/inquiries/${inquiryId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Update failed");
  }
}
