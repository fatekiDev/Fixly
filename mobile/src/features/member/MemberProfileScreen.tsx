import { Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertBadge } from "@/components/AlertBadge";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { useAuth } from "@/features/auth/AuthProvider";

const memberTabs: AppTab[] = [
  { href: "/member", label: "Alertas" },
  { href: "/member/new-alert", label: "Nueva" },
  { href: "/member/profile", label: "Perfil" },
];

export function MemberProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { alerts, getPoints } = useAlerts();

  if (!user) {
    return <Redirect href="/" />;
  }

  const myAlerts = alerts.filter((alert) => alert.reporterId === user.id);
  const approved = myAlerts.filter((alert) => alert.status === "approved");
  const awaitingReview = myAlerts.filter((alert) => alert.status === "awaiting_review");
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  return (
    <AppScreen footer={<AppTabs active="Perfil" tabs={memberTabs} />}>
      <ScreenTitle title="Perfil" />
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Mis puntos</Text>
        <Text style={styles.points}>{getPoints(user.id)}</Text>
        <Text style={styles.pointsSummary}>
          {approved.length} reportes aprobados · {awaitingReview.length} en revisión
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Reportes aprobados</Text>
      {approved.length ? (
        <View style={styles.reportList}>
          {approved.map((alert) => (
            <View key={alert.id} style={styles.reportCard}>
              <View style={styles.reportText}>
                <Text numberOfLines={1} style={styles.reportTitle}>
                  {alert.title}
                </Text>
                <Text style={styles.reportTime}>{relativeDate(alert.createdAt)}</Text>
              </View>
              <AlertBadge kind="status" value="approved" />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Los reportes aprobados aparecerán aquí.</Text>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={handleSignOut}
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </Pressable>
    </AppScreen>
  );
}

function relativeDate(timestamp: number) {
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000)));
  if (days === 0) {
    return "Hoy";
  }
  return days === 1 ? "Hace 1 día" : `Hace ${days} días`;
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    backgroundColor: colors.infoBackground,
  },
  initials: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
  },
  email: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  pointsCard: {
    gap: spacing.xs,
    borderRadius: radii.card,
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  pointsLabel: {
    color: "#E8F0FF",
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  points: {
    color: colors.surface,
    fontFamily: fontFamily.bold,
    fontSize: 44,
  },
  pointsSummary: {
    color: "#E8F0FF",
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 20,
  },
  reportList: {
    gap: spacing.md,
  },
  reportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  reportText: {
    flex: 1,
    gap: spacing.xs,
  },
  reportTitle: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  reportTime: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
  signOut: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
  signOutText: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
});
