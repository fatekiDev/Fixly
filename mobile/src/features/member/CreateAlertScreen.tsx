import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthField } from "@/components/AuthField";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import type { AlertArea, AlertUrgency } from "@/data/mockAlerts";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { usePhotoPicker } from "@/features/alerts/usePhotoPicker";
import { useAuth } from "@/features/auth/AuthProvider";

const areas: AlertArea[] = ["Aseo", "TI", "Mantenimiento", "Construcción"];
const urgencies: { value: AlertUrgency; label: string }[] = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

export function CreateAlertScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createAlert } = useAlerts();
  const { photoUri, error: photoError, chooseFromLibrary, takePhoto, clearPhoto } =
    usePhotoPicker();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<AlertArea>("Mantenimiento");
  const [urgency, setUrgency] = useState<AlertUrgency>("medium");
  const [error, setError] = useState("");

  if (!user) {
    return <Redirect href="/" />;
  }

  const handlePublish = () => {
    if (!title.trim() || !description.trim()) {
      setError("Completá el título y la descripción para publicar.");
      return;
    }

    const alert = createAlert(
      { title: title.trim(), description: description.trim(), area, urgency, photoUri: photoUri ?? undefined },
      user,
    );
    router.replace({ pathname: "/member/alert/[id]", params: { id: alert.id } });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.replace("/member")} style={styles.back}>
            <Text style={styles.backText}>‹ Cancelar</Text>
          </Pressable>
          <Text style={styles.heading}>Nueva alerta</Text>
          <PhotoPicker
            error={photoError}
            onChooseFromLibrary={chooseFromLibrary}
            onRemove={clearPhoto}
            onTakePhoto={takePhoto}
            photoUri={photoUri}
          />
          <AuthField
            label="Título"
            onChangeText={setTitle}
            placeholder="Ej: Silla sin pernos"
            value={title}
          />
          <View style={styles.field}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              accessibilityLabel="Descripción"
              multiline
              onChangeText={setDescription}
              placeholder="Describe el problema con detalle..."
              placeholderTextColor={colors.textSecondary}
              selectionColor={colors.primary}
              style={styles.description}
              textAlignVertical="top"
              value={description}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Área responsable</Text>
            <View style={styles.chips}>
              {areas.map((item) => {
                const selected = item === area;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={item}
                    onPress={() => setArea(item)}
                    style={[styles.chip, selected && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Urgencia</Text>
            <View style={styles.urgencyPicker}>
              {urgencies.map((item) => {
                const selected = item.value === urgency;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={item.value}
                    onPress={() => setUrgency(item.value)}
                    style={[styles.urgencyOption, selected && styles.urgencySelected]}
                  >
                    <Text style={[styles.urgencyText, selected && styles.urgencyTextSelected]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <PrimaryButton label="Publicar alerta" onPress={handlePublish} />
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
    gap: spacing.md,
    maxWidth: 520,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    width: "100%",
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  backText: {
    color: colors.primary,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  heading: {
    color: colors.text,
    fontFamily: fontFamily.bold,
    fontSize: 32,
    letterSpacing: -0.8,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  description: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.surface,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    color: "#475569",
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  urgencyPicker: {
    flexDirection: "row",
    gap: spacing.xs,
    borderRadius: radii.card,
    backgroundColor: "#EEF2F7",
    padding: spacing.xs,
  },
  urgencyOption: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  urgencySelected: {
    backgroundColor: colors.surface,
  },
  urgencyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  urgencyTextSelected: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
