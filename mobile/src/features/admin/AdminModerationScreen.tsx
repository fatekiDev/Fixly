import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
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
  const publications = alerts.filter((alert) => alert.moderationStatus === "pending");
  const closures = alerts.filter((alert) => alert.status === "awaiting_review");

  if (!user || user.role !== "admin") {
    return <Redirect href="/home" />;
  }

  const options = [
    { value: "publications" as const, label: `Publicaciones (${publications.length})` },
    { value: "closures" as const, label: `Cierres (${closures.length})` },
  ];

  const handleModerate = async (alertId: string, valid: boolean) => {
    setActionError("");
    try {
      await moderateAlert(alertId, valid);
    } catch (moderationError) {
      setActionError(
        moderationError instanceof Error
          ? moderationError.message
          : "No pudimos revisar la publicación.",
      );
    }
  };

  return (
    <AppScreen footer={<AppTabs active="Moderación" tabs={adminTabs} />}>
      <ScreenTitle
        title="Moderación"
        subtitle="Revisa publicaciones y cierres de casos"
      />
      <FilterPills
        onSelect={(value) => {
          setSelectedTab(value);
          if (value === "closures") {
            router.navigate("/admin/closures");
          } else {
            router.navigate("/admin");
          }
        }}
        options={options}
        selected={selectedTab}
      />
      {actionError || error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {actionError || error}
        </Text>
      ) : null}

      {selectedTab === "publications" ? (
        publications.length ? (
          <View style={styles.list}>
            {publications.map((alert) => (
              <IssueCard alert={alert} key={alert.id}>
                <View style={styles.actions}>
                  <PrimaryButton
                    label="Declinar"
                    onPress={() => void handleModerate(alert.id, false)}
                    variant="danger"
                  />
                  <PrimaryButton
                    label="Es válida"
                    onPress={() => void handleModerate(alert.id, true)}
                  />
                </View>
              </IssueCard>
            ))}
          </View>
        ) : (
          <EmptyState>Ya revisaste todas las publicaciones.</EmptyState>
        )
      ) : closures.length ? (
        <View style={styles.list}>
          {closures.map((alert) => (
            <IssueCard
              alert={alert}
              key={alert.id}
              onPress={() =>
                router.navigate({
                  pathname: "/admin/closure/[id]",
                  params: { id: alert.id },
                })
              }
              showReporter
            />
          ))}
        </View>
      ) : (
        <EmptyState>No hay cierres pendientes de revisión.</EmptyState>
      )}
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
    gap: spacing.md,
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
    fontSize: 14,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
});
