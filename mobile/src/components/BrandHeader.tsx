import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily } from "@/constants/theme";

export function BrandHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Fixly</Text>
      <Text style={styles.tagline}>Tu comunidad, en buenas manos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  brand: {
    color: colors.primary,
    fontFamily: fontFamily.bold,
    fontSize: 34,
    letterSpacing: -1,
  },
  tagline: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
});
