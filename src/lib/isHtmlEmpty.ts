/** True when HTML has no visible text (tags/whitespace/&nbsp; only). */
export function isHtmlEmpty(html: string): boolean {
  const stripped = html.replace(/<[^>]+>/g, "").replace(/\s|&nbsp;/g, "");
  return stripped.length === 0;
}
