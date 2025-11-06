from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Dict, Any, List, Optional
import uuid

from app.core.database import get_session
from app.auth.dependencies import AccessTokenBearer, RoleChecker
from app.course.services import CourseService
from app.course.schemas import (
    CourseCreateModel,
    CourseUpdateModel,
    CourseDetailResponse,
    PaginatedCourseResponse,
    CourseListResponse,
    MessageResponseModel,
)

# Initialize router and service
course_router = APIRouter(prefix="/courses", tags=["Courses"])
course_service = CourseService()
admin_check = RoleChecker(allowed_roles=["admin"])


# ==================== ADMIN ROUTES ====================


@course_router.post(
    "",
    response_model=CourseDetailResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(admin_check)],
)
async def create_course(
    course_data: CourseCreateModel,
    session: AsyncSession = Depends(get_session),
):
    """Create a new course (Admin only)"""
    return await course_service.create_course(course_data, session)


@course_router.put(
    "/{course_id}",
    response_model=CourseDetailResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(admin_check)],
)
async def update_course(
    course_id: uuid.UUID,
    course_data: CourseUpdateModel,
    session: AsyncSession = Depends(get_session),
):
    """Update a course (Admin only)"""
    return await course_service.update_course(course_id, course_data, session)


@course_router.delete(
    "/{course_id}",
    response_model=MessageResponseModel,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(admin_check)],
)
async def delete_course(
    course_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Delete a course (Admin only)"""
    return await course_service.delete_course(course_id, session)


# ==================== PUBLIC ROUTES ====================


@course_router.get(
    "/recent",
    response_model=List[CourseListResponse],
    status_code=status.HTTP_200_OK,
)
async def get_recent_courses(
    limit: int = Query(3, ge=1, le=10, description="Number of recent courses to fetch"),
    session: AsyncSession = Depends(get_session),
):
    """Get most recent courses (Public)"""
    return await course_service.get_recent_courses(session, limit)


@course_router.get(
    "/{course_id}",
    response_model=CourseDetailResponse,
    status_code=status.HTTP_200_OK,
)
async def get_course(
    course_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get a single course by ID (Public)"""
    return await course_service.get_course_by_id(course_id, session)


@course_router.get(
    "",
    response_model=PaginatedCourseResponse,
    status_code=status.HTTP_200_OK,
)
async def get_courses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search by title"),
    industry_id: Optional[uuid.UUID] = Query(None, description="Filter by industry"),
    niche_id: Optional[uuid.UUID] = Query(None, description="Filter by niche"),
    session: AsyncSession = Depends(get_session),
):
    """Get paginated list of courses with filters (Public)"""
    return await course_service.get_courses(
        session=session,
        page=page,
        page_size=page_size,
        search=search,
        industry_id=industry_id,
        niche_id=niche_id,
    )


# ==================== USER ROUTES ====================


@course_router.post(
    "/{course_id}/favourite",
    response_model=MessageResponseModel,
    status_code=status.HTTP_200_OK,
)
async def toggle_favourite(
    course_id: uuid.UUID,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Toggle favourite status for a course (Authenticated users only)"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await course_service.toggle_favourite(course_id, user_id, session)


@course_router.post(
    "/{course_id}/complete",
    response_model=MessageResponseModel,
    status_code=status.HTTP_200_OK,
)
async def mark_completed(
    course_id: uuid.UUID,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Mark course as completed (Authenticated users only)"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await course_service.mark_completed(course_id, user_id, session)


@course_router.get(
    "/my/favourites",
    response_model=PaginatedCourseResponse,
    status_code=status.HTTP_200_OK,
)
async def get_my_favourites(
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    session: AsyncSession = Depends(get_session),
):
    """Get current user's favourite courses (Authenticated users only)"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await course_service.get_courses(
        session=session,
        page=page,
        page_size=page_size,
        user_id=user_id,
        filter_type="favourites",
    )


@course_router.get(
    "/my/completed",
    response_model=PaginatedCourseResponse,
    status_code=status.HTTP_200_OK,
)
async def get_my_completed(
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    session: AsyncSession = Depends(get_session),
):
    """Get current user's completed courses (Authenticated users only)"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await course_service.get_courses(
        session=session,
        page=page,
        page_size=page_size,
        user_id=user_id,
        filter_type="completed",
    )


@course_router.get(
    "/{course_id}/progress",
    status_code=status.HTTP_200_OK,
)
async def get_course_progress(
    course_id: uuid.UUID,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Get current user's progress for a specific course (Authenticated users only)"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await course_service.get_user_course_progress(course_id, user_id, session)
