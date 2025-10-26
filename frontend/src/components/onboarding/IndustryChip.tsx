"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Industry } from "@/types/onboarding";
import { Check } from "lucide-react";

interface IndustryChipProps {
  industry: Industry;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function IndustryChip({
  industry,
  isSelected,
  onClick,
  className,
}: IndustryChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full border-2 transition-all duration-200",
        "text-sm font-medium whitespace-nowrap",
        "hover:shadow-lg hover:scale-105 transform",
        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
        isSelected
          ? "border-orange-500 bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
          : "border-gray-300 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50"
      )}
    >
      <span>{industry.name}</span>
      {isSelected && <Check className="w-4 h-4" />}
    </button>
  );
}
