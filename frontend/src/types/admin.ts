// Admin API types - matching backend schemas exactly

export interface DashboardOverviewResponse {
  total_users: number;
  new_users_this_month: number;
  new_users_this_week: number;
  total_courses: number;
  total_industries: number;
  total_niches: number;
  active_users_30d: number;
  total_completions: number;
  total_favourites: number;
  completion_rate: number;
  average_courses_per_user: number;
}

export interface CourseStatsItem {
  course_id: string;
  title: string;
  completions: number;
  favourites: number;
  industry_name: string;
  niche_name: string;
}

export interface IndustryCourseStats {
  industry_id: string;
  industry_name: string;
  course_count: number;
  total_completions: number;
  total_favourites: number;
}

export interface NicheCourseStats {
  niche_id: string;
  niche_name: string;
  industry_name: string;
  course_count: number;
  total_completions: number;
  total_favourites: number;
}

export interface RecentCourseActivity {
  course_id: string;
  title: string;
  recent_completions: number;
  recent_favourites: number;
}

export interface CourseAnalyticsResponse {
  top_courses_by_completions: CourseStatsItem[];
  top_courses_by_favourites: CourseStatsItem[];
  courses_by_industry: IndustryCourseStats[];
  courses_by_niche: NicheCourseStats[];
  recent_course_activity: RecentCourseActivity[];
}
