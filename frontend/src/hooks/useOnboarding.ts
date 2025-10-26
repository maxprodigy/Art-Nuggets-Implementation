import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIndustries,
  fetchNichesByIndustry,
  submitOnboardingData,
} from "@/lib/api/onboarding";
import type { OnboardingSubmissionData } from "@/types/onboarding";

// Query keys for React Query
export const onboardingKeys = {
  all: ["onboarding"] as const,
  industries: () => [...onboardingKeys.all, "industries"] as const,
  niches: (industryId: string) =>
    [...onboardingKeys.all, "niches", industryId] as const,
};

/**
 * Hook to fetch all industries
 */
export const useIndustries = () => {
  return useQuery({
    queryKey: onboardingKeys.industries(),
    queryFn: fetchIndustries,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch niches for a specific industry
 */
export const useNichesByIndustry = (industryId: string | null) => {
  return useQuery({
    queryKey: onboardingKeys.niches(industryId || ""),
    queryFn: () => fetchNichesByIndustry(industryId!),
    enabled: !!industryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to submit onboarding data
 */
export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingSubmissionData) => submitOnboardingData(data),
    onSuccess: () => {
      // Invalidate and refetch industries and niches queries
      queryClient.invalidateQueries({ queryKey: onboardingKeys.all });
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
