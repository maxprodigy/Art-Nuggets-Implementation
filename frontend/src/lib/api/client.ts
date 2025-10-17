import axios from "axios";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your preferred storage
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized - invalid/expired token)
    if (error.response?.status === 401) {
      // Check if this is already a retry attempt
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshToken =
            typeof window !== "undefined"
              ? localStorage.getItem("refresh_token")
              : null;

          if (refreshToken) {
            const response = await apiClient.post("/auth/refresh", {
              refresh_token: refreshToken,
            });

            // Update tokens
            if (typeof window !== "undefined") {
              localStorage.setItem("access_token", response.data.access_token);
              localStorage.setItem(
                "refresh_token",
                response.data.refresh_token
              );
            }

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            // Redirect to login page
            window.location.href = "/login";
          }
        }
      } else {
        // Refresh also failed - clear tokens and redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }

    // Handle 403 errors (forbidden - insufficient permissions)
    if (error.response?.status === 403) {
      // Don't logout user - just show permission error
      // This will be handled by the component making the request
      console.warn("Access forbidden:", error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
