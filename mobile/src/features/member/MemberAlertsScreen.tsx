import { useMemo, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
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
  const { alerts } = useAlerts();
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
    <AppScreen footer={<AppTabs active="Alertas" tabs={memberTabs} />}>
      <ScreenTitle
        title="Mis alertas"
        subtitle={`Hola, ${user.name.split(" ")[0]}. Aquí ves el estado de tus reportes.`}
      />
      <FilterPills options={options} onSelect={setFilter} selected={filter} />
      {visibleAlerts.length ? (
        <View style={styles.list}>
          {visibleAlerts.map((alert) => (
            <IssueCard
              alert={alert}
              key={alert.id}
              onPress={() =>
                router.navigate({
                  pathname: "/member/alert/[id]",
                  params: { id: alert.id },
                })
              }
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Todavía no hay alertas</Text>
          <Text style={styles.emptyText}>
            Cuando publiques un reporte, podrás seguir su estado aquí.
          </Text>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
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
  emptyTitle: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
});
