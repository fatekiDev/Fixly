import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { FilterPills } from "@/components/FilterPills";
import { IssueCard } from "@/components/IssueCard";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, spacing } from "@/constants/theme";
import type { IssueAlert } from "@/data/mockAlerts";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { useAuth } from "@/features/auth/AuthProvider";

type InboxFilter = "new" | "in_progress" | "resolved";

const managerTabs: AppTab[] = [
  { href: "/manager", label: "Bandeja" },
  { href: "/manager/history", label: "Bitácora" },
];

export function ManagerInboxScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { alerts, error, isLoading, refreshAlerts } = useAlerts();
  const [filter, setFilter] = useState<InboxFilter>("new");
  const [sortByUrgency, setSortByUrgency] = useState(true);

  if (!user || user.role !== "manager" || !user.area) {
    return <Redirect href="/home" />;
  }

  const assignedOrNew = alerts.filter(
    (alert) =>
      alert.area === user.area &&
      (alert.status === "new" || alert.managerId === user.id),
  );
  const newAlerts = assignedOrNew.filter((alert) => alert.status === "new");
  const inProgressAlerts = assignedOrNew.filter(
    (alert) => alert.status === "in_progress",
  );
  const resolvedAlerts = assignedOrNew.filter(
    (alert) =>
      alert.status === "awaiting_review" ||
      alert.status === "approved" ||
      alert.status === "declined",
  );
  const alertsByFilter: Record<InboxFilter, IssueAlert[]> = {
    new: newAlerts,
    in_progress: inProgressAlerts,
    resolved: resolvedAlerts,
  };
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  const visibleAlerts = [...alertsByFilter[filter]].sort((first, second) =>
    sortByUrgency
      ? urgencyOrder[first.urgency] - urgencyOrder[second.urgency]
      : second.createdAt - first.createdAt,
  );

  const options = [
    { value: "new" as const, label: `Nuevas (${newAlerts.length})` },
    { value: "in_progress" as const, label: `En atención (${inProgressAlerts.length})` },
    { value: "resolved" as const, label: "Resueltas" },
  ];

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
    <AppScreen footer={<AppTabs active="Bandeja" tabs={managerTabs} />}>
      <ScreenTitle
        title="Bandeja"
        subtitle={`Área: ${user.area} · ${newAlerts.length} alertas nuevas`}
        action={{ label: "Cerrar sesión", onPress: handleSignOut }}
      />
      <FilterPills options={options} onSelect={setFilter} selected={filter} />
      {error ? (
        <View style={styles.error}>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => void refreshAlerts()}>
            <Text style={styles.retry}>Intentar nuevamente</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Ordenar por</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSortByUrgency((current) => !current)}
          style={styles.sortButton}
        >
          <Text style={styles.sortValue}>
            {sortByUrgency ? "Urgencia  ▾" : "Más recientes  ▾"}
          </Text>
        </Pressable>
      </View>
      {isLoading && !visibleAlerts.length ? (
        <Text style={styles.emptyText}>Cargando alertas…</Text>
      ) : visibleAlerts.length ? (
        <View style={styles.list}>
          {visibleAlerts.map((alert) => (
            <IssueCard
              alert={alert}
              key={alert.id}
              onPress={() =>
                router.navigate({
                  pathname: "/manager/alert/[id]",
                  params: { id: alert.id },
                })
              }
              showReporter
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No hay casos en esta sección</Text>
          <Text style={styles.emptyText}>Las alertas nuevas aparecerán en tu bandeja.</Text>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sortLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  sortButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortValue: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  list: {
    gap: spacing.md,
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  error: {
    gap: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  retry: {
    color: colors.primary,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    textAlign: "center",
  },
});
