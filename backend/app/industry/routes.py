from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
import uuid

from app.core.database import get_session
from app.auth.dependencies import RoleChecker
from app.industry.services import IndustryService
from app.industry.schemas import (
    IndustryCreateModel,
    IndustryUpdateModel,
    IndustryModel,
    IndustryListResponseModel,
    MessageResponseModel,
)

# Initialize router and service
industry_router = APIRouter(prefix="/industries", tags=["Industries"])
industry_service = IndustryService()

# Role checkers
admin_only = RoleChecker(["admin"])


@industry_router.get(
    "/",
    response_model=IndustryListResponseModel,
    status_code=status.HTTP_200_OK,
    summary="Get all industries",
    description="Get a list of all industries (public endpoint)",
)
async def get_all_industries(
    skip: int = Query(0, ge=0, description="Number of industries to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Number of industries to return"
    ),
    session: AsyncSession = Depends(get_session),
):
    """Get all industries with pagination (public endpoint)"""
    return await industry_service.get_all_industries(
        session=session, skip=skip, limit=limit
    )


@industry_router.get(
    "/{industry_id}",
    response_model=IndustryModel,
    status_code=status.HTTP_200_OK,
    summary="Get industry by ID",
    description="Get a specific industry by ID (public endpoint)",
)
async def get_industry_by_id(
    industry_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get industry by ID (public endpoint)"""
    industry = await industry_service.get_industry_by_id(industry_id, session)
    if not industry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Industry not found"
        )

    return IndustryModel.model_validate(industry)


@industry_router.post(
    "/",
    response_model=IndustryModel,
    status_code=status.HTTP_201_CREATED,
    summary="Create new industry",
    description="Create a new industry (admin only)",
)
async def create_industry(
    industry_data: IndustryCreateModel,
    _: bool = Depends(admin_only),
    session: AsyncSession = Depends(get_session),
):
    """Create a new industry (admin only)"""
    return await industry_service.create_industry(industry_data, session)


@industry_router.put(
    "/{industry_id}",
    response_model=IndustryModel,
    status_code=status.HTTP_200_OK,
    summary="Update industry",
    description="Update an existing industry (admin only)",
)
async def update_industry(
    industry_id: uuid.UUID,
    update_data: IndustryUpdateModel,
    _: bool = Depends(admin_only),
    session: AsyncSession = Depends(get_session),
):
    """Update an industry (admin only)"""
    return await industry_service.update_industry(industry_id, update_data, session)


@industry_router.delete(
    "/{industry_id}",
    response_model=MessageResponseModel,
    status_code=status.HTTP_200_OK,
    summary="Delete industry",
    description="Delete an industry (admin only)",
)
async def delete_industry(
    industry_id: uuid.UUID,
    _: bool = Depends(admin_only),
    session: AsyncSession = Depends(get_session),
):
    """Delete an industry (admin only)"""
    return await industry_service.delete_industry(industry_id, session)
