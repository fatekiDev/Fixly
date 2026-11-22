import { useMemo, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { FilterPills } from "@/components/FilterPills";
import { IssueCard } from "@/components/IssueCard";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, spacing } from "@/constants/theme";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { useAuth } from "@/features/auth/AuthProvider";

type MemberFilter = "all" | "new" | "in_progress" | "resolved";

const memberTabs: AppTab[] = [
  { href: "/member", label: "Alertas" },
  { href: "/member/new-alert", label: "Nueva" },
  { href: "/member/profile", label: "Perfil" },
];

export function MemberAlertsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { alerts, error, isLoading, refreshAlerts } = useAlerts();
  const [filter, setFilter] = useState<MemberFilter>("all");

  const myAlerts = useMemo(
    () => alerts.filter((alert) => alert.reporterId === user?.id),
    [alerts, user?.id],
  );
  const visibleAlerts = myAlerts.filter((alert) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "resolved") {
      return alert.status === "awaiting_review" || alert.status === "approved";
    }

    return alert.status === filter;
  });

  if (!user) {
    return <Redirect href="/" />;
  }

  const options = [
    { value: "all" as const, label: "Todas" },
    { value: "new" as const, label: "Pendientes" },
    { value: "in_progress" as const, label: "En atención" },
    { value: "resolved" as const, label: "Resueltas" },
  ];

  return (
    <AppScreen
      footer={<AppTabs active="Alertas" tabs={memberTabs} />}
      scrollable={false}
    >
      <FlatList
        data={visibleAlerts}
        keyExtractor={(alert) => alert.id}
        ListEmptyComponent={
          isLoading ? undefined : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay alertas</Text>
              <Text style={styles.emptyText}>
                Cuando publiques un reporte, podrás seguir su estado aquí.
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <ScreenTitle
              title="Mis alertas"
              subtitle={`Hola, ${user.name.split(" ")[0]}. Aquí ves el estado de tus reportes.`}
            />
            <FilterPills options={options} onSelect={setFilter} selected={filter} />
            {error ? (
              <View style={styles.errorCard}>
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {error}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void refreshAlerts()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retry}>Intentar nuevamente</Text>
                </Pressable>
              </View>
            ) : null}
            {isLoading && !visibleAlerts.length ? (
              <Text style={styles.emptyText}>Cargando alertas…</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <IssueCard
            alert={item}
            onPress={() =>
              router.navigate({
                pathname: "/member/alert/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
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
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  errorCard: {
    gap: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  retry: {
    color: colors.primary,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  retryButton: {
    alignSelf: "flex-start",
    minHeight: 48,
    justifyContent: "center",
  },
});
