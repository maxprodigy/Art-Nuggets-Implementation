"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { isAuthenticated, redirectToLogin } from "@/lib/auth/utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated: authState, user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    // Check if user is authenticated
    if (!authState || !user) {
      redirectToLogin();
      return;
    }
  }, [authState, user, isLoading]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!authState || !user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
          </div>
        </div>
      )
    );
  }

  // Note: Role-based access control should be handled by the backend
  // The frontend will receive 403 errors for unauthorized access attempts

  // User is authenticated and has required permissions
  return <>{children}</>;
}

// Note: Role-based route protection should be handled by the backend
// Use ProtectedRoute for basic authentication, backend handles authorization
