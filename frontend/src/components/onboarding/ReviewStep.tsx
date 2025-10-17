"use client";

import React from "react";
import { Industry, Niche } from "@/lib/onboarding-data";

interface ReviewStepProps {
  selectedIndustry: Industry | null;
  selectedNiches: Niche[];
}

export function ReviewStep({
  selectedIndustry,
  selectedNiches,
}: ReviewStepProps) {
  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-5xl font-light text-gray-900 mb-2">
            You're All Set! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Let's review your creative profile
          </p>
        </div>
      </div>

      {/* Timeline-style Review */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-200 via-pink-200 to-blue-200"></div>

          {/* Step 1: Industry Selection */}
          <div className="relative flex items-start space-x-6 pb-8">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
              {selectedIndustry && (
                <selectedIndustry.icon className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="flex-1 pt-2">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Industry Selected
                </h3>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-gray-700 text-lg font-medium">
                {selectedIndustry?.name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Your primary creative field
              </p>
            </div>
          </div>

          {/* Step 2: Niches Selection */}
          <div className="relative flex items-start space-x-6">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            </div>
            <div className="flex-1 pt-2">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Specializations Chosen
                </h3>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedNiches.map((niche) => (
                  <span
                    key={niche.id}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-orange-100 to-pink-100 text-gray-700 border border-orange-200"
                  >
                    {niche.name}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {selectedNiches.length} niche
                {selectedNiches.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="text-center max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Perfect! Your profile is ready
          </h4>
          <p className="text-gray-600">
            We'll use this information to personalize your Art Nuggets
            experience and connect you with relevant opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
