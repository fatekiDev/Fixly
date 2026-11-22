import type { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/constants/theme";

type AppScreenProps = PropsWithChildren<{
  footer?: ReactNode;
  scrollable?: boolean;
}>;

export function AppScreen({
  children,
  footer,
  scrollable = true,
}: AppScreenProps) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.flex}>
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={styles.fixedContent}>{children}</View>
        )}
        {footer}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  fixedContent: {
    flex: 1,
    alignSelf: "center",
    maxWidth: 520,
    paddingHorizontal: spacing.lg,
    width: "100%",
  },
  content: {
    alignSelf: "center",
    flexGrow: 1,
    gap: spacing.lg,
    maxWidth: 520,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    width: "100%",
  },
});
