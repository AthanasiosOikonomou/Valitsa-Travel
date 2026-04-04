import { adminFetch } from "@/lib/adminApi";
import type { InquiryCommentAttachment, InquiryCommentRow } from "@/types/admin";

/** Coerce one JSONB object (possibly alternate keys from DB or older clients) into a valid item. */
function coerceAttachmentItem(x: unknown): InquiryCommentAttachment | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const pathRaw = o.path ?? o.storage_path ?? o.storagePath;
  const path = typeof pathRaw === "string" ? pathRaw.trim() : "";
  if (!path) return null;

  const nameRaw = o.name ?? o.filename ?? o.file_name ?? o.fileName;
  const name =
    typeof nameRaw === "string" && nameRaw.trim().length > 0
      ? nameRaw.trim()
      : path.replace(/^.*[/\\]/, "") || "file";

  const typeRaw = o.type ?? o.mime ?? o.mime_type ?? o.mimeType ?? o.content_type ?? o.contentType;
  const type =
    typeof typeRaw === "string" && typeRaw.trim().length > 0
      ? typeRaw.trim()
      : "application/octet-stream";

  return { name, path, type };
}

function attachmentListFromParsed(parsed: unknown): InquiryCommentAttachment[] | null {
  if (parsed == null) return null;
  if (Array.isArray(parsed)) {
    const out = parsed.map(coerceAttachmentItem).filter(Boolean) as InquiryCommentAttachment[];
    return out.length > 0 ? out : null;
  }
  if (typeof parsed === "object" && parsed !== null) {
    const single = coerceAttachmentItem(parsed);
    if (single) return [single];
    const vals = Object.values(parsed as Record<string, unknown>);
    if (vals.length > 0 && vals.every((v) => v !== null && typeof v === "object")) {
      const out = vals.map(coerceAttachmentItem).filter(Boolean) as InquiryCommentAttachment[];
      return out.length > 0 ? out : null;
    }
  }
  return null;
}

/** Coerce API/JSONB quirks (string JSON, single object, array-like objects) into a clean array or null. */
export function normalizeCommentAttachments(raw: unknown): InquiryCommentAttachment[] | null {
  if (raw == null) return null;
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;
    try {
      parsed = JSON.parse(s) as unknown;
    } catch {
      return null;
    }
  }
  return attachmentListFromParsed(parsed);
}

export function normalizeInquiryCommentRow(row: InquiryCommentRow): InquiryCommentRow {
  const attachments = normalizeCommentAttachments(row.attachments as unknown);
  return { ...row, attachments };
}

export async function fetchInquiryComments(inquiryId: string): Promise<InquiryCommentRow[]> {
  const res = await adminFetch(`/api/admin/inquiries/${inquiryId}/comments`);
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Failed to load comments");
  }
  const data = (await res.json()) as { comments: InquiryCommentRow[] };
  const list = data.comments ?? [];
  const normalized = list.map((c) => normalizeInquiryCommentRow(c));
  if (import.meta.env.DEV) {
    for (const msg of normalized) {
      console.log("Loading message:", msg.id, "with attachments:", msg.attachments);
    }
  }
  return normalized;
}

export async function deleteInquiryCommentAttachment(
  inquiryId: string,
  commentId: string,
  removeAttachmentPath: string,
): Promise<InquiryCommentRow> {
  const res = await adminFetch(
    `/api/admin/inquiries/${inquiryId}/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ removeAttachmentPath }),
    },
  );
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Failed to remove attachment");
  }
  const data = (await res.json()) as { comment: InquiryCommentRow };
  return normalizeInquiryCommentRow(data.comment);
}

export async function postInquiryComment(
  inquiryId: string,
  body: { content: string; attachments?: InquiryCommentAttachment[] },
): Promise<InquiryCommentRow> {
  const res = await adminFetch(`/api/admin/inquiries/${inquiryId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      content: body.content,
      attachments: body.attachments ?? [],
    }),
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Failed to post comment");
  }
  const data = (await res.json()) as { comment: InquiryCommentRow };
  return normalizeInquiryCommentRow(data.comment);
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
