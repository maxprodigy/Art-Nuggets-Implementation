"use client";

import React from "react";
import { IndustryChip } from "./IndustryChip";
import { Industry } from "@/types/onboarding";
import { Loader2 } from "lucide-react";

interface IndustrySelectionStepProps {
  industries: Industry[];
  selectedIndustry: Industry | null;
  onIndustrySelect: (industry: Industry) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function IndustrySelectionStep({
  industries,
  selectedIndustry,
  onIndustrySelect,
  isLoading = false,
  error,
  onRetry,
}: IndustrySelectionStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-16">
          <h1 className="text-7xl font-light text-gray-900">Let's Know More</h1>
          <h2 className="text-7xl font-light bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            About You
          </h2>
          <p className="text-gray-600 mt-4">Select your primary industry</p>
        </div>

        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-16">
          <h1 className="text-7xl font-light text-gray-900">Let's Know More</h1>
          <h2 className="text-7xl font-light bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            About You
          </h2>
          <p className="text-gray-600 mt-4">Select your primary industry</p>
        </div>

        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-16">
        <h1 className="text-7xl font-light text-gray-900">Let's Know More</h1>
        <h2 className="text-7xl font-light bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          About You
        </h2>
        <p className="text-gray-600 mt-4">Select your primary industry</p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
        {industries.map((industry) => (
          <IndustryChip
            key={industry.id}
            industry={industry}
            isSelected={selectedIndustry?.id === industry.id}
            onClick={() => onIndustrySelect(industry)}
          />
        ))}
      </div>
    </div>
  );
}
