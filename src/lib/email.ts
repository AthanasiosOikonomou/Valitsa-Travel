export interface InquiryPayload {
  source: "contact-modal" | "trip-detail";
  firstName: string;
  lastName: string;
  email: string;
  captchaToken: string;
  mobile?: string;
  message: string;
  tripTitle?: string;
  tripLocation?: string;
  tripPrice?: string;
  tripUrl?: string;
}

const resolveMailApiUrl = () => {
  const configured = import.meta.env.VITE_MAIL_API_URL?.trim();
  if (!configured) return "/api/send-inquiry";

  if (typeof window !== "undefined") {
    const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(
      window.location.hostname,
    );
    const configuredIsLocal =
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(configured);

    // Safety fallback for production builds accidentally pointing to localhost.
    if (!isLocalHost && configuredIsLocal) {
      return "/api/send-inquiry";
    }
  }

  return configured;
};

const mailApiUrl = resolveMailApiUrl();

const assertEmailConfig = () => {
  if (!mailApiUrl) {
    throw new Error(
      "Email API configuration is missing. Set VITE_MAIL_API_URL or use /api/send-inquiry.",
    );
  }
};

export const sendInquiryEmail = async (payload: InquiryPayload) => {
  assertEmailConfig();

  const body = {
    from_name: `${payload.firstName} ${payload.lastName}`.trim(),
    from_email: payload.email,
    phone: payload.mobile ?? "",
    message: payload.message,
    source: payload.source,
    captcha_token: payload.captchaToken,
    trip_title: payload.tripTitle ?? "",
    trip_location: payload.tripLocation ?? "",
    trip_price: payload.tripPrice ?? "",
    trip_url: payload.tripUrl ?? "",
    submitted_at: new Date().toISOString(),
  };

  const response = await fetch(mailApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let serverMessage = "Failed to send inquiry email";
    try {
      const data = await response.json();
      if (data?.error) serverMessage = data.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(serverMessage);
  }
};
