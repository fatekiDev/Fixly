import type { ReactNode } from "react";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";

type AuthFieldProps = Omit<TextInputProps, "style"> & {
  label: string;
  trailing?: ReactNode;
};

export function AuthField({ label, trailing, ...inputProps }: AuthFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          style={styles.input}
        />
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  inputRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
  trailing: {
    marginLeft: spacing.sm,
  },
});
