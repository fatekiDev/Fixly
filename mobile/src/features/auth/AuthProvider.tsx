import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import type { AuthUser } from "@/data/mockUsers";
import { apiRequest, getStoredToken, setStoredToken } from "@/features/api/apiClient";

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
