/**
 * Authentication utility functions
 */

// Token management
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// Authentication state checks
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  return !!token;
}

// Token validation (basic check - just verify token exists and has basic structure)
export function isTokenValid(token: string): boolean {
  if (!token) return false;

  try {
    // Basic JWT structure check (3 parts separated by dots)
    const parts = token.split(".");
    return parts.length === 3;
  } catch {
    return false;
  }
}

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

export function redirectToUnauthorized(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/unauthorized";
  }
}

// Note: Role and permission checking should be handled by the backend
// The frontend should rely on the backend's authorization responses
