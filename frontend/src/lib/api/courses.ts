import { publicBackendClient, backendClient } from "./client";
import type {
  CourseListResponse,
  CourseDetailResponse,
  PaginatedCourseResponse,
} from "@/types/courses";

export interface GetCoursesParams {
  page?: number;
  page_size?: number;
  search?: string;
  industry_id?: string;
  niche_id?: string;
}

/**
 * Fetch most recent courses
 */
export const fetchRecentCourses = async (
  limit: number = 3
): Promise<CourseListResponse[]> => {
  const response = await publicBackendClient.get("/courses/recent", {
    params: { limit },
  });
  return response.data;
};

/**
 * Fetch a single course by ID
 */
export const fetchCourseById = async (
  courseId: string
): Promise<CourseDetailResponse> => {
  const response = await publicBackendClient.get(`/courses/${courseId}`);
  return response.data;
};

/**
 * Fetch paginated list of courses with optional filters
 */
export const fetchCourses = async (
  params?: GetCoursesParams
): Promise<PaginatedCourseResponse> => {
  // Build query params, filtering out undefined values
  const queryParams: Record<string, string | number> = {};

  if (params) {
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.page_size !== undefined)
      queryParams.page_size = params.page_size;
    if (params.search) queryParams.search = params.search;
    if (params.industry_id) queryParams.industry_id = params.industry_id;
    if (params.niche_id) queryParams.niche_id = params.niche_id;
  }

  const response = await publicBackendClient.get("/courses", {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });
  return response.data;
};

/**
 * Toggle favourite status for a course (Authenticated users only)
 */
export const toggleFavourite = async (
  courseId: string
): Promise<{ message: string }> => {
  const response = await backendClient.post(`/courses/${courseId}/favourite`);
  return response.data;
};

/**
 * Mark course as completed (Authenticated users only)
 */
export const markCompleted = async (
  courseId: string
): Promise<{ message: string }> => {
  const response = await backendClient.post(`/courses/${courseId}/complete`);
  return response.data;
};

/**
 * Get user's progress for a specific course (Authenticated users only)
 */
export const getCourseProgress = async (
  courseId: string
): Promise<{
  is_favourite: boolean;
  is_completed: boolean;
  completed_at: string | null;
}> => {
  const response = await backendClient.get(`/courses/${courseId}/progress`);
  return response.data;
};
