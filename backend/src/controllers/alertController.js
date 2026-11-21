import mongoose from "mongoose";
import { Alert } from "../models/Alert.js";
import { User } from "../models/User.js";
import { Upload } from "../models/Upload.js";
import { HttpError } from "../utils/HttpError.js";
import { parseInput } from "../utils/validate.js";
import {
  closureReviewSchema,
  createAlertSchema,
  moderationSchema,
  resolveAlertSchema,
} from "../schemas/alertSchemas.js";
import { closureUpdate, moderationUpdate } from "../domain/alertWorkflow.js";

function canViewAlert(alert, user) {
  const reporterId = alert.reporterId?._id?.toString() ?? alert.reporterId?.toString();
  const managerId = alert.managerId?._id?.toString() ?? alert.managerId?.toString();
  return (
    user.role === "admin" ||
    reporterId === user.id ||
    managerId === user.id ||
    (user.role === "manager" && alert.area === user.area)
  );
}

function populateAlert(query) {
  return query
    .populate("reporterId", "name")
    .populate("managerId", "name");
}

function serializeAlert(alert) {
  const result = alert.toObject();
  result.id = alert.id;
  result.reporterId = alert.reporterId?._id?.toString() ?? alert.reporterId?.toString();
  result.reporterName = alert.reporterId?.name ?? "";
  result.managerId = alert.managerId?._id?.toString() ?? alert.managerId?.toString();
  result.managerName = alert.managerId?.name;
  const photoMediaId =
    alert.photoMediaId?._id?.toString() ?? alert.photoMediaId?.toString();
  const evidenceMediaId =
    alert.evidenceMediaId?._id?.toString() ?? alert.evidenceMediaId?.toString();
  result.photoUrl = photoMediaId
    ? `/api/uploads/${photoMediaId}`
    : result.photoUrl;
  result.evidenceUrl = evidenceMediaId
    ? `/api/uploads/${evidenceMediaId}`
    : result.evidenceUrl;
  delete result.photoMediaId;
  delete result.evidenceMediaId;
  result.createdAt = alert.createdAt?.getTime();
  delete result._id;
  delete result.__v;
  delete result.updatedAt;
  return result;
}

export async function listAlerts(request, response) {
  const query = {};
  if (request.user.role === "member") {
    query.reporterId = request.user.id;
  } else if (request.user.role === "manager") {
    query.area = request.user.area;
  }

  const alerts = await populateAlert(
    Alert.find(query).sort({ createdAt: -1 }).limit(200),
  );
  response.json({ alerts: alerts.map(serializeAlert) });
}

export async function listPendingModeration(_request, response) {
  const alerts = await populateAlert(
    Alert.find({ moderationStatus: "pending" }).sort({ createdAt: -1 }).limit(200),
  );
  response.json({ alerts: alerts.map(serializeAlert) });
}

export async function listPendingClosures(_request, response) {
  const alerts = await populateAlert(
    Alert.find({ status: "awaiting_review" }).sort({ createdAt: -1 }).limit(200),
  );
  response.json({ alerts: alerts.map(serializeAlert) });
}

export async function getAlert(request, response) {
  const alert = await populateAlert(Alert.findById(request.params.id));
  if (!alert) {
    throw new HttpError(404, "No encontramos esta alerta.");
  }
  if (!canViewAlert(alert, request.user)) {
    throw new HttpError(403, "No tienes permiso para ver esta alerta.");
  }
  response.json({ alert: serializeAlert(alert) });
}

export async function createAlert(request, response) {
  const input = parseInput(createAlertSchema, request.body);
  const { photoId, ...alertInput } = input;
  if (photoId) {
    const photo = await Upload.findOne({
      _id: photoId,
      uploadedBy: request.user.id,
      kind: "report",
    });
    if (!photo) {
      throw new HttpError(400, "La foto del reporte no está disponible.");
    }
  }
  const alert = await Alert.create({
    ...alertInput,
    ...(photoId ? { photoMediaId: photoId } : {}),
    reporterId: request.user.id,
    status: "new",
    moderationStatus: "pending",
  });
  const populated = await populateAlert(Alert.findById(alert.id));
  response.status(201).json({ alert: serializeAlert(populated) });
}

