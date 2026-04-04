export const INQUIRY_ATTACHMENT_MAX_FILES = 5;
export const INQUIRY_ATTACHMENT_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const INQUIRY_ATTACHMENT_MAX_TOTAL_BYTES = 50 * 1024 * 1024;

export type AttachmentPickValidationError =
  | "max_files"
  | "file_too_large"
  | "total_too_large";

export function validateAttachmentPick(
  existingFiles: readonly { size: number }[],
  picked: File[],
): { ok: true; merged: File[] } | { ok: false; error: AttachmentPickValidationError } {
  if (picked.length === 0) return { ok: true, merged: [] };
  const nextCount = existingFiles.length + picked.length;
  if (nextCount > INQUIRY_ATTACHMENT_MAX_FILES) {
    return { ok: false, error: "max_files" };
  }
  for (const f of picked) {
    if (f.size > INQUIRY_ATTACHMENT_MAX_FILE_BYTES) {
      return { ok: false, error: "file_too_large" };
    }
  }
  const existingSum = existingFiles.reduce((s, x) => s + x.size, 0);
  const pickedSum = picked.reduce((s, f) => s + f.size, 0);
  if (existingSum + pickedSum > INQUIRY_ATTACHMENT_MAX_TOTAL_BYTES) {
    return { ok: false, error: "total_too_large" };
  }
  return { ok: true, merged: [...picked] };
}
