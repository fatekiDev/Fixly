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
import { BrandHeader } from "@/components/BrandHeader";
import { PasswordField } from "@/components/PasswordField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { useAuth } from "@/features/auth/AuthProvider";

export function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (isSubmitting) return;
    setError("");
    setNotice("");

    if (!email.trim() || !password) {
      setError("Ingresa tu correo y contraseña para continuar.");
      return;
    }

    setIsSubmitting(true);
    const signInError = await signIn(email, password);
    setIsSubmitting(false);
    if (signInError) {
      setError(signInError);
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
          <BrandHeader />

          <View style={styles.intro}>
            <Text style={styles.heading}>Qué bueno verte</Text>
            <Text style={styles.subtitle}>
              Inicia sesión para seguir tus alertas y novedades.
            </Text>
          </View>

          <View style={styles.card}>
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
              label="Contraseña"
              onChangeText={setPassword}
              onSubmitEditing={handleSignIn}
              placeholder="Ingresa tu contraseña"
              value={password}
            />

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setError("");
                setNotice("La recuperación de contraseña estará disponible más adelante.");
              }}
              style={styles.forgotButton}
            >
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            <PrimaryButton
              label="Iniciar sesión"
              loading={isSubmitting}
              onPress={handleSignIn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Todavía no tienes cuenta?</Text>
            <Link href="/register" asChild>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                style={styles.footerLink}
              >
                <Text style={styles.linkText}>Crea una cuenta</Text>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    width: "100%",
  },
  intro: {
    gap: spacing.sm,
    marginTop: spacing.xl,
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
  forgotButton: {
    alignSelf: "flex-end",
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  footerLink: {
    minHeight: 48,
    justifyContent: "center",
  },
  linkText: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  notice: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
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
    fontSize: 16,
  },
});
