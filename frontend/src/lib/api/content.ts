import { backendClient, publicBackendClient } from "./client";
import type {
  Industry,
  IndustriesResponse,
  Niche,
  NichesResponse,
} from "@/types/onboarding";

/**
 * Fetch all industries
 */
export const fetchIndustries = async (
  skip: number = 0,
  limit: number = 100
): Promise<IndustriesResponse> => {
  const response = await publicBackendClient.get("/industries/", {
    params: { skip, limit },
  });
  return response.data;
};

/**
 * Create a new industry (Admin only)
 */
export const createIndustry = async (name: string): Promise<Industry> => {
  const response = await backendClient.post("/industries/", { name });
  return response.data;
};

/**
 * Update an industry (Admin only)
 */
export const updateIndustry = async (
  industryId: string,
  name: string
): Promise<Industry> => {
  const response = await backendClient.put(`/industries/${industryId}`, {
    name,
  });
  return response.data;
};

/**
 * Delete an industry (Admin only)
 */
export const deleteIndustry = async (
  industryId: string
): Promise<{ message: string }> => {
  const response = await backendClient.delete(`/industries/${industryId}`);
  return response.data;
};

/**
 * Fetch all niches
 */
export const fetchNiches = async (
  skip: number = 0,
  limit: number = 100,
  industryId?: string
): Promise<NichesResponse> => {
  const params: Record<string, string | number> = { skip, limit };
  if (industryId) {
    params.industry_id = industryId;
  }
  const response = await publicBackendClient.get("/niches/", { params });
  return response.data;
};

/**
 * Create a new niche (Admin only)
 */
export const createNiche = async (
  name: string,
  industryId: string
): Promise<Niche> => {
  const response = await backendClient.post("/niches/", {
    name,
    industry_id: industryId,
  });
  return response.data;
};

/**
 * Update a niche (Admin only)
 */
export const updateNiche = async (
  nicheId: string,
  name: string,
  industryId?: string
): Promise<Niche> => {
  const data: { name: string; industry_id?: string } = { name };
  if (industryId) {
    data.industry_id = industryId;
  }
  const response = await backendClient.put(`/niches/${nicheId}`, data);
  return response.data;
};

/**
 * Delete a niche (Admin only)
 */
export const deleteNiche = async (
  nicheId: string
): Promise<{ message: string }> => {
  const response = await backendClient.delete(`/niches/${nicheId}`);
  return response.data;
};
