import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { getConfig } from "./config/env.js";

const config = getConfig();
const app = createApp(config);

mongoose.connection.on("disconnected", () => {
  console.error("Se perdió la conexión con MongoDB.");
});

try {
  await connectDatabase(config.mongodbUri);
  const server = app.listen(config.port, () => {
    console.log(`Fixly API escuchando en http://localhost:${config.port}`);
  });

  async function shutdown() {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
} catch (error) {
  console.error("No se pudo iniciar Fixly API:", error.message);
  process.exitCode = 1;
}
