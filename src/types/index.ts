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

export type TemplateLayerPermissions = {
  editable: boolean;
  movable: boolean;
  resizable: boolean;
  rotatable: boolean;
  deletable: boolean;
  styleEditable: boolean;
};

export type TemplateLayerBase = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  visible: boolean;
  permissions?: TemplateLayerPermissions;
  shadow?: {
    color: string;
    blur: number;
    x: number;
    y: number;
  };
  blur?: number;
};

export type TemplateTextLayer = TemplateLayerBase & {
  type: "text";
  text: string;
  binding?: keyof WeddingFormData;
  color: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  align: "left" | "center" | "right";
};

export type TemplateShapeLayer = TemplateLayerBase & {
  type: "shape";
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  backgroundImage?: {
    src: string;
    fit: "cover" | "contain";
    position: "center" | "top" | "bottom";
    opacity: number;
  };
};

export type TemplateImageLayer = TemplateLayerBase & {
  type: "image";
  src: string;
  binding?: "coverImageUrl";
  fit: "cover" | "contain";
  radius: number;
};

export type OrnamentKind =
  | "floral-corner"
  | "olive-branch"
  | "royal-divider"
  | "islamic-arch"
  | "art-deco-fan"
  | "sparkle-cluster"
  | "wax-seal"
  | "double-ring";

export type TemplateOrnamentLayer = TemplateLayerBase & {
  type: "ornament";
  ornament: OrnamentKind;
  color: string;
  secondaryColor: string;
  strokeWidth: number;
};

export type TemplateLayer =
  | TemplateTextLayer
  | TemplateShapeLayer
  | TemplateImageLayer
  | TemplateOrnamentLayer;

export type TemplateDocument = {
  version: 1;
  width: number;
  height: number;
  background: string;
  backgroundImage?: {
    src: string;
    fit: "cover" | "contain";
    position: "center" | "top" | "bottom";
    opacity: number;
  };
  layers: TemplateLayer[];
};

export type InvitationTemplate = {
  id: string;
  name: string;
  category: "wedding";
  description: string;
  previewImageUrl?: string | null;
  schema: TemplateField[];
  designDocument?: TemplateDocument | null;
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
  designDocument?: TemplateDocument | null;
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
  reminderEnabled: boolean;
  telegramChatId?: string | null;
  reminderSentAt?: string | null;
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
