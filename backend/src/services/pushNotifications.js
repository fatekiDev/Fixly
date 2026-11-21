import { Expo } from "expo-server-sdk";
import { User } from "../models/User.js";

const expo = new Expo();

async function sendPushNotifications(userQuery, notification) {
  const users = await User.find(userQuery).select("+pushTokens");
  const tokens = [...new Set(users.flatMap((user) => user.pushTokens))];
  const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));
  const invalidTokens = tokens.filter((token) => !Expo.isExpoPushToken(token));

  if (invalidTokens.length) {
    console.error("Se descartaron tokens Expo inválidos.", invalidTokens.length);
    await User.updateMany(
      { pushTokens: { $in: invalidTokens } },
      { $pull: { pushTokens: { $in: invalidTokens } } },
    );
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: "default",
    title: notification.title,
    body: notification.body,
    data: notification.data,
  }));

  for (const chunk of expo.chunkPushNotifications(messages)) {
    let tickets;
    try {
      tickets = await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error("Expo no aceptó el envío de notificaciones push.", error);
      continue;
    }

    const invalidatedTokens = [];
    tickets.forEach((ticket, index) => {
      if (ticket.status !== "error") return;
      if (ticket.details?.error === "DeviceNotRegistered") {
        invalidatedTokens.push(chunk[index].to);
      } else {
        console.error("Expo rechazó una notificación push.", ticket.message, ticket.details);
      }
    });

    if (invalidatedTokens.length) {
      await User.updateMany(
        { pushTokens: { $in: invalidatedTokens } },
        { $pull: { pushTokens: { $in: invalidatedTokens } } },
      );
    }
  }
}

export async function dispatchPushNotification(userQuery, notification) {
  try {
    await sendPushNotifications(userQuery, notification);
  } catch (error) {
    console.error("No se pudo completar el envío complementario de notificaciones.", error);
  }
}
