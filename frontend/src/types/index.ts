// User types - aligned with backend UserModel
export interface User {
  id: string; // UUID from backend
  email: string;
  role: string;
  artist_name: string;
  first_name?: string;
  last_name?: string;
  industry_id?: string; // Industry ID
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  // Profile data (resolved from relationships)
  profile?: {
    industry?: {
      id: string;
      name: string;
      description: string;
    };
    niches?: Array<{
      id: string;
      name: string;
      industry_id: string;
    }>;
  };
}

// Auth types - aligned with backend schemas
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  artist_name: string;
  email: string;
  password: string;
  // role is handled by backend (defaults to "regular")
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    email: string;
    uid: string; // Backend returns user ID as uid
    role: string;
    artist_name: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Form types
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
}

// Common utility types
export type Status = "idle" | "loading" | "success" | "error";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Helper types for user profile
export interface UserProfile {
  industry: string; // Industry ID
  niches: string[]; // Array of niche IDs
}

// Extended user with resolved industry/niche data
export interface UserWithProfile extends Omit<User, "profile"> {
  profile: UserProfile & {
    industryData?: {
      id: string;
      name: string;
      description: string;
    };
    nichesData?: Array<{
      id: string;
      name: string;
      industryId: string;
    }>;
  };
}
