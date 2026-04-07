import { apiUrl } from "@/lib/apiBase";

/** Resolves the POST target for inquiry submissions (mail + DB on the server). */
export const getInquiryMailApiUrl = () => {
  const configured = import.meta.env.VITE_MAIL_API_URL?.trim();
  if (!configured) return apiUrl("/api/send-inquiry");

  if (typeof window !== "undefined") {
    const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(
      window.location.hostname,
    );
    const configuredIsLocal =
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(configured);

    if (!isLocalHost && configuredIsLocal) {
      return apiUrl("/api/send-inquiry");
    }
  }

  return configured;
};
