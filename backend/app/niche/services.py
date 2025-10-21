import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List, Optional
from fastapi import HTTPException, status

from app.models.niche import Niche
from app.models.industry import Industry
from app.niche.schemas import (
    NicheCreateModel,
    NicheUpdateModel,
    NicheModel,
    NicheListResponseModel,
    MessageResponseModel,
)


class NicheService:
    """Service class for niche operations"""

    async def get_niche_by_id(
        self, niche_id: uuid.UUID, session: AsyncSession
    ) -> Optional[Niche]:
        """Get niche by ID"""
        statement = select(Niche).where(Niche.id == niche_id)
        result = await session.exec(statement)
        return result.first()

    async def get_all_niches(
        self,
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        industry_id: Optional[uuid.UUID] = None,
    ) -> NicheListResponseModel:
        """Get all niches with pagination and optional industry filtering"""

        # Build query
        statement = select(Niche)

        # Add industry filter if provided
        if industry_id:
            statement = statement.where(Niche.industry_id == industry_id)

        # Add pagination
        statement = statement.offset(skip).limit(limit)

        # Execute query
        result = await session.exec(statement)
        niches = result.all()

        # Get total count
        count_statement = select(Niche)
        if industry_id:
            count_statement = count_statement.where(Niche.industry_id == industry_id)

        count_result = await session.exec(count_statement)
        total = len(count_result.all())

        # Convert to response models
        niche_models = [NicheModel.model_validate(niche) for niche in niches]

        return NicheListResponseModel(niches=niche_models, total=total)

    async def get_niches_by_industry(
        self,
        industry_id: uuid.UUID,
        session: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> NicheListResponseModel:
        """Get all niches for a specific industry"""

        # Validate industry exists
        industry_statement = select(Industry).where(Industry.id == industry_id)
        industry_result = await session.exec(industry_statement)
        industry = industry_result.first()

        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found"
            )

        return await self.get_all_niches(
            session=session, skip=skip, limit=limit, industry_id=industry_id
        )

    async def create_niche(
        self, niche_data: NicheCreateModel, session: AsyncSession
    ) -> NicheModel:
        """Create a new niche"""

        # Validate industry exists
        industry_statement = select(Industry).where(
            Industry.id == niche_data.industry_id
        )
        industry_result = await session.exec(industry_statement)
        industry = industry_result.first()

        if not industry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found"
            )

        # Check if niche with same name already exists in this industry
        existing_statement = select(Niche).where(
            Niche.name == niche_data.name, Niche.industry_id == niche_data.industry_id
        )
        existing_result = await session.exec(existing_statement)
        existing_niche = existing_result.first()

        if existing_niche:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Niche with this name already exists in this industry",
            )

        # Create new niche
        new_niche = Niche(
            name=niche_data.name,
            industry_id=niche_data.industry_id,
        )

        session.add(new_niche)
        await session.commit()
        await session.refresh(new_niche)

        return NicheModel.model_validate(new_niche)

    async def update_niche(
        self,
        niche_id: uuid.UUID,
        update_data: NicheUpdateModel,
        session: AsyncSession,
    ) -> NicheModel:
        """Update a niche"""

        # Get niche
        niche = await self.get_niche_by_id(niche_id, session)
        if not niche:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Niche not found"
            )

        # Validate industry exists if being updated
        if update_data.industry_id:
            industry_statement = select(Industry).where(
                Industry.id == update_data.industry_id
            )
            industry_result = await session.exec(industry_statement)
            industry = industry_result.first()

            if not industry:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found"
                )

        # Check if name is being updated and if it conflicts
        if update_data.name and update_data.name != niche.name:
            # Use the new industry_id if provided, otherwise use existing
            target_industry_id = update_data.industry_id or niche.industry_id

            existing_statement = select(Niche).where(
                Niche.name == update_data.name, Niche.industry_id == target_industry_id
            )
            existing_result = await session.exec(existing_statement)
            existing_niche = existing_result.first()

            if existing_niche:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Niche with this name already exists in this industry",
                )

        # Update fields if provided
        update_dict = update_data.dict(exclude_unset=True)

        for field, value in update_dict.items():
            if hasattr(niche, field) and value is not None:
                setattr(niche, field, value)

        # Save changes
        session.add(niche)
        await session.commit()
        await session.refresh(niche)

        return NicheModel.model_validate(niche)

    async def delete_niche(
        self, niche_id: uuid.UUID, session: AsyncSession
    ) -> MessageResponseModel:
        """Delete a niche (hard delete)"""

        # Get niche
        niche = await self.get_niche_by_id(niche_id, session)
        if not niche:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Niche not found"
            )

        # Check if niche has associated users
        from app.models.user_niche import UserNiche

        user_niches_statement = select(UserNiche).where(UserNiche.niche_id == niche_id)
        user_niches_result = await session.exec(user_niches_statement)
        user_niches = user_niches_result.all()

        if user_niches:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete niche that has associated users. Please reassign users first.",
            )

        # Hard delete the niche
        await session.delete(niche)
        await session.commit()

        return MessageResponseModel(message="Niche deleted successfully")
