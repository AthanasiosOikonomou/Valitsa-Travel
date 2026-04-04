import { supabase } from "@/lib/supabaseClient";

/** Private bucket — use createSignedUrl when displaying; paths are stored in HTML as data-inquiry-storage. */
export const INQUIRY_ATTACHMENTS_BUCKET = "inquiry-attachments";

/** Signed URL TTL for download / open actions (seconds). */
export const INQUIRY_ATTACHMENT_DOWNLOAD_TTL_SEC = 60;

/** Signed URL TTL for inline image thumbnails in the timeline (seconds). */
export const INQUIRY_ATTACHMENT_THUMB_TTL_SEC = 1800;

/** 1×1 transparent GIF so DOMPurify keeps img until signed URL is applied. */
const IMG_PLACEHOLDER_SRC =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export async function removeInquiryAttachmentsFromStorage(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(INQUIRY_ATTACHMENTS_BUCKET).remove(paths);
  if (error) throw error;
}

export async function uploadInquiryAttachment(
  file: File,
  inquiryId: string,
  options?: { signal?: AbortSignal },
): Promise<{ path: string; isImage: boolean }> {
  const signal = options?.signal;
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }

  const ext = (file.name.split(".").pop() || "bin").replace(/[^\w.-]/g, "");
  const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const path = `${inquiryId}/${safeName}`;

  const uploadPromise = supabase.storage.from(INQUIRY_ATTACHMENTS_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  const run = async () => {
    const { data, error } = await uploadPromise;
    if (error) throw error;
    const isImage = file.type.startsWith("image/");
    return { path: data.path, isImage };
  };

  if (!signal) {
    return run();
  }

  return Promise.race([
    run(),
    new Promise<{ path: string; isImage: boolean }>((_, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), {
        once: true,
      });
    }),
  ]);
}

/** HTML inserted into TipTap; paths resolved via signed URLs in the timeline. */
export function attachmentSnippetForEditor(fileName: string, storagePath: string, isImage: boolean): string {
  const safeName = escapeAttr(fileName);
  const safePath = escapeAttr(storagePath);
  if (isImage) {
    return `<p><img src="${IMG_PLACEHOLDER_SRC}" alt="${safeName}" data-inquiry-storage="${safePath}" class="inquiry-storage-img" /></p>`;
  }
  return `<p class="inquiry-file-card"><a href="#" data-inquiry-storage="${safePath}" target="_blank" rel="noopener noreferrer" class="inquiry-attachment-link inquiry-storage-link">${safeName}</a></p>`;
}

export async function createInquiryAttachmentSignedUrl(
  path: string,
  expiresInSec = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(INQUIRY_ATTACHMENTS_BUCKET)
    .createSignedUrl(path, expiresInSec);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
