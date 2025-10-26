"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStep } from "@/hooks/use-step";
import { Progress } from "@/components/ui/progress";
import { IndustrySelectionStep } from "@/components/onboarding/IndustrySelectionStep";
import { NicheSelectionStep } from "@/components/onboarding/NicheSelectionStep";
import { ReviewStep } from "@/components/onboarding/ReviewStep";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";
import {
  useIndustries,
  useNichesByIndustry,
  useSubmitOnboarding,
} from "@/hooks/useOnboarding";
import type { Industry, Niche } from "@/types/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboardingCompleted, isAuthenticated } = useAuthStore();

  const [
    currentStep,
    { goToNextStep, goToPrevStep, canGoToNextStep, canGoToPrevStep },
  ] = useStep(3);

  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(
    null
  );
  const [selectedNiches, setSelectedNiches] = useState<Niche[]>([]);

  // React Query hooks
  const {
    data: industriesData,
    isLoading: isLoadingIndustries,
    error: industriesError,
    refetch: refetchIndustries,
  } = useIndustries();

  const {
    data: nichesData,
    isLoading: isLoadingNiches,
    error: nichesError,
    refetch: refetchNiches,
  } = useNichesByIndustry(selectedIndustry?.id || null);

  const {
    mutate: submitOnboarding,
    isPending: isSubmitting,
    error: submitError,
  } = useSubmitOnboarding();

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    setSelectedNiches([]); // Reset niches when industry changes
  };

  const handleNicheToggle = (niche: Niche) => {
    setSelectedNiches((prev) => {
      const isSelected = prev.some((n) => n.id === niche.id);
      if (isSelected) {
        return prev.filter((n) => n.id !== niche.id);
      } else if (prev.length < 3) {
        return [...prev, niche];
      }
      return prev;
    });
  };

  const handleContinue = () => {
    if (currentStep === 1 && selectedIndustry) {
      goToNextStep();
    } else if (currentStep === 2 && selectedNiches.length > 0) {
      goToNextStep();
    }
  };

  const handleBack = () => {
    goToPrevStep();
  };

  const handleComplete = () => {
    if (!selectedIndustry || selectedNiches.length === 0) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.error("User is not authenticated. Redirecting to login.");
      router.push("/auth/login");
      return;
    }

    console.log("User is authenticated, proceeding with submission...");

    submitOnboarding(
      {
        industry_id: selectedIndustry.id,
        niche_ids: selectedNiches.map((niche) => niche.id),
      },
      {
        onSuccess: () => {
          // Mark onboarding as completed
          setOnboardingCompleted(true);
          // Redirect to courses page
          router.push("/courses");
        },
      }
    );
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return selectedIndustry !== null;
    if (currentStep === 2) return selectedNiches.length > 0;
    return true; // Step 3 (review) is always valid
  };

  const canProceed = canGoToNextStep && isCurrentStepValid();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 3;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <IndustrySelectionStep
            industries={industriesData?.industries || []}
            selectedIndustry={selectedIndustry}
            onIndustrySelect={handleIndustrySelect}
            isLoading={isLoadingIndustries}
            error={industriesError?.message}
            onRetry={() => refetchIndustries()}
          />
        );

      case 2:
        return (
          <NicheSelectionStep
            selectedIndustry={selectedIndustry}
            niches={nichesData?.niches || []}
            selectedNiches={selectedNiches}
            onNicheToggle={handleNicheToggle}
            isLoading={isLoadingNiches}
            error={nichesError?.message}
            onRetry={() => refetchNiches()}
          />
        );

      case 3:
        return (
          <ReviewStep
            selectedIndustry={selectedIndustry}
            selectedNiches={selectedNiches}
            isSubmitting={isSubmitting}
            submitError={submitError?.message}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Indicator */}
      <div className="pt-8 pb-4">
        <div className="mb-8 max-w-md mx-auto">
          <Progress
            value={(currentStep / 3) * 100}
            className="h-2 bg-gray-200"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">{renderStepContent()}</div>
      </div>

      {/* Navigation */}
      <div className="pb-8 pt-4">
        <div className="flex justify-center space-x-4">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="px-8 py-3 rounded-4xl"
            >
              Back
            </Button>
          )}

          {!isLastStep ? (
            <GradientButton
              onClick={handleContinue}
              disabled={!canProceed}
              className="px-8 py-3 rounded-4xl"
            >
              Continue
            </GradientButton>
          ) : (
            <GradientButton
              onClick={handleComplete}
              className="px-8 py-3 rounded-4xl"
            >
              Complete Setup
            </GradientButton>
          )}
        </div>
      </div>
    </div>
  );
}