export async function acceptAlert(request, response) {
  const alertToAccept = await Alert.findById(request.params.id);
  if (!alertToAccept) {
    throw new HttpError(404, "No encontramos esta alerta.");
  }
  if (alertToAccept.area !== request.user.area) {
    throw new HttpError(403, "Esta alerta pertenece a otra área.");
  }
  const alert = await Alert.findOneAndUpdate(
    { _id: alertToAccept.id, status: "new" },
    { $set: { status: "in_progress", managerId: request.user.id } },
    { new: true, runValidators: true },
  );
  if (!alert) {
    throw new HttpError(409, "La alerta ya no está disponible para aceptar.");
  }
  response.json({ alert: serializeAlert(await populateAlert(Alert.findById(alert.id))) });
}

export async function releaseAlert(request, response) {
  const alert = await Alert.findOneAndUpdate(
    { _id: request.params.id, status: "in_progress", managerId: request.user.id },
    { $set: { status: "new" }, $unset: { managerId: 1 } },
    { new: true, runValidators: true },
  );
  if (!alert) {
    throw new HttpError(409, "No puedes liberar una alerta que no tienes asignada.");
  }
  response.json({ alert: serializeAlert(await populateAlert(Alert.findById(alert.id))) });
}

export async function resolveAlert(request, response) {
  const input = parseInput(resolveAlertSchema, request.body);
  const evidence = await Upload.findOne({
    _id: input.evidenceId,
    uploadedBy: request.user.id,
    kind: "evidence",
  });
  if (!evidence) {
    throw new HttpError(400, "La evidencia no está disponible.");
  }
  const alert = await Alert.findOneAndUpdate(
    { _id: request.params.id, status: "in_progress", managerId: request.user.id },
    {
      $set: {
        status: "awaiting_review",
        evidenceMediaId: input.evidenceId,
      },
    },
    { new: true, runValidators: true },
  );
  if (!alert) {
    throw new HttpError(409, "No puedes resolver una alerta que no tienes asignada.");
  }
  response.json({ alert: serializeAlert(await populateAlert(Alert.findById(alert.id))) });
}

export async function moderateAlert(request, response) {
  const input = parseInput(moderationSchema, request.body);
  const currentAlert = await Alert.findById(request.params.id);
  if (!currentAlert) {
    throw new HttpError(404, "No encontramos esta alerta.");
  }
  const update = moderationUpdate(currentAlert, input.valid);
  const alert = await Alert.findOneAndUpdate(
    { _id: currentAlert.id, moderationStatus: "pending", status: "new" },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!alert) {
    throw new HttpError(409, "La publicación fue revisada por otra sesión.");
  }
  response.json({ alert: serializeAlert(await populateAlert(Alert.findById(alert.id))) });
}

export async function reviewClosure(request, response) {
  const input = parseInput(closureReviewSchema, request.body);
  const currentAlert = await Alert.findById(request.params.id);
  if (!currentAlert) {
    throw new HttpError(404, "No encontramos esta alerta.");
  }
  const update = closureUpdate(currentAlert, input.approved);
  const alert = await Alert.findOneAndUpdate(
    { _id: currentAlert.id, status: "awaiting_review" },
    { $set: update },
    { new: true, runValidators: true },
  );
  if (!alert) {
    throw new HttpError(409, "El cierre fue revisado por otra sesión.");
  }
  response.json({ alert: serializeAlert(await populateAlert(Alert.findById(alert.id))) });
}

export async function getMemberPoints(request, response) {
  const userId = request.params.userId;
  if (request.user.role !== "admin" && request.user.id !== userId) {
    throw new HttpError(403, "Solo puedes consultar tus propios puntos.");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new HttpError(400, "El identificador de usuario no es válido.");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(404, "No encontramos este usuario.");
  }
  const points = 90 + (await Alert.countDocuments({
    reporterId: userId,
    status: "approved",
  })) * 10;
  response.json({ userId, points });
}
