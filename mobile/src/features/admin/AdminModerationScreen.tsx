import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { FilterPills } from "@/components/FilterPills";
import { IssueCard } from "@/components/IssueCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, spacing } from "@/constants/theme";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { useAuth } from "@/features/auth/AuthProvider";

type ModerationTab = "publications" | "closures";

const adminTabs: AppTab[] = [
  { href: "/admin", label: "Moderación" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/profile", label: "Perfil" },
];

type AdminModerationScreenProps = {
  initialTab?: ModerationTab;
};

export function AdminModerationScreen({
  initialTab = "publications",
}: AdminModerationScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { alerts, error, moderateAlert } = useAlerts();
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [actionError, setActionError] = useState("");
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const publications = alerts.filter((alert) => alert.moderationStatus === "pending");
  const closures = alerts.filter((alert) => alert.status === "awaiting_review");
  const visibleAlerts = selectedTab === "publications" ? publications : closures;

  if (!user || user.role !== "admin") {
    return <Redirect href="/home" />;
  }

  const options = [
    { value: "publications" as const, label: `Publicaciones (${publications.length})` },
    { value: "closures" as const, label: `Cierres (${closures.length})` },
  ];

  const handleModerate = async (alertId: string, valid: boolean) => {
    if (moderatingId) return;
    setActionError("");
    setModeratingId(alertId);
    try {
      await moderateAlert(alertId, valid);
    } catch (moderationError) {
      setActionError(
        moderationError instanceof Error
          ? moderationError.message
          : "No pudimos revisar la publicación.",
      );
    } finally {
      setModeratingId(null);
    }
  };

  return (
    <AppScreen
      footer={<AppTabs active="Moderación" tabs={adminTabs} />}
      scrollable={false}
    >
      <FlatList
        data={visibleAlerts}
        keyExtractor={(alert) => alert.id}
        ListEmptyComponent={
          <EmptyState>
            {selectedTab === "publications"
              ? "Ya revisaste todas las publicaciones."
              : "No hay cierres pendientes de revisión."}
          </EmptyState>
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <ScreenTitle
              title="Moderación"
              subtitle="Revisa publicaciones y cierres de casos"
            />
            <FilterPills
              onSelect={(value) => {
                setSelectedTab(value);
                router.navigate(
                  value === "closures" ? "/admin/closures" : "/admin",
                );
              }}
              options={options}
              selected={selectedTab}
            />
            {actionError || error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {actionError || error}
              </Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) =>
          selectedTab === "publications" ? (
            <IssueCard alert={item}>
              <View style={styles.actions}>
                <PrimaryButton
                  label="Declinar"
                  onPress={() => void handleModerate(item.id, false)}
                  variant="danger"
                  disabled={moderatingId !== null}
                  loading={moderatingId === item.id}
                />
                <PrimaryButton
                  label="Es válida"
                  onPress={() => void handleModerate(item.id, true)}
                  disabled={moderatingId !== null}
                  loading={moderatingId === item.id}
                />
              </View>
            </IssueCard>
          ) : (
            <IssueCard
              alert={item}
              onPress={() =>
                router.navigate({
                  pathname: "/admin/closure/[id]",
                  params: { id: item.id },
                })
              }
              showReporter
            />
          )
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}

function EmptyState({ children }: { children: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{children}</Text>
    </View>
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
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  empty: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
});
