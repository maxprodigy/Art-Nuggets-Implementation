"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "./UserAvatar";
import {
  LogOut,
  Shield,
  Building2,
  Tag,
  ChevronDown,
  Mail,
  Calendar,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api/auth";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

export function UserProfileMenu() {
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch full profile with industry/niche data
  useEffect(() => {
    if (isAuthenticated && _hasHydrated && user) {
      setLoading(true);
      authApi
        .getProfile()
        .then((data) => {
          setProfileData(data);
        })
        .catch((err) => {
          console.error("Failed to fetch profile:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isAuthenticated, _hasHydrated, user]);

  if (!_hasHydrated || !isAuthenticated || !user) {
    return null;
  }

  const displayName =
    user.artist_name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.email;
  const isAdmin = user.role === "admin";
  const industry = profileData?.profile?.industry;
  const niches = profileData?.profile?.niches || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-auto p-1 hover:bg-transparent rounded-xl transition-all group data-[state=open]:bg-gray-100/30 dark:data-[state=open]:bg-gray-800/30"
          >
            <div className="flex items-center gap-2">
              <UserAvatar
                name={displayName}
                email={user.email}
                isVerified={user.is_verified}
                size="md"
              />
              <ChevronDown className="h-3.5 w-3.5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-72 bg-white/85 dark:bg-gray-900/85 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl rounded-2xl p-0 overflow-hidden"
        >
          {/* Header with gradient accent */}
          <div className="relative px-4 pt-5 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 via-pink-400 via-purple-400 to-blue-400" />
            <div className="flex items-center gap-3">
              <UserAvatar
                name={displayName}
                email={user.email}
                isVerified={user.is_verified}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {displayName}
                  </p>
                  {user.is_verified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Industry & Niches - Creative Card Layout */}
          {(industry || niches.length > 0) && (
            <div className="px-4 py-3.5 space-y-3 border-b border-gray-200/50 dark:border-gray-800/50">
              {industry && (
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-50/60 to-orange-50/60 dark:from-yellow-900/10 dark:to-orange-900/10 p-3 border border-yellow-200/40 dark:border-yellow-800/20">
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 dark:from-yellow-400/10 dark:to-orange-400/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                        Industry
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {industry.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {niches.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Niches
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {niches.slice(0, 4).map((niche, idx) => (
                      <span
                        key={niche.id}
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                          idx % 3 === 0 &&
                            "bg-gradient-to-r from-yellow-100/90 to-orange-100/90 dark:from-yellow-900/20 dark:to-orange-900/20 text-gray-700 dark:text-gray-300 border-yellow-200/60 dark:border-yellow-800/30",
                          idx % 3 === 1 &&
                            "bg-gradient-to-r from-pink-100/90 to-purple-100/90 dark:from-pink-900/20 dark:to-purple-900/20 text-gray-700 dark:text-gray-300 border-pink-200/60 dark:border-pink-800/30",
                          idx % 3 === 2 &&
                            "bg-gradient-to-r from-blue-100/90 to-purple-100/90 dark:from-blue-900/20 dark:to-purple-900/20 text-gray-700 dark:text-gray-300 border-blue-200/60 dark:border-blue-800/30"
                        )}
                      >
                        {niche.name}
                      </span>
                    ))}
                    {niches.length > 4 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                        +{niches.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* See More Button */}
          <div className="px-4 py-2.5 border-b border-gray-200/50 dark:border-gray-800/50">
            <Button
              variant="ghost"
              onClick={() => setShowDetails(true)}
              className="w-full justify-between rounded-lg h-9 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 group"
            >
              <span>View Details</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>

          {/* Actions */}
          <div className="p-2.5 space-y-1">
            {isAdmin && (
              <Button
                variant="ghost"
                asChild
                className="w-full justify-start rounded-lg h-9 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300"
              >
                <a href="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start rounded-lg h-9 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Detailed Profile Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-800/50">
          <DialogHeader>
            <DialogTitle className="text-xl">Profile Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* User Info Card */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-yellow-50/80 via-orange-50/80 to-pink-50/80 dark:from-gray-800/80 dark:via-gray-800/80 dark:to-gray-800/80 p-4 border border-yellow-200/40 dark:border-gray-700/40">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 via-pink-400 via-purple-400 to-blue-400" />
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={displayName}
                  email={user.email}
                  isVerified={user.is_verified}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {displayName}
                    </h3>
                    {user.is_verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Shield className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        Administrator
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Industry Details */}
            {industry && (
              <div className="rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 dark:from-yellow-400/10 dark:to-orange-400/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Industry
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {industry.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All Niches */}
            {niches.length > 0 && (
              <div className="rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    All Niches ({niches.length})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {niches.map((niche, idx) => (
                    <span
                      key={niche.id}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        idx % 3 === 0 &&
                          "bg-gradient-to-r from-yellow-100/90 to-orange-100/90 dark:from-yellow-900/20 dark:to-orange-900/20 text-gray-700 dark:text-gray-300 border-yellow-200/60 dark:border-yellow-800/30",
                        idx % 3 === 1 &&
                          "bg-gradient-to-r from-pink-100/90 to-purple-100/90 dark:from-pink-900/20 dark:to-purple-900/20 text-gray-700 dark:text-gray-300 border-pink-200/60 dark:border-pink-800/30",
                        idx % 3 === 2 &&
                          "bg-gradient-to-r from-blue-100/90 to-purple-100/90 dark:from-blue-900/20 dark:to-purple-900/20 text-gray-700 dark:text-gray-300 border-blue-200/60 dark:border-blue-800/30"
                      )}
                    >
                      {niche.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-400/20 to-blue-400/20 dark:from-green-400/10 dark:to-blue-400/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  Member Since
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
