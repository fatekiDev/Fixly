import jwt from "jsonwebtoken";
import { getConfig } from "../config/env.js";
import { HttpError } from "../utils/HttpError.js";
import { User } from "../models/User.js";

export async function authenticate(request, _response, next) {
  try {
    const authorization = request.get("authorization");
    const [scheme, token] = authorization?.split(" ") ?? [];
    if (scheme !== "Bearer" || !token) {
      throw new HttpError(401, "Debes iniciar sesión para continuar.");
    }

    const payload = jwt.verify(token, getConfig().jwtSecret);
    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      throw new HttpError(401, "La sesión no es válida.");
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new HttpError(401, "La sesión ya no corresponde a un usuario activo.");
    }

    request.user = user;
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new HttpError(401, "La sesión no es válida o expiró."));
      return;
    }
    next(error);
  }
}
