import { useAuthStore } from "@/lib/stores/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function useNavbarAuth() {
  const { isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [hasAuthHistory, setHasAuthHistory] = useState<boolean | null>(null);

  // Check auth history on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("auth-storage");
      setHasAuthHistory(authData !== null);
    }
  }, []);

  // Determine button text and action based on auth state
  const getAuthButton = () => {
    // During SSR or before hydration, default to "Sign Up"
    if (!_hasHydrated || hasAuthHistory === null) {
      return {
        text: "Sign Up",
        action: () => router.push("/auth/signup"),
        variant: "default" as const,
      };
    }

    if (isAuthenticated) {
      return {
        text: "Logout",
        action: () => logout(),
        variant: "outline" as const,
      };
    } else {
      return {
        text: hasAuthHistory ? "Login" : "Sign Up",
        action: () =>
          router.push(hasAuthHistory ? "/auth/login" : "/auth/signup"),
        variant: "default" as const,
      };
    }
  };

  return getAuthButton();
}
