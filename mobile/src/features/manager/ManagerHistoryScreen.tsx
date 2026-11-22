import { Redirect, useRouter } from "expo-router";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { AlertBadge } from "@/components/AlertBadge";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { useAuth } from "@/features/auth/AuthProvider";

const managerTabs: AppTab[] = [
  { href: "/manager", label: "Bandeja" },
  { href: "/manager/history", label: "Bitácora" },
];

export function ManagerHistoryScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { alerts } = useAlerts();

  if (!user || user.role !== "manager") {
    return <Redirect href="/home" />;
  }

  const recentCases = alerts.filter(
    (alert) =>
      alert.managerId === user.id &&
      (alert.status === "awaiting_review" ||
        alert.status === "approved" ||
        alert.status === "declined"),
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "No pudimos cerrar sesión",
        error instanceof Error ? error.message : "Inténtalo nuevamente.",
      );
    }
  };

  return (
    <AppScreen
      footer={<AppTabs active="Bitácora" tabs={managerTabs} />}
      scrollable={false}
    >
      <FlatList
        data={recentCases}
        keyExtractor={(alert) => alert.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Los casos que resuelvas aparecerán aquí.</Text>
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <ScreenTitle
              title="Bitácora"
              subtitle="Tu historial de trabajo"
              action={{ label: "Cerrar sesión", onPress: handleSignOut }}
            />
            <View style={styles.stats}>
              <Stat value="24" label="Resueltos" />
              <Stat value="1,8 d" label="Tiempo prom." />
              <Stat value="21" label="Aprobados" />
            </View>
            <Text style={styles.sectionTitle}>Casos recientes</Text>
          </View>
        }
        renderItem={({ item: alert }) => (
          <View style={styles.caseCard}>
            <View style={styles.caseText}>
              <Text numberOfLines={1} style={styles.caseTitle}>
                {alert.title}
              </Text>
              <Text style={styles.caseDate}>{dateLabel(alert.createdAt)}</Text>
            </View>
            <AlertBadge
              kind="status"
              value={alert.status === "awaiting_review" ? "awaiting_review" : alert.status}
            />
          </View>
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function dateLabel(timestamp: number) {
  const days = Math.floor((Date.now() - timestamp) / (24 * 60 * 60 * 1000));
  return days === 0 ? "Hoy" : days === 1 ? "Ayer" : `Hace ${days} días`;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  listHeader: {
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    gap: spacing.xs,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  statValue: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: 24,
  },
  statLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 21,
  },
  caseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  caseText: {
    flex: 1,
    gap: spacing.xs,
  },
  caseTitle: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  caseDate: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  empty: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
});
