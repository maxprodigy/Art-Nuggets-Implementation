from pydantic import BaseModel
from typing import List
import uuid


# ==================== DASHBOARD OVERVIEW SCHEMAS ====================


class DashboardOverviewResponse(BaseModel):
    """Schema for dashboard overview statistics"""

    total_users: int
    new_users_this_month: int
    new_users_this_week: int
    total_courses: int
    total_industries: int
    total_niches: int
    active_users_30d: int
    total_completions: int
    total_favourites: int
    completion_rate: float
    average_courses_per_user: float


# ==================== COURSE ANALYTICS SCHEMAS ====================


class CourseStatsItem(BaseModel):
    """Schema for individual course statistics"""

    course_id: uuid.UUID
    title: str
    completions: int
    favourites: int
    industry_name: str
    niche_name: str


class IndustryCourseStats(BaseModel):
    """Schema for course statistics by industry"""

    industry_id: uuid.UUID
    industry_name: str
    course_count: int
    total_completions: int
    total_favourites: int


class NicheCourseStats(BaseModel):
    """Schema for course statistics by niche"""

    niche_id: uuid.UUID
    niche_name: str
    industry_name: str
    course_count: int
    total_completions: int
    total_favourites: int


class RecentCourseActivity(BaseModel):
    """Schema for recent course activity"""

    course_id: uuid.UUID
    title: str
    recent_completions: int
    recent_favourites: int


class CourseAnalyticsResponse(BaseModel):
    """Schema for course analytics response"""

    top_courses_by_completions: List[CourseStatsItem]
    top_courses_by_favourites: List[CourseStatsItem]
    courses_by_industry: List[IndustryCourseStats]
    courses_by_niche: List[NicheCourseStats]
    recent_course_activity: List[RecentCourseActivity]
