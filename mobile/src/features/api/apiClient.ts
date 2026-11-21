import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "fixly.auth.token";
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
export const API_URL =
  configuredUrl ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");

export type ApiError = Error & { status?: number };

export async function getStoredToken() {
  if (Platform.OS === "web") {
    return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string | null) {
  if (Platform.OS === "web") {
    if (token) {
      globalThis.localStorage?.setItem(TOKEN_KEY, token);
    } else {
      globalThis.localStorage?.removeItem(TOKEN_KEY);
    }
    return;
  }
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
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

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `La solicitud falló (${response.status}).`;
    throw Object.assign(new Error(message), { status: response.status } satisfies Partial<ApiError>);
  }
  return data as T;
}
