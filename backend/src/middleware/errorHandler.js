import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";

export function errorHandler(error, _request, response, _next) {
  if (response.headersSent) {
    return;
  }

  if (error?.code === 11000) {
    response.status(409).json({ error: "Ya existe una cuenta con ese correo." });
    return;
  }
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "La imagen no puede superar los 5 MB."
        : "No se pudo procesar la imagen.";
    response.status(400).json({ error: message });
    return;
  }
  if (error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: "El identificador no es válido." });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError || error instanceof ZodError) {
    response.status(400).json({ error: "Los datos enviados no son válidos." });
    return;
  }

  const status = Number.isInteger(error?.status) ? error.status : 500;
  if (status >= 500) {
    console.error(error);
  }
  response.status(status).json({
    error: status >= 500 ? "Ocurrió un error interno." : error.message,
  });
}
