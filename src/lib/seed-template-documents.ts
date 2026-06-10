import type {
  TemplateDocument,
  TemplateImageLayer,
  TemplateLayerPermissions,
  TemplateShapeLayer,
  TemplateTextLayer,
  WeddingFormData
} from "@/types";

const lockedPermissions: TemplateLayerPermissions = {
  editable: false,
  movable: false,
  resizable: false,
  rotatable: false,
  deletable: false,
  styleEditable: false
};

const textPermissions: TemplateLayerPermissions = {
  editable: true,
  movable: true,
  resizable: true,
  rotatable: true,
  deletable: false,
  styleEditable: true
};

const photoPermissions: TemplateLayerPermissions = {
  editable: true,
  movable: false,
  resizable: false,
  rotatable: false,
  deletable: false,
  styleEditable: true
};

type TextOptions = {
  binding?: keyof WeddingFormData;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  align?: TemplateTextLayer["align"];
  rotation?: number;
  permissions?: TemplateLayerPermissions;
};

function text(
  id: string,
  name: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: TextOptions = {}
): TemplateTextLayer {
  return {
    id,
    name,
    type: "text",
    x,
    y,
    width,
    height,
    rotation: options.rotation ?? 0,
    opacity: 1,
    locked: options.permissions === lockedPermissions,
    visible: true,
    permissions: options.permissions ?? textPermissions,
    text: value,
    binding: options.binding,
    color: options.color ?? "#1f2924",
    fontFamily: options.fontFamily ?? "Cormorant Garamond",
    fontSize: options.fontSize ?? 48,
    fontWeight: options.fontWeight ?? 500,
    lineHeight: options.lineHeight ?? 1.2,
    letterSpacing: options.letterSpacing ?? 0,
    align: options.align ?? "center"
  };
}

function shape(
  id: string,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  radius = 0,
  stroke = "transparent",
  strokeWidth = 0
): TemplateShapeLayer {
  return {
    id,
    name,
    type: "shape",
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    locked: true,
    visible: true,
    permissions: lockedPermissions,
    fill,
    stroke,
    strokeWidth,
    radius
  };
}

function image(
  id: string,
  name: string,
  src: string,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): TemplateImageLayer {
  return {
    id,
    name,
    type: "image",
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    permissions: photoPermissions,
    src,
    binding: "coverImageUrl",
    fit: "cover",
    radius
  };
}

export const emeraldArchDocument: TemplateDocument = {
  version: 1,
  width: 1080,
  height: 1920,
  background: "#07372d",
  layers: [
    shape("emerald-frame", "Oltin tashqi ramka", 44, 44, 992, 1832, "#07372d", 30, "#d8b66a", 3),
    shape("emerald-inner", "Ichki panel", 88, 88, 904, 1744, "#0b483b", 26, "#8f7440", 1),
    shape("emerald-arch", "Marosim arki", 174, 250, 732, 820, "#f6eddb", 360, "#d8b66a", 5),
    shape("emerald-seal", "Monogram doirasi", 420, 166, 240, 240, "#0b483b", 120, "#d8b66a", 4),
    text("emerald-monogram", "Monogram", "A · Z", 440, 226, 200, 95, {
      color: "#efd38f",
      fontSize: 46,
      letterSpacing: 8,
      permissions: lockedPermissions
    }),
    text("emerald-kicker", "Marosim turi", "NIKOH OQSHOMI", 220, 440, 640, 70, {
      color: "#8b6c35",
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: 12,
      permissions: lockedPermissions
    }),
    text("emerald-groom", "Kuyov ismi", "Ali", 210, 555, 660, 135, {
      binding: "groomName",
      color: "#12382e",
      fontSize: 98
    }),
    text("emerald-and", "Bog'lovchi", "&", 430, 690, 220, 85, {
      color: "#b48a40",
      fontSize: 70,
      permissions: lockedPermissions
    }),
    text("emerald-bride", "Kelin ismi", "Zebo", 210, 780, 660, 135, {
      binding: "brideName",
      color: "#12382e",
      fontSize: 98
    }),
    text("emerald-copy", "Taklif matni", "Sizni baxtiyor kunimizga lutfan taklif qilamiz.", 170, 1160, 740, 180, {
      binding: "hostText",
      color: "#f5ead4",
      fontSize: 38,
      lineHeight: 1.45
    }),
    shape("emerald-date-pill", "Sana paneli", 190, 1400, 700, 112, "#d8b66a", 56),
    text("emerald-date", "Sana", "2026-09-12", 220, 1418, 640, 78, {
      binding: "eventDate",
      color: "#07372d",
      fontSize: 40,
      fontWeight: 700,
      letterSpacing: 7
    }),
    text("emerald-time", "Vaqt", "18:00", 240, 1545, 600, 65, {
      binding: "eventTime",
      color: "#efd38f",
      fontSize: 34,
      letterSpacing: 6
    }),
    text("emerald-venue", "To'yxona", "Navro'z Palace", 130, 1640, 820, 80, {
      binding: "venueName",
      color: "#ffffff",
      fontSize: 42,
      fontWeight: 600
    }),
    text("emerald-address", "Manzil", "Toshkent shahri", 160, 1720, 760, 70, {
      binding: "venueAddress",
      color: "#c9d9d2",
      fontSize: 26
    })
  ]
};

