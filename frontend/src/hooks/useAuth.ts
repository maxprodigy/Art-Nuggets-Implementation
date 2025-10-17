import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth";
import { useAppStore } from "@/lib/stores/app";
import { apiClient } from "@/lib/api/client";
import {
  clearTokens,
  redirectToLogin,
  redirectToDashboard,
} from "@/lib/auth/utils";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types";

/**
 * Custom hook for authentication operations
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, login, logout, setLoading } = useAuthStore();
  const { addNotification } = useAppStore();

  // Fetch current user profile query
  const userQuery = useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => apiClient.get("/auth/me").then((res) => res.data),
    enabled: isAuthenticated, // Only run if user is authenticated
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiClient
        .post<AuthResponse>("/auth/login", credentials)
        .then((res) => res.data),
    onSuccess: (data: AuthResponse) => {
      login(data);
      addNotification({
        type: "success",
        title: "Welcome back!",
        message: `Hello ${data.user.username}`,
      });
      // Invalidate user-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Login failed";
      addNotification({
        type: "error",
        title: "Login Failed",
        message: errorMessage,
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: RegisterRequest) =>
      apiClient
        .post<AuthResponse>("/auth/register", userData)
        .then((res) => res.data),
    onSuccess: (data: AuthResponse) => {
      login(data);
      addNotification({
        type: "success",
        title: "Account Created!",
        message: `Welcome ${data.user.username}`,
      });
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      addNotification({
        type: "error",
        title: "Registration Failed",
        message: errorMessage,
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
    onSuccess: () => {
      logout();
      clearTokens();
      addNotification({
        type: "info",
        title: "Logged Out",
        message: "You have been successfully logged out",
      });
      // Clear all cached data on logout
      queryClient.clear();
      redirectToLogin();
    },
    onError: () => {
      // Even if logout API fails, we should still logout locally
      logout();
      clearTokens();
      queryClient.clear();
      redirectToLogin();
    },
  });

  // Refresh token mutation
  const refreshMutation = useMutation({
    mutationFn: (refreshToken: string) =>
      apiClient
        .post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken })
        .then((res) => res.data),
    onSuccess: (data: AuthResponse) => {
      login(data);
    },
    onError: () => {
      // Refresh failed - logout user
      logout();
      clearTokens();
      queryClient.clear();
      redirectToLogin();
    },
  });

  // Convenience functions
  const handleLogin = useCallback(
    async (credentials: LoginRequest): Promise<boolean> => {
      try {
        await loginMutation.mutateAsync(credentials);
        return true;
      } catch {
        return false;
      }
    },
    [loginMutation]
  );

  const handleRegister = useCallback(
    async (userData: RegisterRequest): Promise<boolean> => {
      try {
        await registerMutation.mutateAsync(userData);
        return true;
      } catch {
        return false;
      }
    },
    [registerMutation]
  );

  const handleLogout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshTokenValue = localStorage.getItem("refresh_token");
    if (!refreshTokenValue) {
      return false;
    }

    try {
      await refreshMutation.mutateAsync(refreshTokenValue);
      return true;
    } catch {
      return false;
    }
  }, [refreshMutation]);

  return {
    user: userQuery.data || user, // Use fresh data from query if available
    isAuthenticated,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      userQuery.isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken,
    // Expose mutation states for more granular control
    loginMutation,
    registerMutation,
    logoutMutation,
    refreshMutation,
    userQuery, // Expose user query for components that need it
  };
}
