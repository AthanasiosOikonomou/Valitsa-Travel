import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { INQUIRY_ATTACHMENTS_BUCKET } from "@/lib/inquiryAttachmentUpload";

type Props = {
  html: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const SIGNED_URL_TTL_SEC = 3600;

export function InquiryTimelineHtml({ html, className, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !html) return;
    let cancelled = false;
    void (async () => {
      const nodes = root.querySelectorAll("[data-inquiry-storage]");
      await Promise.all(
        [...nodes].map(async (el) => {
          const path = el.getAttribute("data-inquiry-storage");
          if (!path) return;
          const { data, error } = await supabase.storage
            .from(INQUIRY_ATTACHMENTS_BUCKET)
            .createSignedUrl(path, SIGNED_URL_TTL_SEC);
          if (cancelled || error || !data?.signedUrl) return;
          if (el instanceof HTMLImageElement) {
            el.src = data.signedUrl;
          } else if (el instanceof HTMLAnchorElement) {
            el.href = data.signedUrl;
            el.target = "_blank";
            el.rel = "noopener noreferrer";
          }
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} onClick={onClick} />
  );
}
