import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@/data/mockUsers";
import {
  MOCK_ALERTS,
  type AlertArea,
  type AlertStatus,
  type AlertUrgency,
  type IssueAlert,
} from "@/data/mockAlerts";

type NewAlertInput = {
  title: string;
  description: string;
  area: AlertArea;
  urgency: AlertUrgency;
  photoUri?: string;
};

type AlertContextValue = {
  alerts: IssueAlert[];
  createAlert: (input: NewAlertInput, reporter: AuthUser) => IssueAlert;
  acceptAlert: (id: string, manager: AuthUser) => void;
  releaseAlert: (id: string, managerId: string) => void;
  resolveAlert: (id: string, managerId: string, evidenceUri?: string) => void;
  moderateAlert: (id: string, valid: boolean) => void;
  reviewClosure: (id: string, approved: boolean) => void;
  getPoints: (userId: string) => number;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);
const INITIAL_POINTS: Record<string, number> = { "demo-member": 90 };

export function AlertProvider({ children }: PropsWithChildren) {
  const [alerts, setAlerts] = useState<IssueAlert[]>(MOCK_ALERTS);

  const createAlert = useCallback((input: NewAlertInput, reporter: AuthUser) => {
    const alert: IssueAlert = {
      ...input,
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      reporterId: reporter.id,
      reporterName: reporter.name,
      status: "new",
      moderationStatus: "pending",
      location: "Ubicación por informar",
      building: "Universidad",
      createdAt: Date.now(),
    };

    setAlerts((currentAlerts) => [alert, ...currentAlerts]);
    return alert;
  }, []);

  const acceptAlert = useCallback((id: string, manager: AuthUser) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id && alert.status === "new"
          ? {
              ...alert,
              status: "in_progress",
              managerId: manager.id,
              managerName: manager.name,
            }
          : alert,
      ),
    );
  }, []);

  const releaseAlert = useCallback((id: string, managerId: string) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id && alert.status === "in_progress" && alert.managerId === managerId
          ? {
              ...alert,
              status: "new",
              managerId: undefined,
              managerName: undefined,
            }
          : alert,
      ),
    );
  }, []);

  const resolveAlert = useCallback(
    (id: string, managerId: string, evidenceUri?: string) => {
      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) =>
          alert.id === id &&
          alert.status === "in_progress" &&
          alert.managerId === managerId
            ? { ...alert, status: "awaiting_review", evidenceUri }
            : alert,
        ),
      );
    },
    [],
  );

  const moderateAlert = useCallback((id: string, valid: boolean) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id && alert.moderationStatus === "pending"
          ? {
              ...alert,
              moderationStatus: valid ? "approved" : "declined",
              status: valid ? alert.status : "declined",
            }
          : alert,
      ),
    );
  }, []);

  const reviewClosure = useCallback((id: string, approved: boolean) => {
    setAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id && alert.status === "awaiting_review"
          ? { ...alert, status: approved ? "approved" : "in_progress" }
          : alert,
      ),
    );
  }, []);

  const getPoints = useCallback(
    (userId: string) =>
      (INITIAL_POINTS[userId] ?? 0) +
      alerts.filter(
        (alert) => alert.reporterId === userId && alert.status === "approved",
      ).length *
        10,
    [alerts],
  );

  const value = useMemo(
    () => ({
      alerts,
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
