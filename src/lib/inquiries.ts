import { z } from "zod";
import { getInquiryMailApiUrl } from "@/lib/inquiryApiUrl";

const createInquirySchema = z.object({
  firstName: z.string().trim().min(1, "Name is required"),
  lastName: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  mobile: z.string().trim().optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  tripId: z.string().uuid().optional(),
});

export type CreateInquiryPayload = {
  source: "contact-modal" | "trip-detail";
  firstName: string;
  lastName: string;
  email: string;
  captchaToken: string;
  mobile?: string;
  message: string;
  /** When omitted or empty, stored as null (general contact). */
  tripId?: string | null;
  tripTitle?: string;
  tripLocation?: string;
  tripPrice?: string;
  tripUrl?: string;
};

/**
 * Validates inquiry fields with Zod, then POSTs to the mail API (which also persists to Supabase when configured).
 */
export async function createInquiry(payload: CreateInquiryPayload): Promise<void> {
  const url = getInquiryMailApiUrl();
  if (!url) {
    throw new Error(
      "Inquiry API is not configured. Set VITE_MAIL_API_URL or use /api/send-inquiry.",
    );
  }

  const parsed = createInquirySchema.safeParse({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    mobile: payload.mobile ?? "",
    message: payload.message,
    tripId: payload.tripId ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new Error(first?.message ?? "Invalid form data");
  }

  const { tripId, ...rest } = parsed.data;
  const trip_id = tripId ?? null;

  const body = {
    from_name: `${rest.firstName} ${rest.lastName}`.trim(),
    from_email: rest.email,
    phone: rest.mobile,
    message: rest.message,
    source: payload.source,
    captcha_token: payload.captchaToken,
    trip_id,
    trip_title: payload.tripTitle ?? "",
    trip_location: payload.tripLocation ?? "",
    trip_price: payload.tripPrice ?? "",
    trip_url: payload.tripUrl ?? "",
    submitted_at: new Date().toISOString(),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let serverMessage = "Failed to send inquiry";
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) serverMessage = data.error;
    } catch {
      // ignore
    }
    throw new Error(serverMessage);
  }
}
