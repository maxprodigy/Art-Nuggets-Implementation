"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Industry } from "@/lib/onboarding-data";
import { Check } from "lucide-react";

interface IndustryCardProps {
  industry: Industry;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export function IndustryCard({
  industry,
  isSelected,
  onClick,
  className,
}: IndustryCardProps) {
  const IconComponent = industry.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02] transform",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center space-x-4">
        <div
          className={cn(
            "p-3 rounded-lg transition-colors duration-200",
            isSelected
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
          )}
        >
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="text-left">
          <h3
            className={cn(
              "text-base font-semibold mb-1",
              isSelected ? "text-blue-900" : "text-gray-900"
            )}
          >
            {industry.name}
          </h3>
          <p
            className={cn(
              "text-sm leading-relaxed",
              isSelected ? "text-blue-700" : "text-gray-600"
            )}
          >
            {industry.description}
          </p>
        </div>
      </div>

      {isSelected && (
        <div className="flex-shrink-0">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </button>
  );
}
