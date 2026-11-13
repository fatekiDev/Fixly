import { StyleSheet, Text } from "react-native";
import type { AlertStatus, AlertUrgency } from "@/data/mockAlerts";
import { colors, fontFamily, radii } from "@/constants/theme";
import { getAlertStatusLabel } from "@/features/alerts/AlertProvider";

type AlertBadgeProps =
  | { kind: "urgency"; value: AlertUrgency }
  | { kind: "status"; value: AlertStatus };

const urgencyStyle = {
  low: { backgroundColor: "#DCFCE7", color: "#15803D", label: "Urgencia baja" },
  medium: { backgroundColor: "#FEF3C7", color: "#B45309", label: "Urgencia media" },
  high: { backgroundColor: "#FEE2E2", color: colors.danger, label: "Urgencia alta" },
} as const;

const statusStyle: Record<AlertStatus, { backgroundColor: string; color: string }> = {
  new: { backgroundColor: "#EEF2F7", color: "#475569" },
  in_progress: { backgroundColor: "#E8F0FF", color: colors.primaryDark },
  awaiting_review: { backgroundColor: "#FEF3C7", color: "#B45309" },
  approved: { backgroundColor: "#DCFCE7", color: "#15803D" },
  declined: { backgroundColor: "#FEE2E2", color: colors.danger },
};

export function AlertBadge({ kind, value }: AlertBadgeProps) {
  const detail =
    kind === "urgency"
      ? urgencyStyle[value]
      : { ...statusStyle[value], label: getAlertStatusLabel(value) };

  return (
    <Text style={[styles.badge, { backgroundColor: detail.backgroundColor, color: detail.color }]}>
      {detail.label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    overflow: "hidden",
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
