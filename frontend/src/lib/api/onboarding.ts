import { backendClient, publicBackendClient } from "./client";
import type {
  Industry,
  Niche,
  IndustriesResponse,
  NichesResponse,
  OnboardingSubmissionData,
} from "@/types/onboarding";

/**
 * Fetch all available industries
 */
export const fetchIndustries = async (): Promise<IndustriesResponse> => {
  const response = await publicBackendClient.get("/industries/");
  return response.data;
};

/**
 * Fetch niches for a specific industry
 */
export const fetchNichesByIndustry = async (
  industryId: string
): Promise<NichesResponse> => {
  const response = await publicBackendClient.get(
    `/niches/?industry_id=${industryId}`
  );
  return response.data;
};

/**
 * Submit user's industry and niche selections
 */
export const submitOnboardingData = async (
  data: OnboardingSubmissionData
): Promise<void> => {
  const response = await backendClient.put(
    "/user-profile/industry-niches",
    data
  );
  return response.data;
};
