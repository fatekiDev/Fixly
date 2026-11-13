import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { InfoBanner } from "@/components/InfoBanner";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenTitle } from "@/components/ScreenTitle";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { useAlerts } from "@/features/alerts/AlertProvider";
import { useAuth } from "@/features/auth/AuthProvider";

export function AdminClosureReviewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { alerts, reviewClosure } = useAlerts();
  const alert = alerts.find((item) => item.id === id);

  if (!user || user.role !== "admin") {
    return <Redirect href="/home" />;
  }

  if (!alert) {
    return (
      <AppScreen>
        <Text style={styles.empty}>No encontramos este cierre.</Text>
      </AppScreen>
    );
  }

  const handleReview = (approved: boolean) => {
    reviewClosure(alert.id, approved);
    router.replace("/admin/closures");
  };

  return (
    <AppScreen>
      <Pressable onPress={() => router.replace("/admin/closures")} style={styles.back}>
        <Text style={styles.backText}>‹ Cierres</Text>
      </Pressable>
      <ScreenTitle title="Verificar cierre" />
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.location}>
        {alert.location} · {alert.area}
      </Text>
      <View style={styles.photos}>
        <EvidencePhoto label="Antes (reporte)" uri={alert.photoUri} />
        <EvidencePhoto label="Después (evidencia)" uri={alert.evidenceUri} />
      </View>
      <View style={styles.card}>
        <Text style={styles.detail}>Resuelto por: {alert.managerName ?? "Encargado"}</Text>
        <Text style={styles.detail}>Reportó: {alert.reporterName}</Text>
        <Text style={styles.detail}>
          Tiempo de resolución: {resolutionTime(alert.createdAt)}
        </Text>
      </View>
      <InfoBanner title="Entrega de puntos">
        Al aprobar: +10 puntos para {alert.reporterName} y el caso queda en la bitácora
        del encargado.
      </InfoBanner>
      {alert.status === "awaiting_review" ? (
        <View style={styles.actions}>
          <PrimaryButton
            label="Aprobar y dar puntos"
            onPress={() => handleReview(true)}
          />
          <PrimaryButton
            label="Rechazar cierre"
            onPress={() => handleReview(false)}
            variant="danger"
          />
        </View>
      ) : (
        <Text style={styles.notice}>Este cierre ya fue revisado.</Text>
      )}
    </AppScreen>
  );
}

function EvidencePhoto({ label, uri }: { label: string; uri?: string }) {
  return (
    <View style={styles.photoColumn}>
      {uri ? (
        <Image source={{ uri }} resizeMode="cover" style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Text style={styles.photoLabel}>{label}</Text>
        </View>
      )}
      {uri ? <Text style={styles.caption}>{label}</Text> : null}
    </View>
  );
}

function resolutionTime(timestamp: number) {
  const hours = Math.max(1, Math.floor((Date.now() - timestamp) / (60 * 60 * 1000)));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return days ? `${days} día${days === 1 ? "" : "s"} ${remainingHours} h` : `${hours} h`;
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
  title: {
    color: colors.text,
    fontFamily: fontFamily.semiBold,
    fontSize: 21,
  },
  location: {
    marginTop: -spacing.md,
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
  photos: {
    flexDirection: "row",
    gap: spacing.md,
  },
  photoColumn: {
    flex: 1,
    gap: spacing.xs,
  },
  photo: {
    height: 132,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  photoPlaceholder: {
    height: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.border,
    padding: spacing.sm,
  },
  photoLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    textAlign: "center",
  },
  caption: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    textAlign: "center",
  },
  card: {
    gap: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  detail: {
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: 15,
  },
  actions: {
    gap: spacing.md,
  },
  notice: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  empty: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
  },
});
