import { useCallback, useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import type { AuthUser } from "@/data/mockUsers";
import { ROLE_LABELS } from "@/data/mockUsers";
import { apiRequest } from "@/features/api/apiClient";
import { useAuth } from "@/features/auth/AuthProvider";

const adminTabs: AppTab[] = [
  { href: "/admin", label: "Moderación" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/profile", label: "Perfil" },
];

export function AdminUsersScreen() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshUsers = useCallback(async () => {
    if (user?.role !== "admin") return;
    setIsLoading(true);
    setError("");
    try {
      const response = await apiRequest<{ users: AuthUser[] }>("/api/users");
      setUsers(response.users);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No pudimos cargar los usuarios.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshUsers();
    });
  }, [refreshUsers]);

  if (!user || user.role !== "admin") {
    return <Redirect href="/home" />;
  }

  return (
    <AppScreen footer={<AppTabs active="Usuarios" tabs={adminTabs} />}>
      <ScreenTitle title="Usuarios" subtitle={`${users.length} cuentas registradas`} />
      {isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : null}
      {error ? (
        <View style={styles.message}>
          <Text accessibilityRole="alert" style={styles.error}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => void refreshUsers()}>
            <Text style={styles.retry}>Intentar nuevamente</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.list}>
        {users.map((account) => (
          <View key={account.id} style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials(account.name)}</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.name}>{account.name}</Text>
              <Text style={styles.email}>{account.email}</Text>
              <Text style={styles.role}>
                {ROLE_LABELS[account.role]}
                {account.role === "manager" && account.area
                  ? ` · ${account.area}`
                  : ""}
              </Text>
            </View>
          </View>
        ))}
        {!isLoading && !error && !users.length ? (
          <Text style={styles.empty}>Todavía no hay usuarios registrados.</Text>
        ) : null}
      </View>
    </AppScreen>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  message: {
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  retry: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  empty: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: colors.infoBackground,
  },
  initials: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
  },
  details: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
  email: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
  },
  role: {
    color: colors.primaryDark,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
