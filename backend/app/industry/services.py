import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.industry import Industry
from app.industry.schemas import (
    IndustryCreateModel,
    IndustryUpdateModel,
    IndustryModel,
    IndustryListResponseModel,
    MessageResponseModel,
)


class IndustryService:
    """Service class for industry operations"""

    async def get_industry_by_id(
        self, industry_id: uuid.UUID, session: AsyncSession
    ) -> Optional[Industry]:
        """Get industry by ID"""
        statement = select(Industry).where(Industry.id == industry_id)
        result = await session.exec(statement)
        return result.first()

    async def get_all_industries(
        self,
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> IndustryListResponseModel:
        """Get all industries with pagination"""

        # Build query
        statement = select(Industry)

        # Add pagination
        statement = statement.offset(skip).limit(limit)

        # Execute query
        result = await session.exec(statement)
        industries = result.all()

        # Get total count
        count_statement = select(Industry)
        count_result = await session.exec(count_statement)
        total = len(count_result.all())

        # Convert to response models
        industry_models = [
            IndustryModel.model_validate(industry) for industry in industries
        ]

        return IndustryListResponseModel(industries=industry_models, total=total)

    async def create_industry(
        self, industry_data: IndustryCreateModel, session: AsyncSession
    ) -> IndustryModel:
        """Create a new industry"""

        # Check if industry with same name already exists
        existing_statement = select(Industry).where(Industry.name == industry_data.name)
        existing_result = await session.exec(existing_statement)
        existing_industry = existing_result.first()

        if existing_industry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Industry with this name already exists",
            )

        # Create new industry
        new_industry = Industry(
            name=industry_data.name,
        )

        session.add(new_industry)
        await session.commit()
        await session.refresh(new_industry)

        return IndustryModel.model_validate(new_industry)

    async def update_industry(
        self,
        industry_id: uuid.UUID,
        update_data: IndustryUpdateModel,
        session: AsyncSession,
    ) -> IndustryModel:
        """Update an industry"""

        # Get industry
        industry = await self.get_industry_by_id(industry_id, session)
        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found"
            )

        # Check if name is being updated and if it conflicts
        if update_data.name and update_data.name != industry.name:
            existing_statement = select(Industry).where(
                Industry.name == update_data.name
            )
            existing_result = await session.exec(existing_statement)
            existing_industry = existing_result.first()

            if existing_industry:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Industry with this name already exists",
                )

        # Update fields if provided
        update_dict = update_data.dict(exclude_unset=True)

        for field, value in update_dict.items():
            if hasattr(industry, field) and value is not None:
                setattr(industry, field, value)

        # Save changes
        session.add(industry)
        await session.commit()
        await session.refresh(industry)

        return IndustryModel.model_validate(industry)

    async def delete_industry(
        self, industry_id: uuid.UUID, session: AsyncSession
    ) -> MessageResponseModel:
        """Delete an industry (hard delete)"""

        # Get industry
        industry = await self.get_industry_by_id(industry_id, session)
        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found"
            )

        # Check if industry has associated niches
        from app.models.niche import Niche

        niches_statement = select(Niche).where(Niche.industry_id == industry_id)
        niches_result = await session.exec(niches_statement)
        niches = niches_result.all()

        if niches:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete industry that has associated niches. Please delete or reassign niches first.",
            )

        # Check if industry has associated users
        from app.models.user import User

        users_statement = select(User).where(User.industry_id == industry_id)
        users_result = await session.exec(users_statement)
        users = users_result.all()

        if users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete industry that has associated users. Please reassign users first.",
            )

        # Hard delete the industry
        await session.delete(industry)
        await session.commit()

        return MessageResponseModel(message="Industry deleted successfully")
