import { z } from "zod";

const imageUrl = z
  .string()
  .url()
  .max(2048)
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol));

export const createAlertSchema = z.object({
  title: z.string().trim().min(4).max(100),
  description: z.string().trim().min(10).max(2000),
  area: z.enum(["Aseo", "TI", "Mantenimiento", "Construcción"]),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  location: z.string().trim().min(2).max(120),
  building: z.string().trim().min(2).max(120),
  photoUrl: imageUrl.optional(),
});

export const moderationSchema = z.object({
  valid: z.boolean(),
});

export const closureReviewSchema = z.object({
  approved: z.boolean(),
});

export const resolveAlertSchema = z.object({
  evidenceUrl: imageUrl.optional(),
});
