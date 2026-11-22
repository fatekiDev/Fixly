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
  reassignAlertSchema,
  resolveAlertSchema,
} from "../schemas/alertSchemas.js";
import { closureUpdate, moderationUpdate } from "../domain/alertWorkflow.js";
import { dispatchPushNotification } from "../services/pushNotifications.js";

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
  await dispatchPushNotification(
    { role: "manager", area: alert.area },
    {
      title: "Nueva alerta para tu área",
      body: `Hay una nueva alerta en ${alert.area}.`,
      data: { alertId: alert.id, destination: "manager" },
    },
  );
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
  await dispatchPushNotification(
    { _id: alert.reporterId },
    {
      title: "Actualización de tu alerta",
      body: "Un encargado comenzó a atender tu alerta.",
      data: { alertId: alert.id, destination: "member" },
    },
  );
  response.json({ alert: serializeAlert(await populateAlert(Alert.findById(alert.id))) });
}

export async function reassignAlert(request, response) {
  const input = parseInput(reassignAlertSchema, request.body);
  if (input.area === request.user.area) {
    throw new HttpError(400, "Selecciona un área distinta a la actual.");
  }

  const destinationManager = await User.findOne({
    role: "manager",
    area: input.area,
  }).select("_id");
  if (!destinationManager) {
    throw new HttpError(409, "No hay un encargado registrado para esa área.");
  }

  const alert = await Alert.findOneAndUpdate(
    { _id: request.params.id, area: request.user.area, status: "new" },
    { $set: { area: input.area }, $unset: { managerId: 1 } },
    { new: true, runValidators: true },
  );
  if (!alert) {
    const existingAlert = await Alert.exists({ _id: request.params.id });
    if (!existingAlert) {
      throw new HttpError(404, "No encontramos esta alerta.");
    }
    throw new HttpError(
      409,
      "Solo puedes derivar alertas nuevas que correspondan a tu área.",
    );
  }

  await dispatchPushNotification(
    { role: "manager", area: input.area },
    {
      title: "Alerta derivada a tu área",
      body: `Hay una alerta pendiente en ${input.area}.`,
      data: { alertId: alert.id, destination: "manager" },
    },
  );
  response.json({
    alert: serializeAlert(await populateAlert(Alert.findById(alert.id))),
  });
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
  await dispatchPushNotification(
    { _id: alert.reporterId },
    {
      title: "Actualización de tu alerta",
      body: "Tu alerta volvió a estar pendiente.",
      data: { alertId: alert.id, destination: "member" },
    },
  );
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
  await Promise.all([
    dispatchPushNotification(
      { _id: alert.reporterId },
      {
        title: "Actualización de tu alerta",
        body: "Tu alerta fue resuelta y espera revisión.",
        data: { alertId: alert.id, destination: "member" },
      },
    ),
    dispatchPushNotification(
      { role: "admin" },
      {
        title: "Cierre pendiente de revisión",
        body: "Hay un cierre de alerta esperando tu revisión.",
        data: { alertId: alert.id, destination: "admin" },
      },
    ),
  ]);
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
  await dispatchPushNotification(
    { _id: alert.reporterId },
    {
      title: "Actualización de tu alerta",
      body: input.valid
        ? "Tu alerta fue aprobada para su gestión."
        : "Tu alerta fue declinada por administración.",
      data: { alertId: alert.id, destination: "member" },
    },
  );
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
  await dispatchPushNotification(
    { _id: alert.reporterId },
    {
      title: "Actualización de tu alerta",
      body: input.approved
        ? "Administración aprobó el cierre de tu alerta."
        : "Administración solicitó continuar trabajando en tu alerta.",
      data: { alertId: alert.id, destination: "member" },
    },
  );
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
