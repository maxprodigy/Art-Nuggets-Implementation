"use client";

import React from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Navbar } from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, Mail, Calendar, Edit } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const displayName =
    user.artist_name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.email;
  const isAdmin = user.role === "admin";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-24 sm:pt-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Card */}
          <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    name={displayName}
                    email={user.email}
                    isVerified={user.is_verified}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-2xl">{displayName}</CardTitle>
                      {user.is_verified && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          Administrator
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/profile/settings">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-400/10 dark:to-purple-400/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400/20 to-blue-400/20 dark:from-green-400/10 dark:to-blue-400/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member Since
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {user.first_name && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Full Name
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {user.first_name} {user.last_name || ""}
                  </p>
                </div>
              )}

              {user.artist_name && (
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Artist Name
                  </p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {user.artist_name}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

