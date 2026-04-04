import DOMPurify from "dompurify";

/** Allowlist aligned with admin TipTap (RichTextEditor): no images, no inquiry-only attrs. */
const CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "a",
    "h2",
    "h3",
    "span",
    "code",
    "pre",
    "blockquote",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "style"],
};

export function sanitizeTripRichTextHtml(html: string): string {
  return DOMPurify.sanitize(html || "", CONFIG);
}
