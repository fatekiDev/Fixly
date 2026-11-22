import { useEffect, useState } from "react";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AlertBadge } from "@/components/AlertBadge";
import { AuthenticatedImage } from "@/components/AuthenticatedImage";
import { AppScreen } from "@/components/AppScreen";
import { PhotoPicker } from "@/components/PhotoPicker";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import type { AlertArea } from "@/data/mockAlerts";
import type { AuthUser } from "@/data/mockUsers";
import { apiRequest } from "@/features/api/apiClient";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { usePhotoPicker } from "@/features/alerts/usePhotoPicker";
import { useAuth } from "@/features/auth/AuthProvider";

export function ManagerAlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    alerts,
    acceptAlert,
    releaseAlert,
    reassignAlert,
    resolveAlert,
    error: apiError,
  } = useAlerts();
  const { photoUri, error, chooseFromLibrary, takePhoto } = usePhotoPicker();
  const [actionMessage, setActionMessage] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [actingAction, setActingAction] = useState<
    "accept" | "release" | "reassign" | "resolve" | null
  >(null);
  const [showReassignOptions, setShowReassignOptions] = useState(false);
  const [isAreaListOpen, setIsAreaListOpen] = useState(false);
  const [managers, setManagers] = useState<AuthUser[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [managerListError, setManagerListError] = useState("");
  const [selectedArea, setSelectedArea] = useState<AlertArea | null>(null);
  const alert = alerts.find((item) => item.id === id);

  useEffect(() => {
    if (!showReassignOptions) return;
    let active = true;
    apiRequest<{ managers: AuthUser[] }>("/api/users/managers")
      .then((response) => {
        if (active) setManagers(response.managers);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setManagerListError(
            loadError instanceof Error
              ? loadError.message
              : "No pudimos cargar los encargados.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingManagers(false);
      });
    return () => {
      active = false;
    };
  }, [showReassignOptions]);

  if (!user || user.role !== "manager" || !user.area) {
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
  const destinationManagers = Array.from(
    new Map(
      managers
        .filter((manager) => manager.area && manager.area !== user.area)
        .map((manager) => [manager.area, manager]),
    ).values(),
  );
  const selectedManager = managers.find((manager) => manager.area === selectedArea);
  const handleAccept = async () => {
    setIsActing(true);
    setActingAction("accept");
    setActionMessage("");
    try {
      await acceptAlert(alert.id, user);
      setActionMessage("Caso aceptado. Ya aparece en tu sección En atención.");
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : "No pudimos aceptar el caso.");
    } finally {
      setIsActing(false);
      setActingAction(null);
    }
  };
  const handleRelease = async () => {
    setIsActing(true);
    setActingAction("release");
    try {
      await releaseAlert(alert.id, user.id);
      router.replace("/manager");
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : "No pudimos liberar el caso.");
    } finally {
      setIsActing(false);
      setActingAction(null);
    }
  };
  const handleReassign = async () => {
    if (!selectedArea) {
      setActionMessage("Selecciona el área que debe recibir esta alerta.");
      return;
    }

    setIsActing(true);
    setActingAction("reassign");
    setActionMessage("");
    try {
      await reassignAlert(alert.id, selectedArea);
      router.replace("/manager");
    } catch (actionError) {
      setActionMessage(
        actionError instanceof Error
          ? actionError.message
          : "No pudimos derivar la alerta.",
      );
    } finally {
      setIsActing(false);
      setActingAction(null);
    }
  };
  const handleResolve = async () => {
    if (!photoUri) {
      setActionMessage("Adjunta una foto de evidencia antes de marcarlo como resuelto.");
      return;
    }

    setIsActing(true);
    setActingAction("resolve");
    try {
      await resolveAlert(alert.id, user.id, photoUri);
      setActionMessage("Caso enviado a revisión del administrador.");
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : "No pudimos resolver el caso.");
    } finally {
      setIsActing(false);
      setActingAction(null);
    }
  };

  return (
    <AppScreen>
      <Pressable
        onPress={() => router.replace("/manager")}
        style={styles.back}
      >
        <Text style={styles.backText}>‹ Bandeja</Text>
      </Pressable>
      {alert.photoUri ? (
        <AuthenticatedImage uri={alert.photoUri} style={styles.photo} />
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
          <PrimaryButton
            label="Aceptar caso"
            onPress={handleAccept}
            disabled={isActing}
            loading={actingAction === "accept"}
          />
          <PrimaryButton
            label={showReassignOptions ? "Cancelar derivación" : "No me corresponde"}
            onPress={() => {
              const isOpening = !showReassignOptions;
              if (isOpening) {
                setIsLoadingManagers(true);
                setManagerListError("");
                setManagers([]);
              }
              setShowReassignOptions((visible) => !visible);
              setSelectedArea(null);
              setIsAreaListOpen(false);
              setActionMessage("");
            }}
            variant="outline"
            disabled={isActing}
          />
          {showReassignOptions ? (
            <View style={styles.reassignCard}>
              <Text style={styles.reassignTitle}>¿A qué área corresponde?</Text>
              <Text style={styles.reassignDescription}>
                La alerta se quitará de tu bandeja y llegará al encargado del área seleccionada.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isAreaListOpen }}
                onPress={() => setIsAreaListOpen((open) => !open)}
                style={styles.selectArea}
              >
                <Text style={selectedManager ? styles.selectedAreaText : styles.selectPlaceholder}>
                  {selectedManager
                    ? `${selectedManager.area} · ${selectedManager.name}`
                    : "Selecciona un área"}
                </Text>
                <Text style={styles.dropdownIndicator}>⌄</Text>
              </Pressable>
              {isLoadingManagers ? (
                <ActivityIndicator color={colors.primary} />
              ) : null}
              {managerListError ? (
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {managerListError}
                </Text>
              ) : null}
              {isAreaListOpen && !isLoadingManagers && !managerListError ? (
                destinationManagers.map((manager) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: manager.area === selectedArea }}
                    key={manager.id}
                    onPress={() => {
                      if (manager.area) setSelectedArea(manager.area);
                      setIsAreaListOpen(false);
                    }}
                    style={[
                      styles.managerOption,
                      manager.area === selectedArea && styles.managerOptionSelected,
                    ]}
                  >
                    <Text style={styles.managerOptionArea}>{manager.area}</Text>
                    <Text style={styles.managerOptionName}>
                      {manager.name} · {manager.email}
                    </Text>
                  </Pressable>
                ))
              ) : null}
              {!isLoadingManagers &&
              !managerListError &&
              isAreaListOpen &&
              !destinationManagers.length ? (
                <Text style={styles.errorText}>
                  No hay encargados registrados para otras áreas.
                </Text>
              ) : null}
              <PrimaryButton
                label={selectedArea ? `Derivar a ${selectedArea}` : "Derivar alerta"}
                onPress={handleReassign}
                disabled={isActing || !selectedArea}
                loading={actingAction === "reassign"}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {alert.status === "in_progress" && isAssignedToMe ? (
        <View style={styles.actions}>
          <PhotoPicker
            emptyLabel="Foto de evidencia (requerida)"
            error={error || apiError}
            onChooseFromLibrary={chooseFromLibrary}
            onTakePhoto={takePhoto}
            photoUri={photoUri}
          />
          <PrimaryButton
            label="Marcar como resuelto"
            onPress={handleResolve}
            disabled={isActing}
            loading={actingAction === "resolve"}
          />
          <PrimaryButton
            label="Liberar caso"
            onPress={handleRelease}
            variant="outline"
            disabled={isActing}
            loading={actingAction === "release"}
          />
        </View>
      ) : null}

      {alert.status === "awaiting_review" ? (
        <Text style={styles.notice}>Este cierre está esperando la revisión del administrador.</Text>
      ) : null}
      {alert.status === "approved" ? (
        <Text style={styles.notice}>El administrador aprobó el cierre.</Text>
      ) : null}
      {actionMessage || apiError ? (
        <Text accessibilityRole="alert" style={styles.notice}>
          {actionMessage || apiError}
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
    minHeight: 48,
    justifyContent: "center",
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
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
  reassignCard: {
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  reassignTitle: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
  reassignDescription: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  selectArea: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
  },
  selectPlaceholder: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
  selectedAreaText: {
    color: colors.text,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  dropdownIndicator: {
    color: colors.textSecondary,
    fontSize: 20,
  },
  managerOption: {
    minHeight: 48,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    padding: spacing.sm,
  },
  managerOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.infoBackground,
  },
  managerOptionArea: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
  },
  managerOptionName: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 16,
  },
  notice: {
    color: colors.primaryDark,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 16,
  },
});
