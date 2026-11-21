import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@/data/mockUsers";
import { apiRequest, getStoredToken, setStoredToken } from "@/features/api/apiClient";
import { getExpoPushToken } from "@/features/notifications/pushNotifications";

type AuthContextValue = {
  user: AuthUser | null;
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const pushToken = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getStoredToken()
      .then((token) => {
        if (!token) return null;
        return apiRequest<{ user: AuthUser }>("/api/auth/me", { token });
      })
      .then((result) => {
        if (mounted && result) setUser(result.user);
      })
      .catch(async () => {
        await setStoredToken(null);
      })
      .finally(() => {
        if (mounted) setIsRestoring(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isRestoring || !user) return;

    let active = true;
    void (async () => {
      try {
        const sessionToken = await getStoredToken();
        if (!sessionToken) return;
        const expoPushToken = await getExpoPushToken(true);
        if (!active || !expoPushToken) return;
        pushToken.current = expoPushToken;
        await apiRequest("/api/push-tokens/register", {
          method: "POST",
          body: { token: expoPushToken },
          token: sessionToken,
        });
      } catch (error) {
        console.error("No se pudo registrar el dispositivo para notificaciones.", error);
      }
    })();

    return () => {
      active = false;
    };
  }, [isRestoring, user]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const result = await apiRequest<{ token: string; user: AuthUser }>(
          "/api/auth/login",
          {
            method: "POST",
            token: null,
            body: { email: normalizedEmail, password },
          },
        );
        await setStoredToken(result.token);
        setUser(result.user);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "No pudimos iniciar sesión.";
      }
    },
    [],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const result = await apiRequest<{ token: string; user: AuthUser }>(
          "/api/auth/register",
          {
            method: "POST",
            token: null,
            body: { name: name.trim(), email: normalizedEmail, password },
          },
        );
        await setStoredToken(result.token);
        setUser(result.user);
        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "No pudimos crear tu cuenta.";
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (pushToken.current) {
      await apiRequest("/api/push-tokens/unregister", {
        method: "POST",
        body: { token: pushToken.current },
      });
      pushToken.current = null;
    }
    await setStoredToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isRestoring, signIn, signUp, signOut }),
    [user, isRestoring, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
