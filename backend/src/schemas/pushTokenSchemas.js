import { z } from "zod";

const expoPushTokenPattern = /^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$/;

export const pushTokenSchema = z.object({
  token: z.string().trim().regex(expoPushTokenPattern, "El token de notificaciones no es válido."),
});
