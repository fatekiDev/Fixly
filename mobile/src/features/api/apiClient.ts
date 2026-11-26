import { Platform } from "react-native";
import Constants from "expo-constants";
import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "fixly.auth.token";
const API_PORT = 3000;
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

// En desarrollo la API corre en el mismo computador que Expo (Metro).
// Expo expone la IP de ese computador en hostUri ("192.168.x.x:8081"),
// así que la usamos para no tener que editar la IP en cada red nueva.
function detectDevApiUrl() {
  if (Platform.OS === "web") {
    const hostname = globalThis.location?.hostname;
    return hostname ? `http://${hostname}:${API_PORT}` : null;
  }
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:${API_PORT}` : null;
}

export const API_URL =
  configuredUrl ||
  detectDevApiUrl() ||
  (Platform.OS === "android"
    ? `http://10.0.2.2:${API_PORT}`
    : `http://localhost:${API_PORT}`);

export type ApiError = Error & { status?: number };

export async function getStoredToken() {
  if (Platform.OS === "web") {
    return globalThis.sessionStorage?.getItem(TOKEN_KEY) ?? null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string | null) {
  if (Platform.OS === "web") {
    if (token) {
      globalThis.sessionStorage?.setItem(TOKEN_KEY, token);
    } else {
      globalThis.sessionStorage?.removeItem(TOKEN_KEY);
    }
    return;
  }
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

async function responseError(response: Response) {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  const message =
    data && typeof data === "object" && "error" in data
      ? String((data as { error: unknown }).error)
      : `La solicitud falló (${response.status}).`;
  return Object.assign(new Error(message), { status: response.status } satisfies Partial<ApiError>);
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    token?: string | null;
  } = {},
): Promise<T> {
  const token = options.token === undefined ? await getStoredToken() : options.token;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
  } catch {
    throw Object.assign(new Error("No pudimos conectar con el servidor."), {
      status: 0,
    } satisfies Partial<ApiError>);
  }

  if (!response.ok) {
    throw await responseError(response);
  }
  return (await response.json()) as T;
}

export async function uploadImage(uri: string, kind: "report" | "evidence") {
  const token = await getStoredToken();
  if (!token) {
    throw new Error("Inicia sesión antes de subir una imagen.");
  }

  const formData = new FormData();
  if (Platform.OS === "web") {
    const fileResponse = await globalThis.fetch(uri);
    if (!fileResponse.ok) {
      throw new Error("No pudimos leer la imagen seleccionada.");
    }
    const blob = await fileResponse.blob();
    formData.append("file", blob, "fixly-image");
  } else {
    formData.append("file", new File(uri));
  }

  let response: Response;
  try {
    const url = `${API_URL}/api/uploads?kind=${kind}`;
    response =
      Platform.OS === "web"
        ? await globalThis.fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          })
        : await expoFetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          });
  } catch {
    throw new Error("No pudimos conectar con el servidor para subir la imagen.");
  }

  if (!response.ok) {
    throw await responseError(response);
  }
  const result = (await response.json()) as { id: string; url: string };
  return result;
}
