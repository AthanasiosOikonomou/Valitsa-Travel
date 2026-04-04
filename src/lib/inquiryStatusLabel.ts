/** Maps inquiry.status DB values to localized labels (admin.status* keys). */
export function inquiryStatusLabel(
  status: string | null | undefined,
  t: (key: string) => string,
): string {
  const s = String(status ?? "")
    .trim()
    .toLowerCase();
  if (s === "new") return t("admin.statusNew");
  if (s === "contacted") return t("admin.statusContacted");
  if (s === "resolved") return t("admin.statusResolved");
  if (status?.trim()) return status.trim();
  return "—";
}
