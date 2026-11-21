import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { useAuth } from "@/features/auth/AuthProvider";

export function PushNotificationObserver() {
  const { user, isRestoring } = useAuth();
  const { refreshAlerts } = useAlerts();
  const [response, setResponse] =
    useState<Notifications.NotificationResponse | null>(() =>
      Notifications.getLastNotificationResponse(),
    );

  useEffect(() => {
    const subscription =
      Notifications.addNotificationResponseReceivedListener(setResponse);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isRestoring || !user || !response) return;

    const data = response.notification.request.content.data;
    const alertId = data?.alertId;
    if (!data || typeof alertId !== "string" || data.destination !== user.role) {
      Notifications.clearLastNotificationResponse();
      queueMicrotask(() => setResponse(null));
      return;
    }

    let active = true;
    void refreshAlerts().then(() => {
      if (!active) return;

      if (user.role === "member") {
        router.push({ pathname: "/member/alert/[id]", params: { id: alertId } });
      } else if (user.role === "manager") {
        router.push({ pathname: "/manager/alert/[id]", params: { id: alertId } });
      } else {
        router.push({ pathname: "/admin/closure/[id]", params: { id: alertId } });
      }

      Notifications.clearLastNotificationResponse();
      setResponse(null);
    });

    return () => {
      active = false;
    };
  }, [isRestoring, refreshAlerts, response, user]);

  return null;
}
