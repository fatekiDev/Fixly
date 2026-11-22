import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";

type PhotoPickerProps = {
  photoUri: string | null;
  error?: string;
  onChooseFromLibrary: () => void;
  onTakePhoto: () => void;
  onRemove?: () => void;
  emptyLabel?: string;
};

export function PhotoPicker({
  photoUri,
  error,
  onChooseFromLibrary,
  onTakePhoto,
  onRemove,
  emptyLabel = "Adjunta una foto del problema",
}: PhotoPickerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} resizeMode="cover" style={styles.image} />
        ) : (
          <Text style={styles.emptyLabel}>{emptyLabel}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onTakePhoto}
          hitSlop={8}
          style={styles.actionButton}
        >
          <Text style={styles.action}>Tomar foto</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onChooseFromLibrary}
          hitSlop={8}
          style={styles.actionButton}
        >
          <Text style={styles.action}>Elegir de galería</Text>
        </Pressable>
      </View>
      {photoUri && onRemove ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRemove}
          style={styles.removeButton}
        >
          <Text style={styles.remove}>Quitar foto</Text>
        </Pressable>
      ) : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  preview: {
    minHeight: 180,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    borderRadius: radii.card,
    backgroundColor: colors.surface,
  },
  image: {
    width: "100%",
    height: 190,
  },
  emptyLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#B6CCFF",
    borderRadius: radii.field,
    backgroundColor: colors.infoBackground,
    paddingHorizontal: spacing.sm,
  },
  action: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    textAlign: "center",
  },
  removeButton: {
    alignSelf: "flex-end",
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  remove: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 16,
    lineHeight: 22,
  },
});
