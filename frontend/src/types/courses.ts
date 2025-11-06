// Course API types

export interface KeyTakeawayResponse {
  id: string;
  content: string;
  order: number;
}

export interface AdditionalResourceResponse {
  id: string;
  title: string;
  link: string;
  order: number;
}

export interface CourseListResponse {
  id: string;
  title: string;
  industry_id: string;
  niche_id: string;
  video_link: string;
  summary: string;
  created_at: string; // ISO datetime string
}

export interface CourseDetailResponse {
  id: string;
  title: string;
  industry_id: string;
  niche_id: string;
  video_link: string;
  summary: string;
  source: string | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  key_takeaways: KeyTakeawayResponse[];
  additional_resources: AdditionalResourceResponse[];
}

export interface PaginatedCourseResponse {
  items: CourseListResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CourseProgressResponse {
  is_favourite: boolean;
  is_completed: boolean;
  completed_at: string | null;
}
