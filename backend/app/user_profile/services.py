import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.user import User
from app.models.industry import Industry
from app.models.niche import Niche
from app.models.user_niche import UserNiche
from app.user_profile.schemas import (
    UserProfileUpdateModel,
    UserIndustryNicheUpdateModel,
    UserProfileModel,
    UserIndustryNicheResponseModel,
    MessageResponseModel,
)
from app.industry.schemas import IndustryModel
from app.niche.schemas import NicheModel


class UserProfileService:
    """Service class for user profile operations"""

    async def get_user_by_id(
        self, user_id: uuid.UUID, session: AsyncSession
    ) -> Optional[User]:
        """Get user by ID"""
        statement = select(User).where(User.id == user_id)
        result = await session.exec(statement)
        return result.first()

    async def update_user_profile(
        self,
        user_id: uuid.UUID,
        update_data: UserProfileUpdateModel,
        session: AsyncSession,
    ) -> UserProfileModel:
        """Update user's profile information"""

        # Get user
        user = await self.get_user_by_id(user_id, session)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Update fields if provided
        update_dict = update_data.dict(exclude_unset=True)

        for field, value in update_dict.items():
            if hasattr(user, field) and value is not None:
                setattr(user, field, value)

        # Save changes
        session.add(user)
        await session.commit()
        await session.refresh(user)

        return UserProfileModel.model_validate(user)

    async def validate_industry_exists(
        self, industry_id: uuid.UUID, session: AsyncSession
    ) -> Industry:
        """Validate that industry exists and is active"""
        statement = select(Industry).where(
            Industry.id == industry_id, Industry.is_active == True
        )
        result = await session.exec(statement)
        industry = result.first()

        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Industry not found or inactive",
            )

        return industry

    async def validate_niches_exist(
        self, niche_ids: List[uuid.UUID], session: AsyncSession
    ) -> List[Niche]:
        """Validate that all niches exist and are active"""
        if not niche_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one niche must be provided",
            )

        statement = select(Niche).where(
            Niche.id.in_(niche_ids), Niche.is_active == True
        )
        result = await session.exec(statement)
        niches = result.all()

        if len(niches) != len(niche_ids):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="One or more niches not found or inactive",
            )

        return niches

    async def update_user_industry_and_niches(
        self,
        user_id: uuid.UUID,
        update_data: UserIndustryNicheUpdateModel,
        session: AsyncSession,
    ) -> UserIndustryNicheResponseModel:
        """Update user's industry and niches"""

        # Get user
        user = await self.get_user_by_id(user_id, session)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Validate industry exists
        industry = await self.validate_industry_exists(update_data.industry_id, session)

        # Validate niches exist
        niches = await self.validate_niches_exist(update_data.niche_ids, session)

        # Validate that all niches belong to the specified industry
        for niche in niches:
            if niche.industry_id != update_data.industry_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Niche '{niche.name}' does not belong to the specified industry",
                )

        # Remove existing user niches
        existing_user_niches_statement = select(UserNiche).where(
            UserNiche.user_id == user_id
        )
        existing_user_niches_result = await session.exec(existing_user_niches_statement)
        existing_user_niches = existing_user_niches_result.all()

        for user_niche in existing_user_niches:
            await session.delete(user_niche)

        # Add new user niches
        for niche_id in update_data.niche_ids:
            user_niche = UserNiche(user_id=user_id, niche_id=niche_id)
            session.add(user_niche)

        # Update user's industry
        user.industry_id = update_data.industry_id

        # Save changes
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # Prepare response
        industry_response = IndustryModel.model_validate(industry)
        niche_responses = [NicheModel.model_validate(niche) for niche in niches]

        return UserIndustryNicheResponseModel(
            message="Industry and niches updated successfully",
            industry=industry_response,
            niches=niche_responses,
        )

    async def get_user_profile(
        self, user_id: uuid.UUID, session: AsyncSession
    ) -> UserProfileModel:
        """Get user profile"""
        user = await self.get_user_by_id(user_id, session)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        return UserProfileModel.model_validate(user)

    async def clear_user_industry_and_niches(
        self, user_id: uuid.UUID, session: AsyncSession
    ) -> MessageResponseModel:
        """Clear user's industry and niches"""

        # Get user
        user = await self.get_user_by_id(user_id, session)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Remove all user niches
        existing_user_niches_statement = select(UserNiche).where(
            UserNiche.user_id == user_id
        )
        existing_user_niches_result = await session.exec(existing_user_niches_statement)
        existing_user_niches = existing_user_niches_result.all()

        for user_niche in existing_user_niches:
            await session.delete(user_niche)

        # Clear user's industry
        user.industry_id = None

        # Save changes
        session.add(user)
        await session.commit()

        return MessageResponseModel(message="Industry and niches cleared successfully")
