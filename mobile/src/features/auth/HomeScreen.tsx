import { Redirect } from "expo-router";
import { useAuth } from "@/features/auth/AuthProvider";

export function HomeScreen() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/" />;
  }

  if (user.role === "member") {
    return <Redirect href="/member" />;
  }

  if (user.role === "manager") {
    return <Redirect href="/manager" />;
  }

  return <Redirect href="/admin" />;
}
