import axios from "axios";

// Create axios instance for Next.js API routes
export const apiClient = axios.create({
  baseURL: "", // Empty baseURL for Next.js API routes (relative URLs)
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Automatically send httpOnly cookies with requests
});

// Create axios instance for direct backend calls
export const backendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for public backend calls (no credentials needed)
export const publicBackendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // No credentials for public endpoints
});

// Create axios instance for admin calls (longer timeout for data aggregation)
export const adminBackendClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
  timeout: 30000, // 30 seconds for admin endpoints that may need to aggregate data
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Authorization header to admin requests
adminBackendClient.interceptors.request.use((config) => {
  // Get token from auth store
  if (typeof window !== "undefined") {
    try {
      // Import auth store dynamically to avoid SSR issues
      const { useAuthStore } = require("@/lib/stores/auth");
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error getting token from auth store:", error);
    }
  }
  return config;
});

// Handle token refresh on 401 errors for admin client
adminBackendClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        // Get refresh token from auth store
        const { useAuthStore } = require("@/lib/stores/auth");
        const { refreshToken } = useAuthStore.getState();

        if (refreshToken) {
          // Try to refresh token
          const response = await backendClient.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          // Update tokens in store
          if (typeof window !== "undefined") {
            useAuthStore
              .getState()
              .updateTokens(
                response.data.access_token,
                response.data.refresh_token
              );
          }

          // Retry original request
          return adminBackendClient(error.config);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed - redirect to login
        if (typeof window !== "undefined") {
          const { useAuthStore } = require("@/lib/stores/auth");
          useAuthStore.getState().logout();
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// Add Authorization header to requests
backendClient.interceptors.request.use((config) => {
  // Get token from auth store
  if (typeof window !== "undefined") {
    try {
      // Import auth store dynamically to avoid SSR issues
      const { useAuthStore } = require("@/lib/stores/auth");
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error getting token from auth store:", error);
    }
  }
  return config;
});

// Handle token refresh on 401 errors
backendClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      try {
        // Get refresh token from auth store
        const { useAuthStore } = require("@/lib/stores/auth");
        const { refreshToken } = useAuthStore.getState();

        if (refreshToken) {
          // Try to refresh token
          const response = await backendClient.post("/auth/refresh", {
            refresh_token: refreshToken,
          });

          // Update tokens in store
          if (typeof window !== "undefined") {
            useAuthStore
              .getState()
              .updateTokens(
                response.data.access_token,
                response.data.refresh_token
              );
          }

          // Retry original request
          return backendClient(error.config);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed - redirect to login
        if (typeof window !== "undefined") {
          const { useAuthStore } = require("@/lib/stores/auth");
          useAuthStore.getState().logout();
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
