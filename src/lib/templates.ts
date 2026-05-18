import type { InvitationTemplate, WeddingFormData } from "@/types";

export const weddingTemplateFields: InvitationTemplate["schema"] = [
  { name: "brideName", label: "Kelin ismi", type: "text", placeholder: "Zebo", required: true },
  { name: "groomName", label: "Kuyov ismi", type: "text", placeholder: "Ali", required: true },
  { name: "eventDate", label: "Sana", type: "date", required: true },
  { name: "eventTime", label: "Vaqt", type: "time", required: true },
  { name: "venueName", label: "To'yxona", type: "text", placeholder: "Navro'z Palace", required: true },
  { name: "venueAddress", label: "Manzil", type: "textarea", placeholder: "Toshkent shahri, ...", required: true },
  {
    name: "hostText",
    label: "Taklif matni",
    type: "textarea",
    placeholder: "Sizni aziz farzandlarimizning nikoh to'yiga taklif qilamiz.",
    required: true
  },
  { name: "coverImageUrl", label: "Rasm URL", type: "url", placeholder: "https://..." },
  { name: "musicUrl", label: "Musiqa URL", type: "url", placeholder: "https://..." }
];

export const defaultWeddingData: WeddingFormData = {
  brideName: "Zebo",
  groomName: "Ali",
  eventDate: "2026-09-12",
  eventTime: "18:00",
  venueName: "Navro'z Palace",
  venueAddress: "Toshkent shahri, Chilonzor tumani",
  hostText: "Sizni aziz farzandlarimizning nikoh to'yiga lutfan taklif qilamiz.",
  coverImageUrl: "",
  musicUrl: ""
};

export const seedTemplates: InvitationTemplate[] = [
  {
    id: "classic-rose",
    name: "Classic Rose",
    category: "wedding",
    description: "Nozik gul aksentlari bilan klassik to'y taklifnomasi.",
    previewImageUrl: null,
    schema: weddingTemplateFields,
    status: "active",
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString()
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    category: "wedding",
    description: "Toza tipografiya, keng bo'sh joy va zamonaviy kompozitsiya.",
    previewImageUrl: null,
    schema: weddingTemplateFields,
    status: "active",
    createdAt: new Date("2026-01-01").toISOString(),
    updatedAt: new Date("2026-01-01").toISOString()
  }
];
