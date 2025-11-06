from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func, and_, or_
from sqlalchemy import case
from typing import List, Dict, Any
from datetime import datetime, timedelta
import uuid

from app.models.user import User
from app.models.course import Course, UserCourseProgress
from app.models.industry import Industry
from app.models.niche import Niche
from app.admin.schemas import (
    DashboardOverviewResponse,
    CourseAnalyticsResponse,
    CourseStatsItem,
    IndustryCourseStats,
    NicheCourseStats,
    RecentCourseActivity,
)


class AdminService:
    """Optimized service class for admin operations"""

    async def get_dashboard_overview(
        self, session: AsyncSession
    ) -> DashboardOverviewResponse:
        """Get dashboard overview statistics - OPTIMIZED"""

        now = datetime.now()
        first_day_of_month = now.replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        week_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        # Single query to get all user counts using CASE statements
        user_stats_query = select(
            func.count(User.id).label("total_users"),
            func.sum(case((User.created_at >= first_day_of_month, 1), else_=0)).label(
                "new_users_month"
            ),
            func.sum(case((User.created_at >= week_ago, 1), else_=0)).label(
                "new_users_week"
            ),
        )
        user_stats_result = await session.exec(user_stats_query)
        user_row = user_stats_result.first()

        total_users = user_row[0] or 0 if user_row else 0
        new_users_this_month = user_row[1] or 0 if user_row else 0
        new_users_this_week = user_row[2] or 0 if user_row else 0

        # Single query for content counts
        total_courses_query = select(func.count(Course.id))
        total_courses_result = await session.exec(total_courses_query)
        total_courses = total_courses_result.first() or 0

        total_industries_query = select(func.count(Industry.id))
        total_industries_result = await session.exec(total_industries_query)
        total_industries = total_industries_result.first() or 0

        total_niches_query = select(func.count(Niche.id))
        total_niches_result = await session.exec(total_niches_query)
        total_niches = total_niches_result.first() or 0

        # Query for active users (users who have progress records updated in last 30 days)
        active_users_query = select(
            func.count(func.distinct(UserCourseProgress.user_id))
        ).where(
            or_(
                UserCourseProgress.created_at >= thirty_days_ago,
                UserCourseProgress.updated_at >= thirty_days_ago,
            )
        )
        active_users_result = await session.exec(active_users_query)
        active_users_30d = active_users_result.first() or 0

        # Single query for progress stats
        total_completions_query = select(func.count(UserCourseProgress.id)).where(
            UserCourseProgress.is_completed == True
        )
        total_completions_result = await session.exec(total_completions_query)
        total_completions = total_completions_result.first() or 0

        total_favourites_query = select(func.count(UserCourseProgress.id)).where(
            UserCourseProgress.is_favourite == True
        )
        total_favourites_result = await session.exec(total_favourites_query)
        total_favourites = total_favourites_result.first() or 0

        # Users with completions
        users_with_completions_query = select(
            func.count(func.distinct(UserCourseProgress.user_id))
        ).where(UserCourseProgress.is_completed == True)
        users_with_completions_result = await session.exec(users_with_completions_query)
        users_with_completions = users_with_completions_result.first() or 0

        # Calculate derived metrics
        completion_rate = (
            (users_with_completions / total_users * 100) if total_users > 0 else 0.0
        )
        average_courses_per_user = (
            (total_completions + total_favourites) / total_users
            if total_users > 0
            else 0.0
        )

        return DashboardOverviewResponse(
            total_users=total_users,
            new_users_this_month=new_users_this_month,
            new_users_this_week=new_users_this_week,
            total_courses=total_courses,
            total_industries=total_industries,
            total_niches=total_niches,
            active_users_30d=active_users_30d,
            total_completions=total_completions,
            total_favourites=total_favourites,
            completion_rate=round(completion_rate, 2),
            average_courses_per_user=round(average_courses_per_user, 2),
        )

    async def get_course_analytics(
        self, session: AsyncSession, limit: int = 10
    ) -> CourseAnalyticsResponse:
        """Get course analytics - HIGHLY OPTIMIZED with JOINs and aggregations"""

        # OPTIMIZATION: Single query to get all course stats with JOINs
        # Get all courses with their industry and niche names, and progress stats
        course_stats_query = (
            select(
                Course.id,
                Course.title,
                Industry.name.label("industry_name"),
                Niche.name.label("niche_name"),
                func.sum(
                    case((UserCourseProgress.is_completed == True, 1), else_=0)
                ).label("completions"),
                func.sum(
                    case((UserCourseProgress.is_favourite == True, 1), else_=0)
                ).label("favourites"),
            )
            .select_from(Course)
            .join(Industry, Course.industry_id == Industry.id, isouter=True)
            .join(Niche, Course.niche_id == Niche.id, isouter=True)
            .join(
                UserCourseProgress,
                Course.id == UserCourseProgress.course_id,
                isouter=True,
            )
            .group_by(Course.id, Course.title, Industry.name, Niche.name)
        )

        course_stats_result = await session.exec(course_stats_query)
        all_course_stats = course_stats_result.all()

        # Convert to CourseStatsItem objects
        course_stats_list = [
            CourseStatsItem(
                course_id=row[0],
                title=row[1],
                industry_name=row[2] or "Unknown",
                niche_name=row[3] or "Unknown",
                completions=int(row[4] or 0),
                favourites=int(row[5] or 0),
            )
            for row in all_course_stats
        ]

        # Sort and get top courses by completions
        top_completions = sorted(
            course_stats_list, key=lambda x: x.completions, reverse=True
        )[:limit]

        # Sort and get top courses by favourites
        top_favourites = sorted(
            course_stats_list, key=lambda x: x.favourites, reverse=True
        )[:limit]

        # OPTIMIZATION: Single query with JOINs to get industry stats
        industry_stats_query = (
            select(
                Industry.id,
                Industry.name,
                func.count(func.distinct(Course.id)).label("course_count"),
                func.sum(
                    case((UserCourseProgress.is_completed == True, 1), else_=0)
                ).label("total_completions"),
                func.sum(
                    case((UserCourseProgress.is_favourite == True, 1), else_=0)
                ).label("total_favourites"),
            )
            .select_from(Industry)
            .join(Course, Industry.id == Course.industry_id, isouter=True)
            .join(
                UserCourseProgress,
                Course.id == UserCourseProgress.course_id,
                isouter=True,
            )
            .group_by(Industry.id, Industry.name)
        )

        industry_stats_result = await session.exec(industry_stats_query)
        courses_by_industry = [
            IndustryCourseStats(
                industry_id=row[0],
                industry_name=row[1],
                course_count=int(row[2] or 0),
                total_completions=int(row[3] or 0),
                total_favourites=int(row[4] or 0),
            )
            for row in industry_stats_result.all()
        ]

        # OPTIMIZATION: Single query with JOINs to get niche stats
        niche_stats_query = (
            select(
                Niche.id,
                Niche.name,
                Industry.name.label("industry_name"),
                func.count(func.distinct(Course.id)).label("course_count"),
                func.sum(
                    case((UserCourseProgress.is_completed == True, 1), else_=0)
                ).label("total_completions"),
                func.sum(
                    case((UserCourseProgress.is_favourite == True, 1), else_=0)
                ).label("total_favourites"),
            )
            .select_from(Niche)
            .join(Industry, Niche.industry_id == Industry.id, isouter=True)
            .join(Course, Niche.id == Course.niche_id, isouter=True)
            .join(
                UserCourseProgress,
                Course.id == UserCourseProgress.course_id,
                isouter=True,
            )
            .group_by(Niche.id, Niche.name, Industry.name)
        )

        niche_stats_result = await session.exec(niche_stats_query)
        courses_by_niche = [
            NicheCourseStats(
                niche_id=row[0],
                niche_name=row[1],
                industry_name=row[2] or "Unknown",
                course_count=int(row[3] or 0),
                total_completions=int(row[4] or 0),
                total_favourites=int(row[5] or 0),
            )
            for row in niche_stats_result.all()
        ]

        # OPTIMIZATION: Single query for recent activity (last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=7)

        recent_activity_query = (
            select(
                Course.id,
                Course.title,
                func.sum(
                    case(
                        (
                            and_(
                                UserCourseProgress.is_completed == True,
                                UserCourseProgress.completed_at >= seven_days_ago,
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ).label("recent_completions"),
                func.sum(
                    case(
                        (
                            and_(
                                UserCourseProgress.is_favourite == True,
                                UserCourseProgress.created_at >= seven_days_ago,
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ).label("recent_favourites"),
            )
            .select_from(Course)
            .join(
                UserCourseProgress,
                Course.id == UserCourseProgress.course_id,
                isouter=True,
            )
            .group_by(Course.id, Course.title)
            .having(
                or_(
                    func.sum(
                        case(
                            (
                                and_(
                                    UserCourseProgress.is_completed == True,
                                    UserCourseProgress.completed_at >= seven_days_ago,
                                ),
                                1,
                            ),
                            else_=0,
                        )
                    )
                    > 0,
                    func.sum(
                        case(
                            (
                                and_(
                                    UserCourseProgress.is_favourite == True,
                                    UserCourseProgress.created_at >= seven_days_ago,
                                ),
                                1,
                            ),
                            else_=0,
                        )
                    )
                    > 0,
                )
            )
        )

        recent_activity_result = await session.exec(recent_activity_query)
        recent_activity = [
            RecentCourseActivity(
                course_id=row[0],
                title=row[1],
                recent_completions=int(row[2] or 0),
                recent_favourites=int(row[3] or 0),
            )
            for row in recent_activity_result.all()
        ]

        # Sort by total activity
        recent_activity.sort(
            key=lambda x: x.recent_completions + x.recent_favourites, reverse=True
        )
        recent_activity = recent_activity[:limit]

        return CourseAnalyticsResponse(
            top_courses_by_completions=top_completions,
            top_courses_by_favourites=top_favourites,
            courses_by_industry=courses_by_industry,
            courses_by_niche=courses_by_niche,
            recent_course_activity=recent_activity,
        )
