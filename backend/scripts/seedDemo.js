import "dotenv/config";
import mongoose from "mongoose";
import { getConfig } from "../src/config/env.js";
import { Alert } from "../src/models/Alert.js";
import { User } from "../src/models/User.js";

async function ensureUser({ name, email, role, area }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      passwordHash: "1234",
      role,
      ...(area ? { area } : {}),
    });
  } else {
    user.name = name;
    user.role = role;
    user.area = area;
    await user.save();
  }
  return user;
}

async function ensureManager({ name, email, area }) {
  const [existingAccount, legacyAccount] = await Promise.all([
    User.findOne({ email }),
    area === "Mantenimiento"
      ? User.findOne({ email: "encargado@fixly.cl", role: "manager" })
      : null,
  ]);
  if (
    existingAccount &&
    legacyAccount &&
    existingAccount.id !== legacyAccount.id
  ) {
    throw new Error(
      "Hay dos cuentas para Mantenimiento. Resuelve la cuenta encargado@fixly.cl antes de cargar la demo.",
    );
  }

  if (legacyAccount) {
    legacyAccount.name = name;
    legacyAccount.email = email;
    legacyAccount.area = area;
    await legacyAccount.save();
    return legacyAccount;
  }

  return ensureUser({ name, email, role: "manager", area });
}