export const blushPhotoDocument: TemplateDocument = {
  version: 1,
  width: 1080,
  height: 1920,
  background: "#f2dfe1",
  layers: [
    shape("blush-paper", "Ivory panel", 54, 54, 972, 1812, "#fffaf5", 42),
    shape("blush-shadow", "Foto soyasi", 152, 164, 776, 752, "#cda7aa", 390),
    image(
      "blush-photo",
      "Juftlik rasmi",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85",
      174,
      142,
      732,
      752,
      366
    ),
    shape("blush-ribbon", "Sarlavha lentasi", 260, 820, 560, 90, "#9c5360", 45),
    text("blush-kicker", "Marosim turi", "BIZNING KUNIMIZ", 290, 839, 500, 52, {
      color: "#fffaf5",
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 9,
      permissions: lockedPermissions
    }),
    text("blush-groom", "Kuyov ismi", "Ali", 130, 990, 820, 120, {
      binding: "groomName",
      color: "#4c3035",
      fontSize: 88
    }),
    text("blush-and", "Bog'lovchi", "va", 420, 1115, 240, 70, {
      color: "#b36a76",
      fontSize: 38,
      fontFamily: "Great Vibes",
      permissions: lockedPermissions
    }),
    text("blush-bride", "Kelin ismi", "Zebo", 130, 1195, 820, 120, {
      binding: "brideName",
      color: "#4c3035",
      fontSize: 88
    }),
    text("blush-copy", "Taklif matni", "Quvonchli kunimizni siz bilan baham ko'rishni istaymiz.", 180, 1370, 720, 150, {
      binding: "hostText",
      color: "#755f63",
      fontSize: 34,
      lineHeight: 1.45
    }),
    text("blush-date", "Sana", "2026-09-12", 165, 1570, 350, 75, {
      binding: "eventDate",
      color: "#9c5360",
      fontSize: 34,
      fontWeight: 700,
      align: "left"
    }),
    text("blush-time", "Vaqt", "18:00", 565, 1570, 350, 75, {
      binding: "eventTime",
      color: "#9c5360",
      fontSize: 34,
      fontWeight: 700,
      align: "right"
    }),
    shape("blush-line", "Ajratuvchi chiziq", 180, 1665, 720, 2, "#d6aab0"),
    text("blush-venue", "To'yxona", "Navro'z Palace", 140, 1705, 800, 70, {
      binding: "venueName",
      color: "#4c3035",
      fontSize: 38,
      fontWeight: 600
    }),
    text("blush-address", "Manzil", "Toshkent shahri", 150, 1770, 780, 52, {
      binding: "venueAddress",
      color: "#8a777a",
      fontSize: 24
    })
  ]
};

