import type { PropsWithChildren } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { IssueAlert } from "@/data/mockAlerts";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { AlertBadge } from "@/components/AlertBadge";

type IssueCardProps = PropsWithChildren<{
  alert: IssueAlert;
  onPress?: () => void;
  showReporter?: boolean;
}>;

export function IssueCard({
  alert,
  onPress,
  showReporter = false,
  children,
}: IssueCardProps) {
  const summary = showReporter
    ? `${alert.reporterName} · ${timeAgo(alert.createdAt)} · ${alert.location}`
    : `${alert.location} · ${alert.area}`;

  const content = (
    <>
      {alert.photoUri ? (
        <Image source={{ uri: alert.photoUri }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoLabel}>Foto</Text>
        </View>
      )}
      <View style={styles.details}>
        <Text numberOfLines={2} style={styles.title}>
          {alert.title}
        </Text>
        <Text numberOfLines={1} style={styles.summary}>
          {summary}
        </Text>
        <View style={styles.badges}>
          <AlertBadge kind="urgency" value={alert.urgency} />
          <AlertBadge kind="status" value={alert.status} />
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.card}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        >
          {content}
        </Pressable>
      ) : (
        <View style={styles.content}>{content}</View>
      )}
      {children}
    </View>
  );
}

export function timeAgo(timestamp: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} h`;
  }

  const days = Math.floor(hours / 24);
  return days === 1 ? "ayer" : `hace ${days} días`;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  photoLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  details: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
  summary: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
