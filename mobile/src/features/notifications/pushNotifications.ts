import Constants from "expo-constants";
import { AndroidImportance } from "expo-notifications";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function getExpoPushToken(requestPermission: boolean) {
  if (Platform.OS === "web") return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    throw new Error(
      "Configura el projectId de Expo antes de habilitar notificaciones push.",
    );
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Fixly",
      importance: AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#208AEF",
    });
  }

  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;
  if (status !== "granted" && requestPermission) {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return null;

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}
