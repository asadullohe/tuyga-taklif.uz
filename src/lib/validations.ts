import { z } from "zod";

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
  guestCount: z.coerce.number().int().min(0).max(10)
});

export const createInvitationSchema = z.object({
  templateId: z.string().min(1),
  formData: weddingFormSchema
});

export const updateInvitationSchema = z.object({
  formData: weddingFormSchema
});

export const templateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  previewImageUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active")
});

export type WeddingFormInput = z.infer<typeof weddingFormSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
