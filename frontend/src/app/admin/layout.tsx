"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Navbar } from "@/components/ui/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration to complete
    if (!_hasHydrated) return;

    // Check if user is authenticated and is admin
    if (!isAuthenticated || !user || user.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, _hasHydrated, router]);

  // Show loading state while checking auth
  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If not admin, don't render (redirect will happen)
  if (user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="default" />
      <AdminNavbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
