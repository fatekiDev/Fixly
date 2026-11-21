import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily } from "@/constants/theme";

export function BrandHeader() {
  return (
    <View style={styles.container}>
      <Image
        accessibilityLabel="Logo de Fixly"
        contentFit="contain"
        source={require("../../assets/images/fixly-logo-horizontal.png")}
        style={styles.logo}
      />
      <Text style={styles.tagline}>Tu comunidad, en buenas manos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    width: "100%",
  },
  logo: {
    width: 320,
    maxWidth: "100%",
    height: 136,
  },
  tagline: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
});
