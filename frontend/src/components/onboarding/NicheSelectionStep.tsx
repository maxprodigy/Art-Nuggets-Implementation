"use client";

import React from "react";
import { NicheChip } from "./NicheChip";
import { Industry, Niche } from "@/types/onboarding";
import { Loader2 } from "lucide-react";

interface NicheSelectionStepProps {
  selectedIndustry: Industry | null;
  niches: Niche[];
  selectedNiches: Niche[];
  onNicheToggle: (niche: Niche) => void;
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function NicheSelectionStep({
  selectedIndustry,
  niches,
  selectedNiches,
  onNicheToggle,
  isLoading = false,
  error,
  onRetry,
}: NicheSelectionStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 mb-16">
          <h1 className="text-7xl font-light bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Select your niches
          </h1>
          <p className="text-gray-600 mt-4">
            in {selectedIndustry?.name} (up to 3)
          </p>
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
          <h1 className="text-7xl font-light bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            Select your niches
          </h1>
          <p className="text-gray-600 mt-4">
            in {selectedIndustry?.name} (up to 3)
          </p>
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
        <h1 className="text-7xl font-light bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
          Select your niches
        </h1>
        <p className="text-gray-600 mt-4">
          in {selectedIndustry?.name} (up to 3)
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
        {niches.map((niche) => (
          <NicheChip
            key={niche.id}
            niche={niche}
            isSelected={selectedNiches.some((n) => n.id === niche.id)}
            isDisabled={
              !selectedNiches.some((n) => n.id === niche.id) &&
              selectedNiches.length >= 3
            }
            onClick={() => onNicheToggle(niche)}
          />
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        {selectedNiches.length} of 3 selected
      </div>
    </div>
  );
}
