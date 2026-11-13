import { Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AppTabs, type AppTab } from "@/components/AppTabs";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { ROLE_LABELS } from "@/data/mockUsers";
import { useAuth } from "@/features/auth/AuthProvider";

const adminTabs: AppTab[] = [
  { href: "/admin", label: "Moderación" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/profile", label: "Perfil" },
];

export function AdminProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  if (!user || user.role !== "admin") {
    return <Redirect href="/home" />;
  }

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  return (
    <AppScreen footer={<AppTabs active="Perfil" tabs={adminTabs} />}>
      <ScreenTitle title="Perfil" />
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{user.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{ROLE_LABELS[user.role]}</Text>
      </View>
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

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: colors.infoBackground,
  },
  initials: {
    color: colors.primaryDark,
    fontFamily: fontFamily.bold,
    fontSize: 24,
  },
  name: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 19,
  },
  email: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  role: {
    color: colors.primaryDark,
    fontFamily: fontFamily.medium,
    fontSize: 14,
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
