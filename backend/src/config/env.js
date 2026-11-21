import "dotenv/config";

export function getConfig() {
  const { MONGODB_URI, JWT_SECRET } = process.env;

  if (!MONGODB_URI) {
    throw new Error("Falta configurar MONGODB_URI en backend/.env.");
  }
  if (
    !JWT_SECRET ||
    JWT_SECRET.length < 32 ||
    JWT_SECRET.startsWith("replace-this")
  ) {
    throw new Error(
      "Configura JWT_SECRET con una clave aleatoria de al menos 32 caracteres.",
    );
  }

  return {
    mongodbUri: MONGODB_URI,
    jwtSecret: JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    port: Number(process.env.PORT) || 3000,
    clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:8081")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
