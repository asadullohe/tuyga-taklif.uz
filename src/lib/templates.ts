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
  ["classic-rose", "Classic Rose", "Foto fon, markaziy romantik card va floating heart entrance."],
  ["modern-minimal", "Modern Minimal", "Asimmetrik editorial layout, grid chiziqlar va ultra toza tipografiya."],
  ["royal-emerald", "Royal Emerald", "Saroy arch kompozitsiyasi, oltin gate ramka va royal seal."],
  ["golden-noor", "Golden Noor", "Mihrab shakli, nur rays animatsiyasi va arabesque rhythm."],
  ["pearl-blush", "Pearl Blush", "Pearl photo-window, yumshoq luxury panel va capsule date."],
  ["midnight-starry", "Midnight Starry", "Dark poster layout, starfield motion va dramatik date orbit."],
  ["garden-bloom", "Garden Bloom", "Flower ring, leaf drift, bog'cha tile kompozitsiyasi."],
  ["silk-lilac", "Silk Lilac", "Magazine editorial flow, silk texture va diagonal story block."],
  ["desert-saffron", "Desert Saffron", "Scroll parchment markazi, sand-line motion va sharqona date marks."],
  ["ocean-glass", "Ocean Glass", "Glassmorphism panel, shimmer motion va pill-shaped info rows."]
].map(([id, name, description]) => ({
  id,
  name,
  category: "wedding",
  description,
  previewImageUrl: null,
  schema: weddingTemplateFields,
  status: "active",
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString()
}));
