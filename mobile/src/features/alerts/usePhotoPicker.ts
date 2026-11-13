import { useCallback, useState } from "react";
import * as ImagePicker from "expo-image-picker";

export function usePhotoPicker() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [error, setError] = useState("");

  const chooseFromLibrary = useCallback(async () => {
    setError("");

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0]?.uri ?? null);
      }
    } catch (pickerError) {
      console.error("No se pudo abrir la galería.", pickerError);
      setError("No se pudo abrir la galería. Intenta nuevamente.");
    }
  }, []);

  const takePhoto = useCallback(async () => {
    setError("");

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError("Necesitas permitir el acceso a la cámara para tomar una foto.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0]?.uri ?? null);
      }
    } catch (pickerError) {
      console.error("No se pudo abrir la cámara.", pickerError);
      setError("No se pudo abrir la cámara. Intenta nuevamente.");
    }
  }, []);

  const clearPhoto = useCallback(() => setPhotoUri(null), []);

  return { photoUri, error, chooseFromLibrary, takePhoto, clearPhoto };
}
