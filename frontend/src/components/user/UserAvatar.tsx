"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface UserAvatarProps {
  name: string;
  email?: string;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: boolean;
}

// Generate consistent gradient colors based on name
const getGradientColors = (name: string): string => {
  const colors = [
    "from-yellow-400 via-orange-400 to-pink-400",
    "from-purple-400 via-pink-400 to-red-400",
    "from-blue-400 via-purple-400 to-pink-400",
    "from-green-400 via-blue-400 to-purple-400",
    "from-orange-400 via-red-400 to-pink-400",
    "from-indigo-400 via-purple-400 to-pink-400",
  ];

  // Simple hash function to get consistent color for same name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Get initials from name
const getInitials = (name: string): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function UserAvatar({
  name,
  email,
  isVerified = false,
  size = "md",
  className,
  showBadge = true,
}: UserAvatarProps) {
  const initials = getInitials(name);
  const gradient = getGradientColors(name || email || "user");

  return (
    <div className={cn("relative inline-flex", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-white/20 dark:ring-gray-800/20",
          `bg-gradient-to-br ${gradient}`,
          sizeClasses[size]
        )}
      >
        <span className="relative z-10">{initials}</span>
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-full bg-white/10 blur-sm" />
      </div>
      {isVerified && showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white dark:bg-gray-900 p-0.5">
          <CheckCircle2 className="h-3 w-3 text-blue-500 fill-blue-500" />
        </div>
      )}
    </div>
  );
}

