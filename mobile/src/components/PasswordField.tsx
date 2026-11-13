import { useState } from "react";
import { Pressable, Text } from "react-native";
import { colors, fontFamily } from "@/constants/theme";
import { AuthField } from "@/components/AuthField";

type PasswordFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  autoComplete?: "current-password" | "new-password";
  onSubmitEditing?: () => void;
};

export function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  autoComplete = "current-password",
  onSubmitEditing,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthField
      autoCapitalize="none"
      autoComplete={autoComplete}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      returnKeyType="done"
      secureTextEntry={!visible}
      textContentType="password"
      value={value}
      label={label}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          hitSlop={8}
          onPress={() => setVisible((current) => !current)}
        >
          <Text style={styles.action}>{visible ? "Ocultar" : "Mostrar"}</Text>
        </Pressable>
      }
    />
  );
}

const styles = {
  action: {
    color: colors.primaryDark,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
};
