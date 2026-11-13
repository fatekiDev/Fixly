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
import { InfoBanner } from "@/components/InfoBanner";
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

  const handleSignIn = () => {
    setError("");
    setNotice("");

    if (!email.trim() || !password) {
      setError("Ingresá tu correo y contraseña para continuar.");
      return;
    }

    if (!signIn(email, password)) {
      setError("El correo o la contraseña no son correctos.");
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
              Ingresá para seguir tus alertas y novedades.
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
              placeholder="Ingresá tu contraseña"
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
            <PrimaryButton label="Iniciar sesión" onPress={handleSignIn} />
          </View>

          <InfoBanner title="Un solo acceso para tu comunidad">
            Miembros, encargados y administradores ingresan con su correo y
            contraseña. Demo: miembro@fixly.cl, encargado@fixly.cl o
            admin@fixly.cl · clave: 1234.
          </InfoBanner>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Todavía no tenés cuenta?</Text>
            <Link href="/register" asChild>
              <Pressable accessibilityRole="link" hitSlop={8}>
                <Text style={styles.linkText}>Creá una cuenta</Text>
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
    paddingVertical: spacing.xs,
  },
  linkText: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  notice: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
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
});
