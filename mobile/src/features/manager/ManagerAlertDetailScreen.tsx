import { useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertBadge } from "@/components/AlertBadge";
import { AppScreen } from "@/components/AppScreen";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { usePhotoPicker } from "@/features/alerts/usePhotoPicker";
import { useAuth } from "@/features/auth/AuthProvider";

export function ManagerAlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { alerts, acceptAlert, releaseAlert, resolveAlert } = useAlerts();
  const { photoUri, error, chooseFromLibrary, takePhoto } = usePhotoPicker();
  const [actionMessage, setActionMessage] = useState("");
  const alert = alerts.find((item) => item.id === id);

  if (!user || user.role !== "manager") {
    return <Redirect href="/home" />;
  }

  if (!alert) {
    return (
      <AppScreen>
        <Text style={styles.emptyText}>No encontramos este caso.</Text>
      </AppScreen>
    );
  }

  const isAssignedToMe = alert.managerId === user.id;
  const handleAccept = () => {
    acceptAlert(alert.id, user);
    setActionMessage("Caso aceptado. Ya aparece en tu sección En atención.");
  };
  const handleRelease = () => {
    releaseAlert(alert.id, user.id);
    router.replace("/manager");
  };
  const handleResolve = () => {
    if (!photoUri) {
      setActionMessage("Adjunta una foto de evidencia antes de marcarlo como resuelto.");
      return;
    }

    resolveAlert(alert.id, user.id, photoUri);
    setActionMessage("Caso enviado a revisión del administrador.");
  };

  return (
    <AppScreen>
      <Pressable onPress={() => router.replace("/manager")} style={styles.back}>
        <Text style={styles.backText}>‹ Bandeja</Text>
      </Pressable>
      {alert.photoUri ? (
        <Image source={{ uri: alert.photoUri }} resizeMode="cover" style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoLabel}>Foto del problema</Text>
        </View>
      )}
      <ScreenTitle title={alert.title} />
      <View style={styles.badges}>
        <AlertBadge kind="urgency" value={alert.urgency} />
        <AlertBadge kind="status" value={alert.status} />
      </View>
      <View style={styles.card}>
        <Text style={styles.descriptionLabel}>Descripción</Text>
        <Text style={styles.description}>{alert.description}</Text>
        <Text style={styles.meta}>
          Reportó: {alert.reporterName} · hace {relativeTime(alert.createdAt)}
        </Text>
        <Text style={styles.meta}>
          {alert.location} · {alert.building}
        </Text>
      </View>
      <View style={styles.instruction}>
        <Text style={styles.instructionText}>
          Al terminar, sube una foto de evidencia y marca el caso como resuelto.
          El administrador aprobará el cierre.
        </Text>
      </View>

      {alert.status === "new" ? (
        <View style={styles.actions}>
          <PrimaryButton label="Aceptar caso" onPress={handleAccept} />
          <PrimaryButton label="No me corresponde" onPress={handleRelease} variant="outline" />
        </View>
      ) : null}

      {alert.status === "in_progress" && isAssignedToMe ? (
        <View style={styles.actions}>
          <PhotoPicker
            emptyLabel="Foto de evidencia (requerida)"
            error={error}
            onChooseFromLibrary={chooseFromLibrary}
            onTakePhoto={takePhoto}
            photoUri={photoUri}
          />
          <PrimaryButton label="Marcar como resuelto" onPress={handleResolve} />
          <PrimaryButton
            label="No me corresponde"
            onPress={handleRelease}
            variant="outline"
          />
        </View>
      ) : null}

      {alert.status === "awaiting_review" ? (
        <Text style={styles.notice}>Este cierre está esperando la revisión del administrador.</Text>
      ) : null}
      {alert.status === "approved" ? (
        <Text style={styles.notice}>El administrador aprobó el cierre.</Text>
      ) : null}
      {actionMessage ? (
        <Text accessibilityRole="alert" style={styles.notice}>
          {actionMessage}
        </Text>
      ) : null}
    </AppScreen>
  );
}

function relativeTime(timestamp: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h` : "ayer";
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  backText: {
    color: colors.primary,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  photo: {
    width: "100%",
    height: 190,
    borderRadius: radii.card,
    backgroundColor: colors.border,
  },
  photoPlaceholder: {
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.card,
    backgroundColor: colors.border,
  },
  photoLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  card: {
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  descriptionLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  description: {
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 23,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
  instruction: {
    borderRadius: radii.card,
    backgroundColor: colors.infoBackground,
    padding: spacing.md,
  },
  instructionText: {
    color: colors.primaryDark,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: spacing.md,
  },
  notice: {
    color: colors.primaryDark,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
});
