import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@/data/mockUsers";
import {
  type AlertArea,
  type AlertStatus,
  type AlertUrgency,
  type IssueAlert,
} from "@/data/mockAlerts";
import { API_URL, apiRequest, uploadImage } from "@/features/api/apiClient";
import { useAuth } from "@/features/auth/AuthProvider";

type NewAlertInput = {
  title: string;
  description: string;
  area: AlertArea;
  urgency: AlertUrgency;
  photoUri?: string;
};

type AlertContextValue = {
  alerts: IssueAlert[];
  isLoading: boolean;
  error: string;
  refreshAlerts: () => Promise<void>;
  createAlert: (input: NewAlertInput, reporter: AuthUser) => Promise<IssueAlert | null>;
  acceptAlert: (id: string, manager: AuthUser) => Promise<void>;
  releaseAlert: (id: string, managerId: string) => Promise<void>;
  resolveAlert: (id: string, managerId: string, evidenceUri?: string) => Promise<void>;
  moderateAlert: (id: string, valid: boolean) => Promise<void>;
  reviewClosure: (id: string, approved: boolean) => Promise<void>;
  getPoints: (userId: string) => number;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);
const INITIAL_POINTS: Record<string, number> = { "demo-member": 90 };

type AlertRecord = Record<string, unknown>;

export function AlertProvider({ children }: PropsWithChildren) {
  const { user, isRestoring } = useAuth();
  const [alerts, setAlerts] = useState<IssueAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const mapAlert = useCallback((item: AlertRecord): IssueAlert => {
    const createdAtValue = item.createdAt;
    return {
      id: String(item.id),
      title: String(item.title),
      description: String(item.description),
      reporterId: String(item.reporterId),
      reporterName: String(item.reporterName ?? "Reportante"),
      area: item.area as AlertArea,
      urgency: item.urgency as AlertUrgency,
      status: item.status as AlertStatus,
      moderationStatus: item.moderationStatus as IssueAlert["moderationStatus"],
      location: String(item.location),
      building: String(item.building),
      createdAt:
        typeof createdAtValue === "number"
          ? createdAtValue
          : new Date(String(createdAtValue)).getTime(),
      managerId: item.managerId ? String(item.managerId) : undefined,
      managerName: item.managerName ? String(item.managerName) : undefined,
      photoUri: item.photoUrl
        ? toMediaUrl(String(item.photoUrl))
        : undefined,
      evidenceUri: item.evidenceUrl
        ? toMediaUrl(String(item.evidenceUrl))
        : undefined,
    };
  }, []);

  const refreshAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await apiRequest<{ alerts: AlertRecord[] }>("/api/alerts");
      setAlerts(response.alerts.map(mapAlert));
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "No pudimos cargar las alertas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [mapAlert, user]);

  useEffect(() => {
    if (!isRestoring) {
      queueMicrotask(() => {
        void refreshAlerts();
      });
    }
  }, [isRestoring, refreshAlerts]);

  const createAlert = useCallback(
    async (input: NewAlertInput, _reporter: AuthUser) => {
      try {
        const uploadedPhoto = input.photoUri
          ? await uploadImage(input.photoUri, "report")
          : undefined;
        const response = await apiRequest<{ alert: AlertRecord }>("/api/alerts", {
          method: "POST",
          body: {
            title: input.title,
            description: input.description,
            area: input.area,
            urgency: input.urgency,
            location: "Ubicación por informar",
            building: "Universidad",
            ...(uploadedPhoto ? { photoId: uploadedPhoto.id } : {}),
          },
        });
        const alert = mapAlert(response.alert);
        setAlerts((currentAlerts) => [alert, ...currentAlerts]);
        return alert;
      } catch (createError) {
        setError(
          createError instanceof Error
            ? createError.message
            : "No pudimos publicar la alerta.",
        );
        return null;
      }
    },
    [mapAlert],
  );

  const acceptAlert = useCallback(
    async (id: string, _manager: AuthUser) => {
      try {
        await apiRequest(`/api/alerts/${id}/accept`, { method: "POST" });
        await refreshAlerts();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "No pudimos aceptar la alerta.");
        throw actionError;
      }
    },
    [refreshAlerts],
  );

  const releaseAlert = useCallback(
    async (id: string, _managerId: string) => {
      try {
        await apiRequest(`/api/alerts/${id}/release`, { method: "POST" });
        await refreshAlerts();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "No pudimos liberar la alerta.");
        throw actionError;
      }
    },
    [refreshAlerts],
  );

  const resolveAlert = useCallback(
    async (id: string, _managerId: string, evidenceUri?: string) => {
      try {
        const uploadedEvidence = evidenceUri
          ? await uploadImage(evidenceUri, "evidence")
          : undefined;
        await apiRequest(`/api/alerts/${id}/resolve`, {
          method: "POST",
          body: uploadedEvidence ? { evidenceId: uploadedEvidence.id } : {},
        });
        await refreshAlerts();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "No pudimos resolver la alerta.");
        throw actionError;
      }
    },
    [refreshAlerts],
  );

  const moderateAlert = useCallback(
    async (id: string, valid: boolean) => {
      try {
        await apiRequest(`/api/alerts/${id}/moderation`, {
          method: "POST",
          body: { valid },
        });
        await refreshAlerts();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "No pudimos moderar la alerta.");
        throw actionError;
      }
    },
    [refreshAlerts],
  );

  const reviewClosure = useCallback(
    async (id: string, approved: boolean) => {
      try {
        await apiRequest(`/api/alerts/${id}/review`, {
          method: "POST",
          body: { approved },
        });
        await refreshAlerts();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "No pudimos revisar el cierre.");
        throw actionError;
      }
    },
    [refreshAlerts],
  );

  const getPoints = useCallback(
    (userId: string) =>
      (INITIAL_POINTS[userId] ?? 90) +
      alerts.filter(
        (alert) => alert.reporterId === userId && alert.status === "approved",
      ).length *
        10,
    [alerts],
  );

  const value = useMemo(
    () => ({
      alerts,
      isLoading,
      error,
      refreshAlerts,
      createAlert,
      acceptAlert,
      releaseAlert,
      resolveAlert,
      moderateAlert,
      reviewClosure,
      getPoints,
    }),
    [
      alerts,
      isLoading,
      error,
      refreshAlerts,
      createAlert,
      acceptAlert,
      releaseAlert,
      resolveAlert,
      moderateAlert,
      reviewClosure,
      getPoints,
    ],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlerts debe usarse dentro de AlertProvider.");
  }
  return context;
}

export function getAlertStatusLabel(status: AlertStatus) {
  const labels: Record<AlertStatus, string> = {
    new: "Pendiente",
    in_progress: "En atención",
    awaiting_review: "Resuelta",
    approved: "Aprobada",
    declined: "Declinada",
  };
  return labels[status];
}

function toMediaUrl(value: string) {
  return value.startsWith("/") ? `${API_URL}${value}` : value;
}
