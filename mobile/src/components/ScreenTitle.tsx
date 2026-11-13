import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, spacing } from "@/constants/theme";

type ScreenTitleProps = {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
};

export function ScreenTitle({ title, subtitle, action }: ScreenTitleProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {action ? (
          <Pressable
            accessibilityRole="button"
            onPress={action.onPress}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ) : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 30,
    letterSpacing: -0.6,
  },
  action: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  actionPressed: {
    opacity: 0.7,
  },
  actionText: {
    color: colors.primary,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 23,
  },
});
