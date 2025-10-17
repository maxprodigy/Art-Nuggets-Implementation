"use client";

import React from "react";
import { NicheChip } from "./NicheChip";
import { Industry, Niche, getNichesByIndustry } from "@/lib/onboarding-data";

interface NicheSelectionStepProps {
  selectedIndustry: Industry | null;
  selectedNiches: Niche[];
  onNicheToggle: (niche: Niche) => void;
}

export function NicheSelectionStep({
  selectedIndustry,
  selectedNiches,
  onNicheToggle,
}: NicheSelectionStepProps) {
  const availableNiches = selectedIndustry
    ? getNichesByIndustry(selectedIndustry.id)
    : [];

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
        {availableNiches.map((niche) => (
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
