export type { CreateInquiryPayload } from "@/lib/inquiries";
export { createInquiry } from "@/lib/inquiries";
export { getInquiryMailApiUrl } from "@/lib/inquiryApiUrl";

import type { CreateInquiryPayload } from "@/lib/inquiries";
import { createInquiry } from "@/lib/inquiries";

/** @deprecated Use `CreateInquiryPayload` from `@/lib/inquiries`. */
export type InquiryPayload = CreateInquiryPayload;

/** @deprecated Use `createInquiry` from `@/lib/inquiries`. */
export const sendInquiryEmail = (payload: InquiryPayload) =>
  createInquiry(payload);
