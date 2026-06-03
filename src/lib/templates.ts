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
  ["blue-ink-a4", "Blue Ink A4", "Black, blue and white illustrated A4-style wedding invitation with ink florals."],
  ["photo-collage", "Photo Collage", "Canva-style editorial photo mosaic, ivory margin, gold date ribbon."],
  ["gallery-collage", "Gallery Collage", "Premium multi-photo gallery invite, overlapped frames va letterpress detail panel."],
  ["modern-minimal", "Modern Minimal", "Black-ivory editorial invitation, katta serif names va disciplined spacing."],
  ["royal-emerald", "Royal Emerald", "Deep emerald gatefold, gold foil border va ceremony crest."],
  ["golden-noor", "Golden Noor", "Ivory mihrab, luminous noor rays, refined arabesque gold details."],
  ["pearl-blush", "Pearl Blush", "Pearl photo-window, yumshoq luxury panel va capsule date."],
  ["midnight-starry", "Midnight Starry", "Noir-gold night invite, constellation frame va cinematic date plate."],
  ["garden-bloom", "Garden Bloom", "Botanical stationery look, pressed florals va soft sage letterpress."],
  ["silk-lilac", "Silk Lilac", "Luxury silk editorial, diagonal textile block va refined lilac typography."],
  ["desert-saffron", "Desert Saffron", "Terracotta luxe card, geometric border va saffron ink ceremony panel."],
  ["ocean-glass", "Ocean Glass", "Sea-glass invitation, translucent layers va pearl-blue shimmer."]
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
