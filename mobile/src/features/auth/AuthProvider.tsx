import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { MOCK_ACCOUNTS, type AuthUser, type MockAccount } from "@/data/mockUsers";

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string) => boolean;
  signUp: (name: string, email: string, password: string) => boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accounts, setAccounts] = useState<MockAccount[]>(MOCK_ACCOUNTS);
  const [user, setUser] = useState<AuthUser | null>(null);

  const signIn = useCallback(
    (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const account = accounts.find(
        (candidate) =>
          candidate.user.email === normalizedEmail && candidate.password === password,
      );

      if (!account) {
        return false;
      }

      setUser(account.user);
      return true;
    },
    [accounts],
  );

  const signUp = useCallback(
    (name: string, email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      const emailAlreadyExists = accounts.some(
        (account) => account.user.email === normalizedEmail,
      );

      if (emailAlreadyExists) {
        return false;
      }

      const newUser: AuthUser = {
        id: normalizedEmail,
        name: name.trim(),
        email: normalizedEmail,
        role: "member",
      };

      setAccounts((currentAccounts) => [
        ...currentAccounts,
        { user: newUser, password },
      ]);
      setUser(newUser);
      return true;
    },
    [accounts],
  );

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut }),
    [user, signIn, signUp, signOut],
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