export const editorialMonoDocument: TemplateDocument = {
  version: 1,
  width: 1080,
  height: 1920,
  background: "#f3efe6",
  layers: [
    shape("mono-sidebar", "Qora ustun", 0, 0, 196, 1920, "#161616"),
    shape("mono-top-line", "Yuqori chiziq", 250, 110, 740, 8, "#161616"),
    text("mono-number", "Nashr raqami", "№ 01", 32, 100, 130, 90, {
      color: "#f3efe6",
      fontFamily: "Courier New",
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: 3,
      permissions: lockedPermissions
    }),
    text("mono-vertical", "Yon yozuv", "WEDDING EDITION · 2026", -540, 850, 1280, 70, {
      color: "#f3efe6",
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 12,
      rotation: -90,
      permissions: lockedPermissions
    }),
    text("mono-kicker", "Marosim turi", "NIKOH / TAKLIFNOMA", 250, 160, 690, 70, {
      color: "#161616",
      fontFamily: "Arial",
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: 10,
      align: "left",
      permissions: lockedPermissions
    }),
    text("mono-groom", "Kuyov ismi", "ALI", 240, 330, 790, 240, {
      binding: "groomName",
      color: "#161616",
      fontFamily: "Georgia",
      fontSize: 158,
      fontWeight: 700,
      lineHeight: 0.9,
      align: "left"
    }),
    text("mono-bride", "Kelin ismi", "ZEBO", 240, 570, 790, 240, {
      binding: "brideName",
      color: "#161616",
      fontFamily: "Georgia",
      fontSize: 158,
      fontWeight: 700,
      lineHeight: 0.9,
      align: "left"
    }),
    shape("mono-block", "Qora info panel", 250, 930, 740, 390, "#161616"),
    text("mono-copy", "Taklif matni", "Sizni hayotimizning yangi sahifasi ochiladigan oqshomga taklif qilamiz.", 305, 985, 630, 180, {
      binding: "hostText",
      color: "#f3efe6",
      fontFamily: "Georgia",
      fontSize: 38,
      lineHeight: 1.35,
      align: "left"
    }),
    text("mono-date", "Sana", "2026-09-12", 305, 1190, 350, 70, {
      binding: "eventDate",
      color: "#d6ff55",
      fontFamily: "Arial",
      fontSize: 34,
      fontWeight: 700,
      align: "left"
    }),
    text("mono-time", "Vaqt", "18:00", 710, 1190, 220, 70, {
      binding: "eventTime",
      color: "#d6ff55",
      fontFamily: "Arial",
      fontSize: 34,
      fontWeight: 700,
      align: "right"
    }),
    text("mono-venue-label", "Joy label", "LOCATION", 250, 1435, 700, 55, {
      color: "#6f6c65",
      fontFamily: "Arial",
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: 10,
      align: "left",
      permissions: lockedPermissions
    }),
    text("mono-venue", "To'yxona", "Navro'z Palace", 250, 1505, 740, 95, {
      binding: "venueName",
      color: "#161616",
      fontSize: 52,
      fontWeight: 700,
      align: "left"
    }),
    text("mono-address", "Manzil", "Toshkent shahri", 250, 1615, 720, 100, {
      binding: "venueAddress",
      color: "#5d5a55",
      fontFamily: "Arial",
      fontSize: 28,
      lineHeight: 1.4,
      align: "left"
    }),
    shape("mono-bottom-line", "Pastki chiziq", 250, 1780, 740, 8, "#d6ff55")
  ]
};

export const blueFotihaDocument: TemplateDocument = {
  version: 1,
  width: 1080,
  height: 1920,
  background: "#102b4e",
  layers: [
    shape("fotiha-frame", "Kumush ramka", 52, 52, 976, 1816, "#102b4e", 34, "#b8cce0", 3),
    shape("fotiha-panel", "Oq markaz", 112, 220, 856, 1480, "#f6f2e9", 428),
    shape("fotiha-top-dot", "Yuqori bezak", 465, 116, 150, 150, "#b8cce0", 75),
    text("fotiha-symbol", "Bezak belgisi", "✦", 485, 146, 110, 90, {
      color: "#102b4e",
      fontSize: 55,
      permissions: lockedPermissions
    }),
    text("fotiha-kicker", "Marosim turi", "FOTIHA MAROSIMI", 210, 390, 660, 70, {
      color: "#466783",
      fontFamily: "Arial",
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: 11,
      permissions: lockedPermissions
    }),
    text("fotiha-groom", "Yigit ismi", "Ali", 190, 570, 700, 130, {
      binding: "groomName",
      color: "#102b4e",
      fontSize: 98
    }),
    text("fotiha-and", "Bog'lovchi", "— va —", 340, 720, 400, 65, {
      color: "#7893aa",
      fontSize: 30,
      letterSpacing: 5,
      permissions: lockedPermissions
    }),
    text("fotiha-bride", "Qiz ismi", "Zebo", 190, 805, 700, 130, {
      binding: "brideName",
      color: "#102b4e",
      fontSize: 98
    }),
    text("fotiha-copy", "Taklif matni", "Azizlar, sizni fotiha marosimimiz dasturxoniga taklif qilamiz.", 190, 1045, 700, 180, {
      binding: "hostText",
      color: "#536979",
      fontSize: 36,
      lineHeight: 1.45
    }),
    shape("fotiha-date", "Sana doirasi", 300, 1285, 210, 210, "#102b4e", 105),
    text("fotiha-date-text", "Sana", "2026-09-12", 315, 1342, 180, 95, {
      binding: "eventDate",
      color: "#ffffff",
      fontFamily: "Arial",
      fontSize: 25,
      fontWeight: 700,
      lineHeight: 1.2
    }),
    shape("fotiha-time", "Vaqt doirasi", 570, 1285, 210, 210, "#b8cce0", 105),
    text("fotiha-time-text", "Vaqt", "18:00", 590, 1342, 170, 95, {
      binding: "eventTime",
      color: "#102b4e",
      fontFamily: "Arial",
      fontSize: 29,
      fontWeight: 700
    }),
    text("fotiha-venue", "Manzil nomi", "Navro'z Palace", 150, 1560, 780, 70, {
      binding: "venueName",
      color: "#f6f2e9",
      fontSize: 40,
      fontWeight: 600
    }),
    text("fotiha-address", "Manzil", "Toshkent shahri", 150, 1640, 780, 70, {
      binding: "venueAddress",
      color: "#b8cce0",
      fontSize: 25
    })
  ]
};

