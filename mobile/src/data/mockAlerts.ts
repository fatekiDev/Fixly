export type AlertUrgency = "low" | "medium" | "high";
export type AlertStatus =
  | "new"
  | "in_progress"
  | "awaiting_review"
  | "approved"
  | "declined";
export type ModerationStatus = "pending" | "approved" | "declined";
export type AlertArea = "Aseo" | "TI" | "Mantenimiento" | "Construcción";

export type IssueAlert = {
  id: string;
  title: string;
  description: string;
  reporterId: string;
  reporterName: string;
  area: AlertArea;
  urgency: AlertUrgency;
  status: AlertStatus;
  moderationStatus: ModerationStatus;
  location: string;
  building: string;
  createdAt: number;
  managerId?: string;
  managerName?: string;
  photoUri?: string;
  evidenceUri?: string;
};

const minutesAgo = (minutes: number) => Date.now() - minutes * 60 * 1000;
const hoursAgo = (hours: number) => Date.now() - hours * 60 * 60 * 1000;
const daysAgo = (days: number) => Date.now() - days * 24 * 60 * 60 * 1000;

export const MOCK_ALERTS: IssueAlert[] = [
  {
    id: "chair-bolts",
    title: "Silla sin pernos",
    description:
      "La silla del puesto 5 no tiene pernos y se mueve al sentarse. Riesgo de caída.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "Mantenimiento",
    urgency: "high",
    status: "in_progress",
    moderationStatus: "approved",
    location: "Laboratorio 3",
    building: "Edificio B",
    createdAt: minutesAgo(20),
    managerId: "demo-manager",
    managerName: "Luis",
  },
  {
    id: "loose-outlet",
    title: "Enchufe suelto en sala 201",
    description: "El enchufe está suelto y se mueve al conectar equipos.",
    reporterId: "demo-pedro",
    reporterName: "Pedro R.",
    area: "TI",
    urgency: "high",
    status: "new",
    moderationStatus: "approved",
    location: "Sala 201",
    building: "Edificio A",
    createdAt: hoursAgo(1),
  },
  {
    id: "burnt-light",
    title: "Foco quemado en pasillo B",
    description: "El foco del pasillo dejó de funcionar durante la tarde.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "Mantenimiento",
    urgency: "medium",
    status: "new",
    moderationStatus: "approved",
    location: "Pasillo B",
    building: "Edificio B",
    createdAt: hoursAgo(3),
  },
  {
    id: "bathroom-door",
    title: "Puerta del baño no cierra",
    description: "La puerta del baño del segundo piso no cierra correctamente.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "Mantenimiento",
    urgency: "low",
    status: "new",
    moderationStatus: "approved",
    location: "Baño, piso 2",
    building: "Edificio B",
    createdAt: daysAgo(1),
  },
  {
    id: "cafeteria-table",
    title: "Mesa rota en cafetería",
    description: "Una pata de la mesa está suelta y necesita reparación.",
    reporterId: "demo-pedro",
    reporterName: "Pedro R.",
    area: "Mantenimiento",
    urgency: "medium",
    status: "new",
    moderationStatus: "pending",
    location: "Cafetería",
    building: "Edificio A",
    createdAt: hoursAgo(2),
  },
  {
    id: "unrelated-photo",
    title: "Foto sin relación con la sala",
    description: "La foto adjunta no corresponde a una avería reportable.",
    reporterId: "demo-new-account",
    reporterName: "Cuenta nueva",
    area: "Mantenimiento",
    urgency: "medium",
    status: "new",
    moderationStatus: "pending",
    location: "Sala por confirmar",
    building: "Edificio C",
    createdAt: hoursAgo(2),
  },
  {
    id: "blurred-photo",
    title: "Foto borrosa en reporte",
    description: "La imagen no permite identificar el problema reportado.",
    reporterId: "demo-new-account",
    reporterName: "Cuenta nueva",
    area: "Mantenimiento",
    urgency: "low",
    status: "new",
    moderationStatus: "pending",
    location: "Pasillo por confirmar",
    building: "Edificio C",
    createdAt: hoursAgo(4),
  },
  {
    id: "broken-bench",
    title: "Banca dañada",
    description: "La banca aparece dañada en la fotografía del reporte.",
    reporterId: "demo-pedro",
    reporterName: "Pedro R.",
    area: "Mantenimiento",
    urgency: "medium",
    status: "new",
    moderationStatus: "pending",
    location: "Patio central",
    building: "Edificio A",
    createdAt: hoursAgo(5),
  },
  {
    id: "ceiling-leak",
    title: "Filtración en cielo del pasillo",
    description: "Hay humedad y una gotera cerca de la sala 105.",
    reporterId: "demo-pedro",
    reporterName: "Pedro R.",
    area: "Mantenimiento",
    urgency: "high",
    status: "in_progress",
    moderationStatus: "approved",
    location: "Pasillo, sala 105",
    building: "Edificio A",
    createdAt: hoursAgo(6),
    managerId: "demo-manager",
    managerName: "Luis",
  },
  {
    id: "broken-projector",
    title: "Proyector sin señal",
    description: "El proyector de la sala 204 no recibe señal.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "TI",
    urgency: "low",
    status: "approved",
    moderationStatus: "approved",
    location: "Sala 204",
    building: "Edificio B",
    createdAt: daysAgo(2),
    managerId: "demo-manager",
    managerName: "Luis",
  },
  {
    id: "missing-paper",
    title: "Baño sin papel higiénico",
    description: "Falta papel higiénico en el baño del segundo piso.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "Aseo",
    urgency: "medium",
    status: "awaiting_review",
    moderationStatus: "approved",
    location: "Baño, piso 2",
    building: "Edificio B",
    createdAt: daysAgo(1),
    managerId: "demo-manager",
    managerName: "Luis",
  },
  {
    id: "sink-leak",
    title: "Filtración bajo el lavamanos",
    description: "Hay agua acumulada bajo el lavamanos del baño.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "Mantenimiento",
    urgency: "high",
    status: "awaiting_review",
    moderationStatus: "approved",
    location: "Baño, piso 1",
    building: "Edificio B",
    createdAt: daysAgo(2),
    managerId: "demo-manager",
    managerName: "Luis",
  },
  {
    id: "approved-chair",
    title: "Silla sin pernos",
    description: "La silla quedó reparada y estable.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "Mantenimiento",
    urgency: "high",
    status: "approved",
    moderationStatus: "approved",
    location: "Laboratorio 3",
    building: "Edificio B",
    createdAt: daysAgo(3),
    managerId: "demo-manager",
    managerName: "Luis",
  },
  {
    id: "approved-floor",
    title: "Lámpara pasillo A",
    description: "La lámpara fue reemplazada.",
    reporterId: "demo-member",
    reporterName: "Ana M.",
    area: "Mantenimiento",
    urgency: "low",
    status: "approved",
    moderationStatus: "approved",
    location: "Pasillo A",
    building: "Edificio A",
    createdAt: daysAgo(7),
    managerId: "demo-manager",
    managerName: "Luis",
  },
];
