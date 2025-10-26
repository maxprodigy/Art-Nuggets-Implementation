import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, AuthResponse } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  completedOnboarding: boolean;
  _hasHydrated: boolean; // Track hydration status
  login: (authData: AuthResponse) => void;
  logout: () => void;
  setOnboardingCompleted: (completed: boolean) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      completedOnboarding: false,
      _hasHydrated: false,

      login: (authData: AuthResponse) => {
        set({
          user: authData.user as unknown as User,
          accessToken: authData.access_token,
          refreshToken: authData.refresh_token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setOnboardingCompleted: (completed: boolean) => {
        set({
          completedOnboarding: completed,
        });
      },

      updateTokens: (accessToken: string, refreshToken: string) => {
        set({
          accessToken,
          refreshToken,
        });
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({
          _hasHydrated: hasHydrated,
        });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
