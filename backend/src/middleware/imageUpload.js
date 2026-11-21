import multer from "multer";
import { HttpError } from "../utils/HttpError.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_request, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new HttpError(415, "La imagen debe ser JPG, PNG o WebP."));
      return;
    }
    callback(null, true);
  },
});

export function verifyImageSignature(file) {
  const buffer = file.buffer;
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const isPng =
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";
  return (
    (file.mimetype === "image/jpeg" && isJpeg) ||
    (file.mimetype === "image/png" && isPng) ||
    (file.mimetype === "image/webp" && isWebp)
  );
}
