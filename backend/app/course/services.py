import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, and_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from datetime import datetime

from app.models.course import (
    Course,
    CourseKeyTakeaway,
    CourseAdditionalResource,
    UserCourseProgress,
)
from app.models.industry import Industry
from app.models.niche import Niche
from app.course.schemas import (
    CourseCreateModel,
    CourseUpdateModel,
    CourseDetailResponse,
    CourseListResponse,
    PaginatedCourseResponse,
    MessageResponseModel,
    KeyTakeawayCreate,
    AdditionalResourceCreate,
)


class CourseService:
    """Service class for course operations"""

    async def validate_industry_exists(
        self, industry_id: uuid.UUID, session: AsyncSession
    ) -> Industry:
        """Validate that industry exists"""
        statement = select(Industry).where(Industry.id == industry_id)
        result = await session.exec(statement)
        industry = result.first()

        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Industry not found",
            )

        return industry

    async def validate_niche_exists(
        self, niche_id: uuid.UUID, session: AsyncSession
    ) -> Niche:
        """Validate that niche exists"""
        statement = select(Niche).where(Niche.id == niche_id)
        result = await session.exec(statement)
        niche = result.first()

        if not niche:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Niche not found",
            )

        return niche

    async def validate_industry_and_niche(
        self, industry_id: uuid.UUID, niche_id: uuid.UUID, session: AsyncSession
    ):
        """Validate that industry and niche exist and niche belongs to industry"""
        industry = await self.validate_industry_exists(industry_id, session)
        niche = await self.validate_niche_exists(niche_id, session)

        if niche.industry_id != industry_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Niche '{niche.name}' does not belong to the specified industry",
            )

        return industry, niche

    async def validate_course_exists(
        self, course_id: uuid.UUID, session: AsyncSession
    ) -> Course:
        """Validate that course exists"""
        statement = select(Course).where(Course.id == course_id)
        result = await session.exec(statement)
        course = result.first()

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        return course

    async def create_course(
        self, course_data: CourseCreateModel, session: AsyncSession
    ) -> CourseDetailResponse:
        """Create a new course with key takeaways and additional resources"""
        # Validate industry and niche
        await self.validate_industry_and_niche(
            course_data.industry_id, course_data.niche_id, session
        )

        # Create course
        course = Course(
            title=course_data.title,
            industry_id=course_data.industry_id,
            niche_id=course_data.niche_id,
            video_link=course_data.video_link,
            summary=course_data.summary,
            source=course_data.source,
        )
        session.add(course)
        await session.commit()
        await session.refresh(course)

        # Create key takeaways
        for idx, takeaway_data in enumerate(course_data.key_takeaways):
            takeaway = CourseKeyTakeaway(
                course_id=course.id,
                content=takeaway_data.content,
                order=idx,
            )
            session.add(takeaway)

        # Create additional resources if provided
        if course_data.additional_resources:
            for idx, resource_data in enumerate(course_data.additional_resources):
                resource = CourseAdditionalResource(
                    course_id=course.id,
                    title=resource_data.title,
                    link=resource_data.link,
                    order=idx,
                )
                session.add(resource)

        await session.commit()
        await session.refresh(course)

        # Fetch course with relationships
        statement = (
            select(Course)
            .where(Course.id == course.id)
            .options(
                selectinload(Course.key_takeaways),
                selectinload(Course.additional_resources),
            )
        )
        result = await session.exec(statement)
        course = result.first()

        return CourseDetailResponse.model_validate(course)

    async def update_course(
        self,
        course_id: uuid.UUID,
        course_data: CourseUpdateModel,
        session: AsyncSession,
    ) -> CourseDetailResponse:
        """Update a course and its related data"""
        # Get and validate course exists
        course = await self.validate_course_exists(course_id, session)

        # Validate industry and niche if they're being updated
        if course_data.industry_id is not None or course_data.niche_id is not None:
            industry_id = course_data.industry_id or course.industry_id
            niche_id = course_data.niche_id or course.niche_id
            await self.validate_industry_and_niche(industry_id, niche_id, session)

        # Update course fields
        update_dict = course_data.model_dump(
            exclude_unset=True, exclude={"key_takeaways", "additional_resources"}
        )
        for field, value in update_dict.items():
            if hasattr(course, field) and value is not None:
                setattr(course, field, value)

        # Update key takeaways if provided
        if course_data.key_takeaways is not None:
            # Delete existing key takeaways
            existing_takeaways = select(CourseKeyTakeaway).where(
                CourseKeyTakeaway.course_id == course_id
            )
            result = await session.exec(existing_takeaways)
            for takeaway in result.all():
                await session.delete(takeaway)

            # Create new key takeaways
            for idx, takeaway_data in enumerate(course_data.key_takeaways):
                takeaway = CourseKeyTakeaway(
                    course_id=course.id,
                    content=takeaway_data.content,
                    order=idx,
                )
                session.add(takeaway)

        # Update additional resources if provided
        if course_data.additional_resources is not None:
            # Delete existing additional resources
            existing_resources = select(CourseAdditionalResource).where(
                CourseAdditionalResource.course_id == course_id
            )
            result = await session.exec(existing_resources)
            for resource in result.all():
                await session.delete(resource)

            # Create new additional resources
            for idx, resource_data in enumerate(course_data.additional_resources):
                resource = CourseAdditionalResource(
                    course_id=course.id,
                    title=resource_data.title,
                    link=resource_data.link,
                    order=idx,
                )
                session.add(resource)

        # Save changes
        session.add(course)
        await session.commit()
        await session.refresh(course)

        # Fetch course with relationships
        statement = (
            select(Course)
            .where(Course.id == course.id)
            .options(
                selectinload(Course.key_takeaways),
                selectinload(Course.additional_resources),
            )
        )
        result = await session.exec(statement)
        course = result.first()

        return CourseDetailResponse.model_validate(course)

    async def delete_course(
        self, course_id: uuid.UUID, session: AsyncSession
    ) -> MessageResponseModel:
        """Delete a course (CASCADE handles related records)"""
        course = await self.validate_course_exists(course_id, session)
        await session.delete(course)
        await session.commit()

        return MessageResponseModel(message="Course deleted successfully")

    async def get_course_by_id(
        self, course_id: uuid.UUID, session: AsyncSession
    ) -> CourseDetailResponse:
        """Get a single course by ID"""
        course = await self.validate_course_exists(course_id, session)

        # Fetch with relationships
        statement = (
            select(Course)
            .where(Course.id == course_id)
            .options(
                selectinload(Course.key_takeaways),
                selectinload(Course.additional_resources),
            )
        )
        result = await session.exec(statement)
        course = result.first()

        return CourseDetailResponse.model_validate(course)

    async def get_courses(
        self,
        session: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        search: Optional[str] = None,
        industry_id: Optional[uuid.UUID] = None,
        niche_id: Optional[uuid.UUID] = None,
        user_id: Optional[uuid.UUID] = None,
        filter_type: Optional[str] = None,  # 'favourites' or 'completed'
    ) -> PaginatedCourseResponse:
        """Get paginated list of courses with filters"""
        # Build base query
        statement = select(Course)

        # Apply filters
        filters = []
        if search:
            filters.append(Course.title.ilike(f"%{search}%"))
        if industry_id:
            filters.append(Course.industry_id == industry_id)
        if niche_id:
            filters.append(Course.niche_id == niche_id)

        # Apply user-specific filters
        if user_id and filter_type:
            if filter_type == "favourites":
                # Join with user_course_progress to get favourited courses
                statement = statement.join(
                    UserCourseProgress,
                    Course.id == UserCourseProgress.course_id,
                ).where(
                    and_(
                        UserCourseProgress.user_id == user_id,
                        UserCourseProgress.is_favourite == True,
                    )
                )
            elif filter_type == "completed":
                # Join with user_course_progress to get completed courses
                statement = statement.join(
                    UserCourseProgress,
                    Course.id == UserCourseProgress.course_id,
                ).where(
                    and_(
                        UserCourseProgress.user_id == user_id,
                        UserCourseProgress.is_completed == True,
                    )
                )

        if filters:
            statement = statement.where(and_(*filters))

        # Count total
        count_statement = select(func.count()).select_from(statement.subquery())
        total_result = await session.exec(count_statement)
        total = total_result.first()

        # Apply pagination
        statement = statement.order_by(Course.created_at.desc())
        statement = statement.offset((page - 1) * page_size).limit(page_size)

        # Execute query
        result = await session.exec(statement)
        courses = result.all()

        # Calculate pagination
        total_pages = (total + page_size - 1) // page_size

        return PaginatedCourseResponse(
            items=[CourseListResponse.model_validate(course) for course in courses],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def get_recent_courses(
        self, session: AsyncSession, limit: int = 3
    ) -> List[CourseListResponse]:
        """Get most recent courses (by created_at)"""
        # Validate limit
        limit = min(limit, 10)  # Max 10
        limit = max(limit, 1)  # Min 1

        statement = select(Course).order_by(Course.created_at.desc()).limit(limit)
        result = await session.exec(statement)
        courses = result.all()

        return [CourseListResponse.model_validate(course) for course in courses]

    async def toggle_favourite(
        self, course_id: uuid.UUID, user_id: uuid.UUID, session: AsyncSession
    ) -> MessageResponseModel:
        """Toggle favourite status for a course"""
        # Validate course exists
        await self.validate_course_exists(course_id, session)

        # Check if progress record exists
        statement = select(UserCourseProgress).where(
            and_(
                UserCourseProgress.course_id == course_id,
                UserCourseProgress.user_id == user_id,
            )
        )
        result = await session.exec(statement)
        progress = result.first()

        if progress:
            # Toggle favourite
            progress.is_favourite = not progress.is_favourite
            session.add(progress)
            await session.commit()

            action = "added to" if progress.is_favourite else "removed from"
        else:
            # Create new progress record
            progress = UserCourseProgress(
                user_id=user_id,
                course_id=course_id,
                is_favourite=True,
            )
            session.add(progress)
            await session.commit()
            action = "added to"

        return MessageResponseModel(message=f"Course {action} favourites successfully")

    async def mark_completed(
        self, course_id: uuid.UUID, user_id: uuid.UUID, session: AsyncSession
    ) -> MessageResponseModel:
        """Toggle completion status for a course"""
        # Validate course exists
        await self.validate_course_exists(course_id, session)

        # Check if progress record exists
        statement = select(UserCourseProgress).where(
            and_(
                UserCourseProgress.course_id == course_id,
                UserCourseProgress.user_id == user_id,
            )
        )
        result = await session.exec(statement)
        progress = result.first()

        if progress:
            # Toggle completion status
            progress.is_completed = not progress.is_completed
            if progress.is_completed:
                progress.completed_at = datetime.now()
            else:
                progress.completed_at = None
            session.add(progress)
            await session.commit()

            action = (
                "marked as completed"
                if progress.is_completed
                else "marked as incomplete"
            )
        else:
            # Create new progress record
            progress = UserCourseProgress(
                user_id=user_id,
                course_id=course_id,
                is_completed=True,
                completed_at=datetime.now(),
            )
            session.add(progress)
            await session.commit()
            action = "marked as completed"

        return MessageResponseModel(message=f"Course {action} successfully")

    async def get_user_course_progress(
        self, course_id: uuid.UUID, user_id: uuid.UUID, session: AsyncSession
    ) -> Dict:
        """Get user's progress for a specific course"""
        # Validate course exists
        await self.validate_course_exists(course_id, session)

        # Check if progress record exists
        statement = select(UserCourseProgress).where(
            and_(
                UserCourseProgress.course_id == course_id,
                UserCourseProgress.user_id == user_id,
            )
        )
        result = await session.exec(statement)
        progress = result.first()

        if progress:
            return {
                "is_favourite": progress.is_favourite,
                "is_completed": progress.is_completed,
                "completed_at": progress.completed_at,
            }
        else:
            return {
                "is_favourite": False,
                "is_completed": False,
                "completed_at": None,
            }
