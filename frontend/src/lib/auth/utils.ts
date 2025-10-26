/**
 * Simple auth utilities
 */

// Navigation utilities
export function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function redirectToDashboard(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/dashboard";
  }
}

// Basic auth check using auth store (client-side)
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const { useAuthStore } = require("@/lib/stores/auth");
    const { isAuthenticated, _hasHydrated } = useAuthStore.getState();

    // Only return true if store has hydrated and user is authenticated
    return _hasHydrated && isAuthenticated;
  } catch {
    return false;
  }
}

// Get current user from auth store
export function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const { useAuthStore } = require("@/lib/stores/auth");
    const { user, _hasHydrated } = useAuthStore.getState();

    return _hasHydrated ? user : null;
  } catch {
    return null;
  }
}

// Get access token from auth store
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const { useAuthStore } = require("@/lib/stores/auth");
    const { accessToken, _hasHydrated } = useAuthStore.getState();

    return _hasHydrated ? accessToken : null;
  } catch {
    return null;
  }
}
