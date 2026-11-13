import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertBadge } from "@/components/AlertBadge";
import { AppScreen } from "@/components/AppScreen";
import { InfoBanner } from "@/components/InfoBanner";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import type { IssueAlert } from "@/data/mockAlerts";
import { useAlerts } from "@/features/alerts/AlertProvider";

export function MemberAlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { alerts } = useAlerts();
  const alert = alerts.find((item) => item.id === id);

  return (
    <AppScreen>
      <Pressable onPress={() => router.replace("/member")} style={styles.back}>
        <Text style={styles.backText}>‹ Alertas</Text>
      </Pressable>
      {!alert ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No encontramos esta alerta.</Text>
        </View>
      ) : (
        <>
          {alert.photoUri ? (
            <Image source={{ uri: alert.photoUri }} resizeMode="cover" style={styles.photoImage} />
          ) : (
            <View style={styles.photo}>
              <Text style={styles.photoText}>Foto del problema</Text>
            </View>
          )}
          <ScreenTitle title={alert.title} />
          <View style={styles.badges}>
            <AlertBadge kind="urgency" value={alert.urgency} />
            <AlertBadge kind="status" value={alert.status} />
          </View>
          <View style={styles.card}>
            <Text style={styles.location}>
              {alert.location} · {alert.building}
            </Text>
            <Text style={styles.meta}>
              Publicada {relativeDate(alert.createdAt)} · Dirigida a {alert.area}
            </Text>
            <Text style={styles.description}>{alert.description}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Seguimiento</Text>
            <Timeline alert={alert} />
          </View>
          <InfoBanner title="Puntos Fixly">
            {alert.status === "approved"
              ? "El cierre fue aprobado y ya sumaste 10 puntos."
              : "Ganarás +10 puntos cuando el administrador apruebe el cierre."}
          </InfoBanner>
        </>
      )}
    </AppScreen>
  );
}

function Timeline({ alert }: { alert: IssueAlert }) {
  const accepted =
    alert.status === "in_progress" ||
    alert.status === "awaiting_review" ||
    alert.status === "approved";
  const resolved = alert.status === "awaiting_review" || alert.status === "approved";
  const approved = alert.status === "approved";
  const steps = [
    { label: "Publicada", complete: alert.status !== "declined" },
    {
      label: alert.managerName
        ? `Aceptada por ${alert.managerName} (${alert.area})`
        : "Aceptada por encargado",
      complete: accepted,
    },
    { label: "En atención", complete: accepted },
    { label: "Resuelta", complete: resolved },
    { label: "Puntos aprobados por el admin", complete: approved },
  ];

  return (
    <View style={styles.timeline}>
      {steps.map((step) => (
        <View key={step.label} style={styles.timelineRow}>
          <View style={[styles.dot, step.complete && styles.dotComplete]} />
          <Text style={[styles.stepLabel, !step.complete && styles.stepPending]}>
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function relativeDate(timestamp: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 60) {
    return `hoy hace ${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hoy hace ${hours} h`;
  }
  return "hace varios días";
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  backText: {
    color: colors.primary,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  photo: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.card,
    backgroundColor: colors.border,
  },
  photoText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  photoImage: {
    width: "100%",
    height: 190,
    borderRadius: radii.card,
    backgroundColor: colors.border,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  location: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  description: {
    marginTop: spacing.xs,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
  timeline: {
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#CBD5E1",
  },
  dotComplete: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  stepPending: {
    color: "#94A3B8",
  },
  empty: {
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
});
