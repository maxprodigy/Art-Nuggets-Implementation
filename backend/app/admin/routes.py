from fastapi import APIRouter, Depends, Query, status
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.auth.dependencies import RoleChecker
from app.admin.services import AdminService
from app.admin.schemas import (
    DashboardOverviewResponse,
    CourseAnalyticsResponse,
)

# Initialize router and service
admin_router = APIRouter(prefix="/admin", tags=["Admin"])
admin_service = AdminService()

# Role checker for admin-only endpoints
admin_only = RoleChecker(allowed_roles=["admin"])


@admin_router.get(
    "/stats/overview",
    response_model=DashboardOverviewResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(admin_only)],
    summary="Get dashboard overview statistics",
    description="Get comprehensive dashboard statistics including user counts, course metrics, and engagement data (Admin only)",
)
async def get_dashboard_overview(
    session: AsyncSession = Depends(get_session),
):
    """Get dashboard overview statistics (Admin only)"""
    return await admin_service.get_dashboard_overview(session)


@admin_router.get(
    "/stats/courses",
    response_model=CourseAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(admin_only)],
    summary="Get course analytics",
    description="Get detailed course analytics including top courses, industry/niche breakdowns, and recent activity (Admin only)",
)
async def get_course_analytics(
    limit: int = Query(10, ge=1, le=50, description="Limit for top courses lists"),
    session: AsyncSession = Depends(get_session),
):
    """Get course analytics (Admin only)"""
    return await admin_service.get_course_analytics(session, limit=limit)
