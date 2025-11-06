import { adminBackendClient } from "./client";
import type {
  DashboardOverviewResponse,
  CourseAnalyticsResponse,
} from "@/types/admin";

/**
 * Fetch dashboard overview statistics (Admin only)
 */
export const fetchDashboardOverview =
  async (): Promise<DashboardOverviewResponse> => {
    const response = await adminBackendClient.get("/admin/stats/overview");
    return response.data;
  };

/**
 * Fetch course analytics (Admin only)
 */
export const fetchCourseAnalytics = async (
  limit: number = 10
): Promise<CourseAnalyticsResponse> => {
  const response = await adminBackendClient.get("/admin/stats/courses", {
    params: { limit },
  });
  return response.data;
};
