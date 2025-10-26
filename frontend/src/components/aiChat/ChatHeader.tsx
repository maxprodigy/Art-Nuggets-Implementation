"use client";

import React from "react";
import { useAuthStore } from "@/lib/stores/auth";

interface ChatHeaderProps {
  className?: string;
}

export function ChatHeader({ className }: ChatHeaderProps) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();

  // Show "Guest" if not authenticated or not hydrated yet
  const displayName =
    _hasHydrated && isAuthenticated && user?.artist_name
      ? user.artist_name
      : "Guest";

  return (
    <div className={`bg-black rounded-2xl px-6 py-4 mb-6 ${className}`}>
      <h1 className="text-white text-lg font-medium">👋 Hi, {displayName}</h1>
    </div>
  );
}
