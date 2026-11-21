import { useRouter, type Href } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, spacing } from "@/constants/theme";

const tabSymbols = {
  Alertas: { ios: "bell", android: "notifications", web: "notifications" },
  Nueva: { ios: "plus", android: "add", web: "add" },
  Perfil: {
    ios: "person.crop.circle",
    android: "account_circle",
    web: "account_circle",
  },
  Bandeja: { ios: "tray.full", android: "inbox", web: "inbox" },
  "Bitácora": { ios: "book.closed", android: "history", web: "history" },
  "Moderación": {
    ios: "checkmark.shield",
    android: "verified_user",
    web: "verified_user",
  },
  Usuarios: { ios: "person.2", android: "group", web: "group" },
} as const;

export type AppTab = {
  href: Href;
  label: keyof typeof tabSymbols;
};

type AppTabsProps = {
  active: string;
  tabs: AppTab[];
};

export function AppTabs({ active, tabs }: AppTabsProps) {
  const router = useRouter();
  const hasCreateTab = tabs.some((tab) => tab.label === "Nueva");

  return (
    <View style={[styles.container, hasCreateTab && styles.memberContainer]}>
      {hasCreateTab ? <View pointerEvents="none" style={styles.centerRise} /> : null}
      {tabs.map((tab) => {
        const selected = tab.label === active;
        const isCreateTab = tab.label === "Nueva";
        const symbol = tabSymbols[tab.label];

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={isCreateTab ? "Crear nueva alerta" : tab.label}
            accessibilityState={{ selected }}
            key={tab.href.toString()}
            onPress={() => router.navigate(tab.href)}
            style={[
              styles.tab,
              hasCreateTab && styles.memberTab,
              isCreateTab && styles.createTab,
            ]}
          >
            {isCreateTab ? (
              <View style={styles.createButton}>
                <SymbolView name={symbol} size={28} tintColor={colors.surface} />
              </View>
            ) : (
              <>
                <SymbolView
                  name={symbol}
                  size={22}
                  tintColor={selected ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.label, selected && styles.labelSelected]}>
                  {tab.label}
                </Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  memberContainer: {
    minHeight: 76,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderTopWidth: 0,
    borderRadius: 32,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 7,
  },
  centerRise: {
    position: "absolute",
    top: -28,
    left: "50%",
    width: 80,
    height: 80,
    marginLeft: -40,
    borderRadius: 40,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  memberTab: {
    minHeight: 60,
    justifyContent: "center",
  },
  createTab: {
    position: "relative",
  },
  createButton: {
    position: "absolute",
    top: -16,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surface,
    borderRadius: 32,
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  labelSelected: {
    color: colors.primary,
  },
});
