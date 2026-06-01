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
  ["classic-rose", "Classic Rose", "Floating heartlar va rose card bilan klassik romantik taklifnoma."],
  ["modern-minimal", "Modern Minimal", "Oq bo'sh joy, nozik line-art va sokin zamonaviy kompozitsiya."],
  ["royal-emerald", "Royal Emerald", "Zumrad fon, oltin seal va royal nikoh kayfiyati."],
  ["golden-noor", "Golden Noor", "Noor nuri, arabesque naqsh va iliq oltin atmosfera."],
  ["pearl-blush", "Pearl Blush", "Pearl rang, blush gradient va yumshoq luxury ko'rinish."],
  ["midnight-starry", "Midnight Starry", "Tun osmoni, yulduz zarralari va cinematic entrance."],
  ["garden-bloom", "Garden Bloom", "Gul bog'i, barg animatsiyasi va bahorona bayram kayfiyati."],
  ["silk-lilac", "Silk Lilac", "Ipak fon, lilac aksent va elegant editorial uslub."],
  ["desert-saffron", "Desert Saffron", "Saffron, qum to'lqinlari va sharqona iliq kompozitsiya."],
  ["ocean-glass", "Ocean Glass", "Shisha effekt, dengiz ranglari va yengil shimmer animatsiya."]
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