export const midnightAnniversaryDocument: TemplateDocument = {
  version: 1,
  width: 1080,
  height: 1920,
  background: "#111018",
  layers: [
    shape("night-frame", "Oltin ramka", 55, 55, 970, 1810, "#111018", 20, "#caa45d", 3),
    shape("night-orbit-one", "Birinchi orbita", 180, 210, 720, 720, "transparent", 360, "#6d5936", 2),
    shape("night-orbit-two", "Ikkinchi orbita", 255, 285, 570, 570, "transparent", 285, "#caa45d", 1),
    shape("night-moon", "Oltin oy", 420, 360, 240, 240, "#caa45d", 120),
    text("night-years", "Yubiley soni", "10", 445, 398, 190, 150, {
      color: "#111018",
      fontFamily: "Georgia",
      fontSize: 104,
      fontWeight: 700,
      permissions: lockedPermissions
    }),
    text("night-kicker", "Tadbir turi", "BIRGA O'TGAN YILLAR", 180, 965, 720, 60, {
      color: "#caa45d",
      fontFamily: "Arial",
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: 10,
      permissions: lockedPermissions
    }),
    text("night-groom", "Birinchi ism", "Ali", 120, 1060, 390, 120, {
      binding: "groomName",
      color: "#fff7e8",
      fontSize: 82,
      align: "right"
    }),
    text("night-and", "Bog'lovchi", "&", 480, 1080, 120, 90, {
      color: "#caa45d",
      fontSize: 58,
      permissions: lockedPermissions
    }),
    text("night-bride", "Ikkinchi ism", "Zebo", 570, 1060, 390, 120, {
      binding: "brideName",
      color: "#fff7e8",
      fontSize: 82,
      align: "left"
    }),
    text("night-copy", "Taklif matni", "Muhabbat va xotiralarga boy oqshomimizga sizni taklif qilamiz.", 170, 1250, 740, 170, {
      binding: "hostText",
      color: "#c8c3bb",
      fontSize: 36,
      lineHeight: 1.45
    }),
    shape("night-line", "Oltin chiziq", 260, 1470, 560, 2, "#caa45d"),
    text("night-date", "Sana", "2026-09-12", 150, 1525, 370, 75, {
      binding: "eventDate",
      color: "#caa45d",
      fontFamily: "Arial",
      fontSize: 32,
      fontWeight: 700
    }),
    text("night-time", "Vaqt", "18:00", 560, 1525, 370, 75, {
      binding: "eventTime",
      color: "#caa45d",
      fontFamily: "Arial",
      fontSize: 32,
      fontWeight: 700
    }),
    text("night-venue", "Tadbir joyi", "Navro'z Palace", 140, 1660, 800, 75, {
      binding: "venueName",
      color: "#fff7e8",
      fontSize: 40,
      fontWeight: 600
    }),
    text("night-address", "Manzil", "Toshkent shahri", 150, 1735, 780, 60, {
      binding: "venueAddress",
      color: "#817c75",
      fontSize: 25
    })
  ]
};

export const seedTemplateDocuments = {
  "studio-emerald-arch": emeraldArchDocument,
  "studio-blush-photo": blushPhotoDocument,
  "studio-editorial-mono": editorialMonoDocument,
  "studio-blue-fotiha": blueFotihaDocument,
  "studio-midnight-anniversary": midnightAnniversaryDocument
} satisfies Record<string, TemplateDocument>;
