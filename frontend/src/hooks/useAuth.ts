import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth";
import { authApi } from "@/lib/api/auth";
import type { LoginRequest, RegisterRequest } from "@/types";

// Helper function to check if auth tokens exist using auth store
const hasAuthTokens = () => {
  if (typeof window === "undefined") return false;

  try {
    const { useAuthStore } = require("@/lib/stores/auth");
    const { accessToken, refreshToken, _hasHydrated } = useAuthStore.getState();

    // Only return true if store has hydrated and both tokens exist
    return _hasHydrated && !!(accessToken && refreshToken);
  } catch {
    return false;
  }
};

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Get current user
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: () => authApi.getProfile(),
    enabled: isAuthenticated && hasAuthTokens(), // Only fetch if both conditions are met
    retry: (failureCount, error: any) => {
      // If we get 401/403, it means the user is not actually authenticated
      // Don't retry and clear the auth state
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
        return false;
      }
      return failureCount < 3;
    },
  });

  // Login
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      if (data.success) {
        // Update auth state with user data and tokens
        login({
          user: data.user,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          message: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["user"] });

        // Handle redirect
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      // Error handling can be added here if needed
    },
  });

  // Register
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) => authApi.register(userData),
    onSuccess: (data) => {
      if (data.success) {
        // Update auth state with user data and tokens
        login({
          user: data.user,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          message: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["user"] });

        // Handle redirect
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      }
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      // Error handling can be added here if needed
    },
  });

  // Logout
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: (data) => {
      if (data.success) {
        // Clear local state
        logout();
        queryClient.clear();

        // Handle redirect
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      }
    },
    onError: (error: any) => {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state
      logout();
      queryClient.clear();
      window.location.href = "/login";
    },
  });

  return {
    user: userQuery.data || user,
    isAuthenticated,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      userQuery.isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
  };
}
