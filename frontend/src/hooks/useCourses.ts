import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecentCourses,
  fetchCourseById,
  fetchCourses,
  toggleFavourite,
  markCompleted,
  getCourseProgress,
  type GetCoursesParams,
} from "@/lib/api/courses";
import type { CourseProgressResponse } from "@/types/courses";

// Query keys for React Query
export const courseKeys = {
  all: ["courses"] as const,
  recent: (limit?: number) => [...courseKeys.all, "recent", limit] as const,
  detail: (courseId: string) =>
    [...courseKeys.all, "detail", courseId] as const,
  list: (params?: GetCoursesParams) =>
    [...courseKeys.all, "list", params] as const,
  progress: (courseId: string) =>
    [...courseKeys.all, "progress", courseId] as const,
};

/**
 * Hook to fetch most recent courses
 */
export const useRecentCourses = (limit: number = 3) => {
  return useQuery({
    queryKey: courseKeys.recent(limit),
    queryFn: () => fetchRecentCourses(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch a single course by ID
 */
export const useCourse = (courseId: string | null) => {
  return useQuery({
    queryKey: courseKeys.detail(courseId || ""),
    queryFn: () => fetchCourseById(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch paginated list of courses with optional filters
 */
export const useCourses = (params?: GetCoursesParams) => {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => fetchCourses(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter since results may change)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Keep previous data while fetching new data (for smooth pagination)
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch user's progress for a specific course (Authenticated users only)
 */
export const useCourseProgress = (courseId: string | null) => {
  return useQuery({
    queryKey: courseKeys.progress(courseId || ""),
    queryFn: () => getCourseProgress(courseId!),
    enabled: !!courseId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to toggle favourite status for a course
 */
export const useToggleFavourite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => toggleFavourite(courseId),
    onSuccess: (data, courseId) => {
      // Invalidate progress query to refetch updated status
      queryClient.invalidateQueries({
        queryKey: courseKeys.progress(courseId),
      });
    },
    retry: 1,
  });
};

/**
 * Hook to mark course as completed
 */
export const useMarkCompleted = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => markCompleted(courseId),
    onSuccess: (data, courseId) => {
      // Invalidate progress query to refetch updated status
      queryClient.invalidateQueries({
        queryKey: courseKeys.progress(courseId),
      });
    },
    retry: 1,
  });
};
