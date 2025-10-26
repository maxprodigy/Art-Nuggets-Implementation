// Onboarding API types
export interface Industry {
  id: string;
  name: string;
}

export interface Niche {
  id: string;
  name: string;
  industry_id: string;
}

export interface IndustriesResponse {
  industries: Industry[];
  total: number;
}

export interface NichesResponse {
  niches: Niche[];
  total: number;
}

export interface OnboardingSubmissionData {
  industry_id: string;
  niche_ids: string[];
}
