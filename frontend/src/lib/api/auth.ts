import { apiClient, backendClient } from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "@/types";

// Auth API endpoints - using Next.js API routes for comprehensive handling
export const authApi = {
  // Login user - uses Next.js API route
  login: (credentials: LoginRequest): Promise<any> =>
    apiClient.post("/api/auth/login", credentials).then((res) => res.data),

  // Register user - uses Next.js API route
  register: (userData: RegisterRequest): Promise<any> =>
    apiClient.post("/api/auth/signup", userData).then((res) => res.data),

  // Refresh token (direct backend call - no cookies needed)
  refreshToken: (): Promise<{ access_token: string }> =>
    backendClient.get("/auth/refresh").then((res) => res.data),

  // Logout user - uses Next.js API route
  logout: (): Promise<any> =>
    apiClient.get("/api/auth/logout").then((res) => res.data),

  // Get current user profile (direct backend call)
  getProfile: (): Promise<User> =>
    backendClient.get("/user-profile/me").then((res) => res.data),

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
