import { useRouter, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, spacing } from "@/constants/theme";

export type AppTab = {
  href: Href;
  label: string;
};

type AppTabsProps = {
  active: string;
  tabs: AppTab[];
};

export function AppTabs({ active, tabs }: AppTabsProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = tab.label === active;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={tab.href.toString()}
            onPress={() => router.navigate(tab.href)}
            style={styles.tab}
          >
            <View style={[styles.icon, selected && styles.iconSelected]} />
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {tab.label}
            </Text>
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
  tab: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#CBD5E1",
  },
  iconSelected: {
    backgroundColor: colors.primary,
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
