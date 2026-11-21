import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export function createApp(config) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        const error = new Error("Origen no permitido por CORS.");
        error.status = 403;
        callback(error);
      },
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_request, response) => {
    response.json({
      name: "Fixly API",
      status: "running",
      health: "/api/health",
      live: "/api/health/live",
    });
  });
  app.get("/api/health/live", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.get("/api/health", (_request, response) => {
    const connected = mongoose.connection.readyState === 1;
    response.status(connected ? 200 : 503).json({
      status: connected ? "ok" : "unavailable",
      database: connected ? "connected" : "disconnected",
    });
  });
  app.use("/api/auth", authRoutes);
  app.use("/api/alerts", alertRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
