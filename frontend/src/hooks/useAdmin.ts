import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth";
import { fetchDashboardOverview, fetchCourseAnalytics } from "@/lib/api/admin";
import type {
  DashboardOverviewResponse,
  CourseAnalyticsResponse,
} from "@/types/admin";

// Query keys for React Query
export const adminKeys = {
  all: ["admin"] as const,
  overview: () => [...adminKeys.all, "overview"] as const,
  analytics: (limit?: number) =>
    [...adminKeys.all, "analytics", limit] as const,
};

/**
 * Hook to fetch dashboard overview statistics
 */
export const useDashboardOverview = () => {
  const { _hasHydrated, accessToken, isAuthenticated } = useAuthStore();

  return useQuery<DashboardOverviewResponse>({
    queryKey: adminKeys.overview(),
    queryFn: fetchDashboardOverview,
    enabled: _hasHydrated && !!accessToken && isAuthenticated, // Wait for hydration and ensure we have a token
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch course analytics
 */
export const useCourseAnalytics = (limit: number = 10) => {
  const { _hasHydrated, accessToken, isAuthenticated } = useAuthStore();

  return useQuery<CourseAnalyticsResponse>({
    queryKey: adminKeys.analytics(limit),
    queryFn: () => fetchCourseAnalytics(limit),
    enabled: _hasHydrated && !!accessToken && isAuthenticated, // Wait for hydration and ensure we have a token
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
