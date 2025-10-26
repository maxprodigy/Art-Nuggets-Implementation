"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Niche } from "@/types/onboarding";

interface NicheChipProps {
  niche: Niche;
  isSelected: boolean;
  onClick: () => void;
  isDisabled?: boolean;
  className?: string;
}

export function NicheChip({
  niche,
  isSelected,
  onClick,
  isDisabled = false,
  className,
}: NicheChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "px-4 py-3 rounded-full border-2 transition-all duration-200",
        "text-sm font-medium whitespace-nowrap",
        "hover:shadow-md hover:scale-105 transform",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        isSelected
          ? "border-blue-500 bg-blue-500 text-white shadow-md"
          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
      )}
    >
      {niche.name}
    </button>
  );
}
