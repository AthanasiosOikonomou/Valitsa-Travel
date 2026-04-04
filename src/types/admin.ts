export type AdminTripViewRow = Record<string, unknown> & {
  id?: string;
  trip_id?: string;
  title?: string | null;
  title_el?: string | null;
  name?: string | null;
  image?: string | null;
  click_count?: number | null;
  inquiry_count?: number | null;
  is_featured?: boolean | null;
};

export type InquiryStatus = "new" | "contacted" | "resolved";

export type AdminInquiryRow = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  trip_id?: string | null;
  status?: InquiryStatus | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  trips?: { id: string; title: string | null; image: string | null } | null;
};

export type InquiryCommentAttachment = {
  name: string;
  path: string;
  type: string;
};

export type InquiryCommentRow = {
  id: string;
  inquiry_id: string;
  admin_id: string | null;
  content: string;
  created_at: string;
  author_label?: string | null;
  attachments?: InquiryCommentAttachment[] | null;
};
