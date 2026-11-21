import "dotenv/config";
import mongoose from "mongoose";
import { getConfig } from "../src/config/env.js";
import { User } from "../src/models/User.js";

const name = process.env.NEW_USER_NAME?.trim();
const email = process.env.NEW_USER_EMAIL?.trim().toLowerCase();
const password = process.env.NEW_USER_PASSWORD;
const role = process.env.NEW_USER_ROLE;
const area = process.env.NEW_USER_AREA;
const validRoles = ["member", "manager", "admin"];
const validAreas = ["Aseo", "TI", "Mantenimiento", "Construcción"];

if (
  !name ||
  !email ||
  !password ||
  Buffer.byteLength(password, "utf8") > 72 ||
  password.length < 8 ||
  !validRoles.includes(role)
) {
  throw new Error(
    "Configura nombre, correo, rol y una contraseña de 8 a 72 bytes en backend/.env.",
  );
}
if (role === "manager" && !validAreas.includes(area)) {
  throw new Error("NEW_USER_AREA debe ser un área válida para usuarios encargados.");
}

try {
  const { mongodbUri } = getConfig();
  await mongoose.connect(mongodbUri);
  await User.create({ name, email, passwordHash: password, role, area });
  console.log(`Usuario ${email} creado con rol ${role}.`);
} catch (error) {
  console.error("No se pudo crear el usuario:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
