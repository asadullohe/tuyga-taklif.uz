import { z } from "zod";

const layerPermissionsSchema = z.object({
  editable: z.boolean(),
  movable: z.boolean(),
  resizable: z.boolean(),
  rotatable: z.boolean(),
  deletable: z.boolean(),
  styleEditable: z.boolean(),
  cropEditable: z.boolean().optional()
});

const layerBaseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
  locked: z.boolean(),
  visible: z.boolean(),
  groupId: z.string().min(1).optional(),
  permissions: layerPermissionsSchema.optional(),
  motion: z
    .object({
      startMs: z.number().min(0),
      durationMs: z.number().min(0),
      endMs: z.number().min(0).default(6000),
      exitDurationMs: z.number().min(0).default(500),
      easing: z.enum(["linear", "ease-in", "ease-out", "ease-in-out"]),
      enter: z.enum(["none", "fade", "rise", "slide-left", "slide-right", "zoom"]),
      exit: z.enum(["none", "fade", "rise", "slide-left", "slide-right", "zoom"]).default("none"),
      textEffect: z
        .enum(["none", "typewriter", "word-reveal", "letter-reveal", "tracking", "wipe"])
        .default("none")
    })
    .optional(),
  shadow: z
    .object({
      color: z.string().min(1),
      blur: z.number().min(0),
      x: z.number(),
      y: z.number()
    })
    .optional(),
  blur: z.number().min(0).optional()
});

const textLayerSchema = layerBaseSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  binding: z
    .enum([
      "brideName",
      "groomName",
      "eventDate",
      "eventTime",
      "venueName",
      "venueAddress",
      "hostText",
      "coverImageUrl",
      "musicUrl"
    ])
    .optional(),
  color: z.string().min(1),
  fontFamily: z.string().min(1),
  fontSize: z.number().positive(),
  fontWeight: z.number().min(100).max(900),
  lineHeight: z.number().positive(),
  letterSpacing: z.number(),
  align: z.enum(["left", "center", "right"])
});

const shapeLayerSchema = layerBaseSchema.extend({
  type: z.literal("shape"),
  fill: z.string().min(1),
  stroke: z.string(),
  strokeWidth: z.number().min(0),
  radius: z.number().min(0),
  backgroundImage: z
    .object({
      src: z.string().url(),
      fit: z.enum(["cover", "contain"]),
      position: z.enum(["center", "top", "bottom"]),
      opacity: z.number().min(0).max(1)
    })
    .optional()
});

const imageLayerSchema = layerBaseSchema.extend({
  type: z.literal("image"),
  src: z.string(),
  binding: z.literal("coverImageUrl").optional(),
  fit: z.enum(["cover", "contain"]),
  radius: z.number().min(0),
  crop: z
    .object({
      x: z.number().min(0),
      y: z.number().min(0),
      width: z.number().positive(),
      height: z.number().positive()
    })
    .optional(),
  focalX: z.number().min(0).max(1).optional(),
  focalY: z.number().min(0).max(1).optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional()
});

const ornamentLayerSchema = layerBaseSchema.extend({
  type: z.literal("ornament"),
  ornament: z.enum([
    "floral-corner",
    "olive-branch",
    "royal-divider",
    "islamic-arch",
    "art-deco-fan",
    "sparkle-cluster",
    "wax-seal",
    "double-ring"
  ]),
  color: z.string().min(1),
  secondaryColor: z.string().min(1),
  strokeWidth: z.number().positive()
});

const countdownLayerSchema = layerBaseSchema.extend({
  type: z.literal("countdown"),
  title: z.string(),
  titleColor: z.string().min(1).default("#7d6a49"),
  titleFontFamily: z.string().min(1).default("Cormorant Garamond"),
  titleFontSize: z.number().positive().default(26),
  titleFontWeight: z.number().min(100).max(900).default(600),
  titleLetterSpacing: z.number().default(1),
  titleAlign: z.enum(["left", "center", "right"]).default("center"),
  titleMarginBottom: z.number().min(0).default(12),
  color: z.string().min(1),
  labelColor: z.string().min(1),
  panelColor: z.string().min(1),
  fontFamily: z.string().min(1),
  valueFontSize: z.number().positive(),
  valueFontWeight: z.number().min(100).max(900).default(700),
  labelFontSize: z.number().positive(),
  labelFontWeight: z.number().min(100).max(900).default(500),
  labelLetterSpacing: z.number().default(0),
  gap: z.number().min(0),
  radius: z.number().min(0),
  panelStroke: z.string().default("rgba(125,106,73,0.2)"),
  panelStrokeWidth: z.number().min(0).default(1),
  showSeconds: z.boolean(),
  timezoneOffsetMinutes: z.number().int().min(-720).max(840)
});

const designDocumentSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  width: z.number().positive(),
  height: z.number().positive(),
  background: z.string().min(1),
  backgroundImage: z
    .object({
      src: z.string().url(),
      fit: z.enum(["cover", "contain"]),
      position: z.enum(["center", "top", "bottom"]),
      opacity: z.number().min(0).max(1)
    })
    .optional(),
  layers: z.array(
    z.discriminatedUnion("type", [
      textLayerSchema,
      shapeLayerSchema,
      imageLayerSchema,
      ornamentLayerSchema,
      countdownLayerSchema
    ])
  ),
  timeline: z.object({ durationMs: z.number().positive() }).optional()
});

export const weddingFormSchema = z.object({
  brideName: z.string().min(2, "Kelin ismi kamida 2 ta belgidan iborat bo'lishi kerak"),
  groomName: z.string().min(2, "Kuyov ismi kamida 2 ta belgidan iborat bo'lishi kerak"),
  eventDate: z.string().min(1, "To'y sanasini kiriting"),
  eventTime: z.string().min(1, "To'y vaqtini kiriting"),
  venueName: z.string().min(2, "To'yxona nomini kiriting"),
  venueAddress: z.string().min(5, "Manzilni to'liqroq kiriting"),
  hostText: z.string().min(10, "Taklif matni kamida 10 ta belgidan iborat bo'lishi kerak"),
  coverImageUrl: z.string().url("Rasm URL noto'g'ri").optional().or(z.literal("")),
  musicUrl: z.string().url("Musiqa URL noto'g'ri").optional().or(z.literal(""))
});

export const rsvpSchema = z.object({
  guestName: z.string().min(2, "Ismingizni kiriting"),
  status: z.enum(["attending", "not_attending"]),
  guestCount: z.coerce.number().int().min(0).max(10),
  reminderEnabled: z.boolean().default(false)
});

export const createInvitationSchema = z.object({
  templateId: z.string().min(1),
  formData: weddingFormSchema
});

export const updateInvitationSchema = z.object({
  formData: weddingFormSchema,
  designDocument: designDocumentSchema.nullable().optional()
});

export const templateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  previewImageUrl: z.string().url().optional().or(z.literal("")),
  designDocument: designDocumentSchema.optional(),
  revision: z.number().int().positive().optional(),
  status: z.enum(["active", "inactive"]).default("active")
});

export type WeddingFormInput = z.infer<typeof weddingFormSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
