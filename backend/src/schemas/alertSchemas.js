import { z } from "zod";

export const createAlertSchema = z.object({
  title: z.string().trim().min(4).max(100),
  description: z.string().trim().min(10).max(2000),
  area: z.enum(["Aseo", "TI", "Mantenimiento", "Construcción"]),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
  location: z.string().trim().min(2).max(120),
  building: z.string().trim().min(2).max(120),
  photoId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
});

export const moderationSchema = z.object({
  valid: z.boolean(),
});

export const closureReviewSchema = z.object({
  approved: z.boolean(),
});

export const resolveAlertSchema = z.object({
  evidenceId: z.string().regex(/^[a-f\d]{24}$/i),
});
