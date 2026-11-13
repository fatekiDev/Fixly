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
        <Pressable accessibilityRole="button" onPress={onTakePhoto} hitSlop={8}>
          <Text style={styles.action}>Tomar foto</Text>
        </Pressable>
        <Text style={styles.separator}>·</Text>
        <Pressable accessibilityRole="button" onPress={onChooseFromLibrary} hitSlop={8}>
          <Text style={styles.action}>Elegir de galería</Text>
        </Pressable>
        {photoUri && onRemove ? (
          <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8}>
            <Text style={styles.remove}>Quitar</Text>
          </Pressable>
        ) : null}
      </View>
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
    fontSize: 15,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  action: {
    color: colors.primary,
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
  },
  separator: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  remove: {
    marginLeft: spacing.sm,
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
