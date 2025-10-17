"use client";

import React from "react";
import { IndustryChip } from "./IndustryChip";
import { Industry, industries } from "@/lib/onboarding-data";

interface IndustrySelectionStepProps {
  selectedIndustry: Industry | null;
  onIndustrySelect: (industry: Industry) => void;
}

export function IndustrySelectionStep({
  selectedIndustry,
  onIndustrySelect,
}: IndustrySelectionStepProps) {
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
