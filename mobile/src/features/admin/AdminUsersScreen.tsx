import { Redirect } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { MOCK_ACCOUNTS, ROLE_LABELS } from "@/data/mockUsers";
import { useAuth } from "@/features/auth/AuthProvider";

const adminTabs: AppTab[] = [
  { href: "/admin", label: "Moderación" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/profile", label: "Perfil" },
];

export function AdminUsersScreen() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Redirect href="/home" />;
  }

  return (
    <AppScreen footer={<AppTabs active="Usuarios" tabs={adminTabs} />}>
      <ScreenTitle title="Usuarios" subtitle={`${MOCK_ACCOUNTS.length} cuentas de prueba`} />
      <View style={styles.list}>
        {MOCK_ACCOUNTS.map(({ user: account }) => (
          <View key={account.id} style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials(account.name)}</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.name}>{account.name}</Text>
              <Text style={styles.email}>{account.email}</Text>
              <Text style={styles.role}>{ROLE_LABELS[account.role]}</Text>
            </View>
          </View>
        ))}
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