try {
  const { mongodbUri } = getConfig();
  await mongoose.connect(mongodbUri);

  const member = await ensureUser({
    name: "Ana Miembro",
    email: "miembro@fixly.cl",
    role: "member",
  });
  const pedro = await ensureUser({
    name: "Pedro Reportante",
    email: "pedro@fixly.cl",
    role: "member",
  });
  const managers = {};
  for (const { name, email, area } of [
    { name: "Encargado de Aseo", email: "aseo@fixly.cl", area: "Aseo" },
    { name: "Encargado de TI", email: "ti@fixly.cl", area: "TI" },
    {
      name: "Encargado de Mantenimiento",
      email: "mantenimiento@fixly.cl",
      area: "Mantenimiento",
    },
    {
      name: "Encargado de Construcción",
      email: "construccion@fixly.cl",
      area: "Construcción",
    },
  ]) {
    managers[area] = await ensureManager({ name, email, area });
  }
  const admin = await ensureUser({
    name: "Admin Fixly",
    email: "admin@fixly.cl",
    role: "admin",
  });

  const now = Date.now();
  const minutesAgo = (minutes) => new Date(now - minutes * 60_000);
  const hoursAgo = (hours) => new Date(now - hours * 60 * 60_000);
  const daysAgo = (days) => new Date(now - days * 24 * 60 * 60_000);
  const pedroId = pedro.id;
  const demoAlerts = [
    { title: "Silla sin pernos", description: "La silla del puesto 5 no tiene pernos y se mueve al sentarse.", location: "Laboratorio 3", building: "Edificio B", area: "Mantenimiento", urgency: "high", status: "in_progress", moderationStatus: "approved", reporterId: member.id, managerId: managers.Mantenimiento.id, createdAt: minutesAgo(20) },
    { title: "Enchufe suelto en sala 201", description: "El enchufe está suelto y se mueve al conectar equipos.", location: "Sala 201", building: "Edificio A", area: "TI", urgency: "high", status: "new", moderationStatus: "approved", reporterId: pedroId, createdAt: hoursAgo(1) },
    { title: "Foco quemado en pasillo B", description: "El foco del pasillo dejó de funcionar durante la tarde.", location: "Pasillo B", building: "Edificio B", area: "Mantenimiento", urgency: "medium", status: "new", moderationStatus: "approved", reporterId: member.id, createdAt: hoursAgo(3) },
    { title: "Puerta del baño no cierra", description: "La puerta del baño del segundo piso no cierra correctamente.", location: "Baño, piso 2", building: "Edificio B", area: "Mantenimiento", urgency: "low", status: "new", moderationStatus: "approved", reporterId: member.id, createdAt: daysAgo(1) },
    { title: "Mesa rota en cafetería", description: "Una pata de la mesa está suelta y necesita reparación.", location: "Cafetería", building: "Edificio A", area: "Mantenimiento", urgency: "medium", status: "new", moderationStatus: "pending", reporterId: pedroId, createdAt: hoursAgo(2) },
    { title: "Foto sin relación con la sala", description: "La foto adjunta no corresponde a una avería reportable.", location: "Sala por confirmar", building: "Edificio C", area: "Mantenimiento", urgency: "medium", status: "new", moderationStatus: "pending", reporterId: pedroId, createdAt: hoursAgo(2) },
    { title: "Foto borrosa en reporte", description: "La imagen no permite identificar el problema reportado.", location: "Pasillo por confirmar", building: "Edificio C", area: "Mantenimiento", urgency: "low", status: "new", moderationStatus: "pending", reporterId: pedroId, createdAt: hoursAgo(4) },
    { title: "Banca dañada", description: "La banca aparece dañada en la fotografía del reporte.", location: "Patio central", building: "Edificio A", area: "Mantenimiento", urgency: "medium", status: "new", moderationStatus: "pending", reporterId: pedroId, createdAt: hoursAgo(5) },
    { title: "Filtración en cielo del pasillo", description: "Hay humedad y una gotera cerca de la sala 105.", location: "Pasillo, sala 105", building: "Edificio A", area: "Mantenimiento", urgency: "high", status: "in_progress", moderationStatus: "approved", reporterId: pedroId, managerId: managers.Mantenimiento.id, createdAt: hoursAgo(6) },
    { title: "Proyector sin señal", description: "El proyector de la sala 204 no recibe señal.", location: "Sala 204", building: "Edificio B", area: "TI", urgency: "low", status: "approved", moderationStatus: "approved", reporterId: member.id, managerId: managers.TI.id, createdAt: daysAgo(2) },
    { title: "Baño sin papel higiénico", description: "Falta papel higiénico en el baño del segundo piso.", location: "Baño, piso 2", building: "Edificio B", area: "Aseo", urgency: "medium", status: "awaiting_review", moderationStatus: "approved", reporterId: member.id, managerId: managers.Aseo.id, createdAt: daysAgo(1) },
    { title: "Filtración bajo el lavamanos", description: "Hay agua acumulada bajo el lavamanos del baño.", location: "Baño, piso 1", building: "Edificio B", area: "Mantenimiento", urgency: "high", status: "awaiting_review", moderationStatus: "approved", reporterId: member.id, managerId: managers.Mantenimiento.id, createdAt: daysAgo(2) },
    { title: "Silla reparada", description: "La silla quedó reparada y estable.", location: "Laboratorio 3", building: "Edificio B", area: "Mantenimiento", urgency: "high", status: "approved", moderationStatus: "approved", reporterId: member.id, managerId: managers.Mantenimiento.id, createdAt: daysAgo(3) },
    { title: "Lámpara pasillo A", description: "La lámpara fue reemplazada.", location: "Pasillo A", building: "Edificio A", area: "Mantenimiento", urgency: "low", status: "approved", moderationStatus: "approved", reporterId: member.id, managerId: managers.Mantenimiento.id, createdAt: daysAgo(7) },
  ];

  let created = 0;
  for (const data of demoAlerts) {
    const { title, location, building, reporterId } = data;
    const {
      reporterId: _reporterId,
      managerId: _managerId,
      ...insertData
    } = data;
    const result = await Alert.updateOne(
      { title, location, building },
      {
        $set: {
          reporterId,
          ...(data.managerId ? { managerId: data.managerId } : {}),
        },
        $setOnInsert: {
          ...insertData,
        },
      },
      { upsert: true },
    );
    if (result.upsertedCount) created++;
  }

  console.log(
    `Demo lista: Ana miembro, encargados por área y Admin Fixly. Alertas creadas: ${created}.`,
  );
  void admin;
} catch (error) {
  console.error("No se pudo cargar la demo:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
