import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";

type InfoBannerProps = {
  title: string;
  children: ReactNode;
};

export function InfoBanner({ title, children }: InfoBannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.infoBackground,
    padding: spacing.md,
  },
  title: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
  },
});
