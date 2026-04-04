import DOMPurify from "dompurify";

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
    "img",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "style", "src", "alt", "data-inquiry-storage"],
};

export function sanitizeInquiryHtml(html: string): string {
  return DOMPurify.sanitize(html || "", CONFIG);
}

export function inquiryHtmlToPlainText(html: string): string {
  if (typeof document === "undefined") return "";
  const el = document.createElement("div");
  el.innerHTML = sanitizeInquiryHtml(html);
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function extractImageUrlsFromHtml(html: string): string[] {
  const clean = sanitizeInquiryHtml(html);
  const re = /<img[^>]+src=["']([^"']+)["']/gi;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    const src = m[1];
    if (!src || src.startsWith("data:")) continue;
    out.push(src);
  }
  return out;
}
