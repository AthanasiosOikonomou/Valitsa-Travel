import { useMemo } from "react";
import { isHtmlEmpty } from "@/lib/isHtmlEmpty";
import { sanitizeTripRichTextHtml } from "@/lib/sanitizeTripRichTextHtml";
import { cn } from "@/lib/utils";

type Props = {
  html: string;
  className?: string;
  as?: "div" | "article";
};

/**
 * Renders sanitized TipTap HTML for public trip/program copy.
 * Returns null when there is no visible content.
 */
export function SafeRichTextHtml({ html, className, as: Tag = "div" }: Props) {
  const safe = useMemo(() => sanitizeTripRichTextHtml(html), [html]);
  const empty = useMemo(() => isHtmlEmpty(safe), [safe]);
  if (empty) return null;
  return (
    <Tag
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:scroll-mt-20",
        "prose-p:text-justify prose-li:text-justify prose-td:text-justify",
        "text-inherit [&_a]:break-words",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
