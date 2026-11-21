import { useEffect, useState, type PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageURISource,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { API_URL, getStoredToken } from "@/features/api/apiClient";
import { colors } from "@/constants/theme";

type AuthenticatedImageProps = PropsWithChildren<{
  uri: string;
  style?: StyleProp<ViewStyle>;
}>;

export function AuthenticatedImage({ uri, style, children }: AuthenticatedImageProps) {
  const [image, setImage] = useState<{
    uri: string;
    source: ImageURISource;
  } | null>(null);
  const [failedUri, setFailedUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    void getStoredToken()
      .then(async (token) => {
        const isApiImage = uri.startsWith(`${API_URL}/`);
        if (isApiImage && !token) {
          throw new Error("Inicia sesión para ver esta imagen.");
        }
        if (Platform.OS === "web" && isApiImage) {
          const response = await globalThis.fetch(uri, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            throw new Error("No pudimos cargar la imagen.");
          }
          objectUrl = URL.createObjectURL(await response.blob());
          if (active) {
            setImage({ uri, source: { uri: objectUrl } });
          }
          return;
        }

        if (active) {
          setImage({
            uri,
            source: {
              uri,
              ...(isApiImage && token
                ? { headers: { Authorization: `Bearer ${token}` } }
                : {}),
            },
          });
        }
      })
      .catch((error: unknown) => {
        console.error("No se pudo cargar la imagen protegida.", error);
        if (active) setFailedUri(uri);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [uri]);

  return (
    <View style={[styles.container, style]}>
      {image?.uri === uri && failedUri !== uri ? (
        <Image
          source={image.source}
          resizeMode="cover"
          style={styles.image}
          onError={() => setFailedUri(uri)}
        />
      ) : failedUri === uri ? null : (
        <ActivityIndicator color={colors.primary} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.border,
  },
  image: {
    ...StyleSheet.absoluteFill,
    width: "100%",
    height: "100%",
  },
});
