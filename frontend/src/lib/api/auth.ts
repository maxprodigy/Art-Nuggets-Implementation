import { apiClient } from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "@/types";

// Auth API endpoints
export const authApi = {
  // Login user
  login: (credentials: LoginRequest): Promise<AuthResponse> =>
    apiClient.post("/auth/login", credentials).then((res) => res.data),

  // Register user
  register: (userData: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post("/auth/register", userData).then((res) => res.data),

  // Refresh token
  refreshToken: (refreshToken: string): Promise<AuthResponse> =>
    apiClient
      .post("/auth/refresh", { refresh_token: refreshToken })
      .then((res) => res.data),

  // Logout user
  logout: (): Promise<void> =>
    apiClient.post("/auth/logout").then((res) => res.data),

  // Get current user profile
  getProfile: (): Promise<User> =>
    apiClient.get("/auth/me").then((res) => res.data),

  // Update user profile
  updateProfile: (userData: Partial<User>): Promise<User> =>
    apiClient.put("/auth/me", userData).then((res) => res.data),

  // Change password
  changePassword: (data: {
    current_password: string;
    new_password: string;
  }): Promise<void> =>
    apiClient.post("/auth/change-password", data).then((res) => res.data),

  // Request password reset
  forgotPassword: (email: string): Promise<void> =>
    apiClient.post("/auth/forgot-password", { email }).then((res) => res.data),

  // Reset password
  resetPassword: (data: {
    token: string;
    new_password: string;
  }): Promise<void> =>
    apiClient.post("/auth/reset-password", data).then((res) => res.data),

  // Verify email
  verifyEmail: (token: string): Promise<void> =>
    apiClient.post("/auth/verify-email", { token }).then((res) => res.data),

  // Resend verification email
  resendVerification: (): Promise<void> =>
    apiClient.post("/auth/resend-verification").then((res) => res.data),
};
