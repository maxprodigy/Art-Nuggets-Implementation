import { useAuthStore } from "@/lib/stores/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface AuthButtonConfig {
  authenticatedText: string;
  authenticatedAction: () => void;
  unauthenticatedText?: string;
  unauthenticatedAction?: () => void;
}

export function useAuthButton(config: AuthButtonConfig) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [hasAuthHistory, setHasAuthHistory] = useState<boolean | null>(null);

  // Check auth history on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("auth-storage");
      setHasAuthHistory(authData !== null);
    }
  }, []);

  const getButtonProps = () => {
    // During SSR or before hydration, default to "Sign Up"
    if (!_hasHydrated || hasAuthHistory === null) {
      return {
        text: "Sign Up",
        action: () => router.push("/auth/signup"),
      };
    }

    if (isAuthenticated) {
      return {
        text: config.authenticatedText,
        action: config.authenticatedAction,
      };
    } else {
      return {
        text: hasAuthHistory ? "Login" : "Sign Up",
        action: () =>
          router.push(hasAuthHistory ? "/auth/login" : "/auth/signup"),
      };
    }
  };

  return getButtonProps();
}
