import { useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthField } from "@/components/AuthField";
import { PasswordField } from "@/components/PasswordField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/features/auth/AuthProvider";

export function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = () => {
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmation) {
      setError("Completá todos los campos para crear tu cuenta.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresá un correo electrónico válido.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!signUp(name, email, password)) {
      setError("Ya existe una cuenta con ese correo.");
      return;
    }

    router.replace("/home");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={styles.heading}>Creá tu cuenta</Text>
            <Text style={styles.subtitle}>
              Sumate y ayudá a mejorar tu comunidad.
            </Text>
          </View>

          <View style={styles.card}>
            <AuthField
              autoComplete="name"
              autoCapitalize="words"
              label="Nombre completo"
              onChangeText={setName}
              placeholder="Tu nombre y apellido"
              returnKeyType="next"
              textContentType="name"
              value={name}
            />
            <AuthField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Correo electrónico"
              onChangeText={setEmail}
              placeholder="nombre@correo.cl"
              returnKeyType="next"
              textContentType="emailAddress"
              value={email}
            />
            <PasswordField
              autoComplete="new-password"
              label="Contraseña"
              onChangeText={setPassword}
              placeholder="Mínimo 8 caracteres"
              value={password}
            />
            <PasswordField
              autoComplete="new-password"
              label="Confirmar contraseña"
              onChangeText={setConfirmation}
              placeholder="Repetí tu contraseña"
              value={confirmation}
            />

            <Text style={styles.terms}>
              Al crear tu cuenta, aceptás los{" "}
              <Text style={styles.termsLink}>Términos de uso</Text> y la{" "}
              <Text style={styles.termsLink}>Política de privacidad</Text>.
            </Text>

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <PrimaryButton label="Crear cuenta" onPress={handleSignUp} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tenés una cuenta?</Text>
            <Link href="/" asChild>
              <Pressable accessibilityRole="link" hitSlop={8}>
                <Text style={styles.linkText}>Iniciá sesión</Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  intro: {
    gap: spacing.sm,
  },
  heading: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 34,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    gap: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  terms: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primaryDark,
    fontFamily: fontFamily.medium,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: "auto",
    paddingTop: spacing.md,
  },
  footerText: {
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
  linkText: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
});
