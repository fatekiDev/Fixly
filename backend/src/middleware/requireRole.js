import { HttpError } from "../utils/HttpError.js";

export function requireRole(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      next(new HttpError(403, "No tienes permisos para realizar esta acción."));
      return;
    }
    next();
  };
}
