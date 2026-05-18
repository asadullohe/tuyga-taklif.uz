export type UserRole = "user" | "admin";

export type AppUser = {
  id: string;
  telegramId: string;
  firstName: string;
  lastName?: string | null;
  username?: string | null;
  photoUrl?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type WeddingFormData = {
  brideName: string;
  groomName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  hostText: string;
  coverImageUrl?: string;
  musicUrl?: string;
};

export type TemplateField = {
  name: keyof WeddingFormData;
  label: string;
  type: "text" | "date" | "time" | "textarea" | "url";
  placeholder?: string;
  required?: boolean;
};

export type InvitationTemplate = {
  id: string;
  name: string;
  category: "wedding";
  description: string;
  previewImageUrl?: string | null;
  schema: TemplateField[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type InvitationStatus = "draft" | "published";

export type Invitation = {
  id: string;
  userId: string;
  templateId: string;
  slug: string | null;
  formData: WeddingFormData;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  template?: InvitationTemplate;
};

export type RsvpStatus = "attending" | "not_attending";

export type Rsvp = {
  id: string;
  invitationId: string;
  guestName: string;
  status: RsvpStatus;
  guestCount: number;
  createdAt: string;
};

export type AnalyticsEventType = "opened" | "rsvp_submitted" | "share_clicked";

export type AnalyticsEvent = {
  id: string;
  invitationId: string;
  eventType: AnalyticsEventType;
  metadata?: Record<string, unknown>;
  createdAt: string;
};
