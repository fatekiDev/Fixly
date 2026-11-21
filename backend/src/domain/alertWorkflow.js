import { HttpError } from "../utils/HttpError.js";

export function moderationUpdate(alert, valid) {
  if (alert.moderationStatus !== "pending" || alert.status !== "new") {
    throw new HttpError(409, "Esta publicación ya fue revisada o no está pendiente.");
  }
  return {
    moderationStatus: valid ? "approved" : "declined",
    status: valid ? "new" : "declined",
  };
}

export function closureUpdate(alert, approved) {
  if (alert.status !== "awaiting_review") {
    throw new HttpError(409, "Este cierre ya fue revisado o no está pendiente.");
  }
  return { status: approved ? "approved" : "in_progress" };
}
