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

type SelectionTone = {
  background: string;
  border: string;
  selectedBackground: string;
  selectedBorder: string;
  text: string;
  selectedText: string;
};

const areaTones: Record<AlertArea, SelectionTone> = {
  Aseo: {
    background: "#F0FAF4",
    border: "#B7E4C7",
    selectedBackground: "#DDF3E5",
    selectedBorder: "#86CDA0",
    text: "#26734D",
    selectedText: "#1D5C3C",
  },
  TI: {
    background: "#F0F6FF",
    border: "#B8D3FA",
    selectedBackground: "#DDEBFF",
    selectedBorder: "#8DB7F2",
    text: "#2856A6",
    selectedText: "#1E448A",
  },
  Mantenimiento: {
    background: "#F6F2FF",
    border: "#D3C4F5",
    selectedBackground: "#E9E0FB",
    selectedBorder: "#B9A1E8",
    text: "#6546A5",
    selectedText: "#51358B",
  },
  Construcción: {
    background: "#FFFAE8",
    border: "#F2D98B",
    selectedBackground: "#FFF1C2",
    selectedBorder: "#E8C458",
    text: "#8C6500",
    selectedText: "#705100",
  },
};

const urgencyTones: Record<AlertUrgency, SelectionTone> = {
  low: {
    background: "#FEFCE8",
    border: "#FDE68A",
    selectedBackground: "#FEF3C7",
    selectedBorder: "#F5CF55",
    text: "#854D0E",
    selectedText: "#713F12",
  },
  medium: {
    background: "#FFF7ED",
    border: "#FDBA74",
    selectedBackground: "#FFEDD5",
    selectedBorder: "#FB923C",
    text: "#9A3412",
    selectedText: "#7C2D12",
  },
  high: {
    background: "#FEF2F2",
    border: "#FCA5A5",
    selectedBackground: "#FEE2E2",
    selectedBorder: "#F87171",
    text: "#B91C1C",
    selectedText: "#991B1B",
  },
};

export function CreateAlertScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createAlert, error: apiError } = useAlerts();
  const { photoUri, error: photoError, chooseFromLibrary, takePhoto, clearPhoto } =
    usePhotoPicker();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<AlertArea>("Mantenimiento");
  const [urgency, setUrgency] = useState<AlertUrgency>("medium");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return <Redirect href="/" />;
  }

  const handlePublish = async () => {
    if (isSubmitting) return;
    if (!title.trim() || !description.trim()) {
      setError("Completa el título y la descripción para publicar.");
      return;
    }

    setIsSubmitting(true);
    const alert = await createAlert(
      { title: title.trim(), description: description.trim(), area, urgency, photoUri: photoUri ?? undefined },
      user,
    );
    setIsSubmitting(false);
    if (!alert) {
      setError("");
      return;
    }
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
                const tone = areaTones[item];
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={item}
                    onPress={() => setArea(item)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? tone.selectedBackground
                          : tone.background,
                        borderColor: selected ? tone.selectedBorder : tone.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: selected ? tone.selectedText : tone.text },
                        selected && styles.chipTextSelected,
                      ]}
                    >
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
                const tone = urgencyTones[item.value];
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={item.value}
                    onPress={() => setUrgency(item.value)}
                    style={[
                      styles.urgencyOption,
                      {
                        backgroundColor: selected
                          ? tone.selectedBackground
                          : tone.background,
                        borderColor: selected ? tone.selectedBorder : tone.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        { color: selected ? tone.selectedText : tone.text },
                        selected && styles.urgencyTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          {error || apiError ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error || apiError}
            </Text>
          ) : null}
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
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  chipTextSelected: {
    fontFamily: fontFamily.semiBold,
  },
  urgencyPicker: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  urgencyOption: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.xs,
  },
  urgencyText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  urgencyTextSelected: {
    fontFamily: fontFamily.semiBold,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
