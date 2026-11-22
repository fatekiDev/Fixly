import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fontFamily, radii } from "@/constants/theme";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "outline" | "danger";
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: PrimaryButtonProps) {
  const buttonStyle =
    variant === "outline"
      ? styles.outline
      : variant === "danger"
        ? styles.danger
        : styles.button;
  const labelStyle =
    variant === "outline"
      ? styles.outlineLabel
      : variant === "danger"
        ? styles.dangerLabel
        : styles.label;
  const pressedStyle =
    variant === "primary" ? styles.pressed : styles.secondaryPressed;
  const spinnerColor =
    variant === "primary"
      ? colors.surface
      : variant === "danger"
        ? colors.danger
        : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && !loading ? pressedStyle : null,
        disabled || loading ? styles.disabled : null,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={spinnerColor} size="small" /> : null}
        <Text style={labelStyle}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.field,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pressed: {
    backgroundColor: colors.primaryDark,
  },
  secondaryPressed: {
    opacity: 0.7,
  },
  outline: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  danger: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
  },
  outlineLabel: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
  dangerLabel: {
    color: colors.danger,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.surface,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
});
