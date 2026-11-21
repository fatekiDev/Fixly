import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Alert } from "../models/Alert.js";
import { Upload } from "../models/Upload.js";
import { HttpError } from "../utils/HttpError.js";
import { verifyImageSignature } from "../middleware/imageUpload.js";

const uploadsDirectory = fileURLToPath(new URL("../../uploads/", import.meta.url));
const extensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function canViewAlert(alert, userId, role, area) {
  return (
    role === "admin" ||
    alert.reporterId.toString() === userId ||
    alert.managerId?.toString() === userId ||
    (role === "manager" && alert.area === area)
  );
}

export async function uploadImage(request, response) {
  const { file } = request;
  if (!file) {
    throw new HttpError(400, "Selecciona una imagen para subir.");
  }
  if (!verifyImageSignature(file)) {
    throw new HttpError(415, "El archivo no contiene una imagen JPG, PNG o WebP válida.");
  }

  const kind = request.query.kind;
  if (kind !== "report" && kind !== "evidence") {
    throw new HttpError(400, "Indica si la imagen es para un reporte o una evidencia.");
  }

  await mkdir(uploadsDirectory, { recursive: true });
  const filename = `${randomUUID()}${extensions[file.mimetype]}`;
  const fullPath = path.join(uploadsDirectory, filename);
  await writeFile(fullPath, file.buffer, { flag: "wx" });

  try {
    const upload = await Upload.create({
      uploadedBy: request.user.id,
      kind,
      filename,
      contentType: file.mimetype,
      size: file.size,
    });
    response.status(201).json({
      id: upload.id,
      url: `/api/uploads/${upload.id}`,
    });
  } catch (error) {
    await unlink(fullPath);
    throw error;
  }
}

export async function getImage(request, response) {
  const upload = await Upload.findById(request.params.id);
  if (!upload) {
    throw new HttpError(404, "No encontramos esta imagen.");
  }

  let allowed = upload.uploadedBy.toString() === request.user.id || request.user.role === "admin";
  if (!allowed) {
    const linkedAlert = await Alert.findOne({
      $or: [{ photoMediaId: upload.id }, { evidenceMediaId: upload.id }],
    });
    allowed =
      linkedAlert != null &&
      canViewAlert(linkedAlert, request.user.id, request.user.role, request.user.area);
  }
  if (!allowed) {
    throw new HttpError(403, "No tienes permiso para ver esta imagen.");
  }

  const fullPath = path.join(uploadsDirectory, upload.filename);
  response.type(upload.contentType);
  response.set("Cache-Control", "private, no-store");
  response.set("X-Content-Type-Options", "nosniff");
  response.sendFile(fullPath, (error) => {
    if (error && !response.headersSent) {
      response.status(error.statusCode || 500).json({ error: "No pudimos leer la imagen." });
    }
  });
}
