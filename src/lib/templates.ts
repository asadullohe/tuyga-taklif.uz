import type { InvitationTemplate, WeddingFormData } from "@/types";
import { seedTemplateDocuments } from "@/lib/seed-template-documents";

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

const legacyTemplates: InvitationTemplate[] = [
  ["classic-rose", "Classic Rose", "Foto fon, markaziy romantik card va floating heart entrance."],
  ["blue-ink-a4", "Blue Ink A4", "Black, blue and white illustrated A4-style wedding invitation with ink florals."],
  ["photo-collage", "Photo Collage", "Editorial wedding album, 3-5 photo collage slots, ivory-gold print finish."],
  ["gallery-collage", "Gallery Collage", "Premium multi-photo gallery invite, overlapped frames va letterpress detail panel."],
  ["modern-minimal", "Modern Minimal", "Black-ivory magazine grid, large serif names, refined typography-first luxury."],
  ["royal-emerald", "Royal Emerald", "Emerald palace invitation, gold crest, arched ceremony frame, rich ornament."],
  ["golden-noor", "Golden Noor", "Ivory mihrab, luminous noor rays, refined arabesque gold details."],
  ["pearl-blush", "Pearl Blush", "Pearl photo-window, yumshoq luxury panel va capsule date."],
  ["midnight-starry", "Midnight Starry", "Noir-gold evening invitation, subtle stars, cinematic moonlit composition."],
  ["garden-bloom", "Garden Bloom", "Botanical luxury stationery, pressed florals, sage letterpress, soft photo frame."],
  ["silk-lilac", "Silk Lilac", "Pearl-lilac silk stationery, editorial photo cover, refined soft-luxury spacing."],
  ["desert-saffron", "Desert Saffron", "Terracotta luxe card, geometric border va saffron ink ceremony panel."],
  ["ocean-glass", "Ocean Glass", "Sea-glass invitation, translucent layers va pearl-blue shimmer."],
  ["velvet-ruby", "Velvet Ruby", "Ruby velvet theatre invite, gold ticket panel, dramatic monogram va ceremony lights."]
].map(([id, name, description]) => ({
  id,
  name,
  category: "wedding" as const,
  description,
  previewImageUrl: null,
  schema: weddingTemplateFields,
  status: "active" as const,
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString()
}));

const studioTemplates: InvitationTemplate[] = [
  {
    id: "studio-emerald-arch",
    name: "Emerald Arch Nikoh",
    description: "Zumrad saroy uslubi, oltin ark, monogram va formal nikoh kompozitsiyasi."
  },
  {
    id: "studio-blush-photo",
    name: "Blush Photo Nikoh",
    description: "Juftlik rasmi markazidagi yumshoq blush stationery va romantik tipografiya."
  },
  {
    id: "studio-editorial-mono",
    name: "Editorial Mono Nikoh",
    description: "Qora-ivory magazine layout, katta nomlar va zamonaviy editorial ritm."
  },
  {
    id: "studio-blue-fotiha",
    name: "Blue Fotiha",
    description: "Moviy-kumush fotiha taklifnomasi, doira kompozitsiya va sokin formal uslub."
  },
  {
    id: "studio-midnight-anniversary",
    name: "Midnight Yubiley",
    description: "Qora-oltin yubiley oqshomi, orbital bezak va premium evening atmosfera."
  }
].map((template) => ({
  ...template,
  category: "wedding" as const,
  previewImageUrl: null,
  schema: weddingTemplateFields,
  designDocument: seedTemplateDocuments[template.id as keyof typeof seedTemplateDocuments],
  status: "active" as const,
  createdAt: new Date("2026-06-08").toISOString(),
  updatedAt: new Date("2026-06-08").toISOString()
}));

export const seedTemplates: InvitationTemplate[] = [...studioTemplates, ...legacyTemplates];
