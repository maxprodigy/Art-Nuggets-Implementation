from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional
import uuid

from app.core.database import get_session
from app.auth.dependencies import RoleChecker
from app.niche.services import NicheService
from app.niche.schemas import (
    NicheCreateModel,
    NicheUpdateModel,
    NicheModel,
    NicheListResponseModel,
    MessageResponseModel,
)

# Initialize router and service
niche_router = APIRouter(prefix="/niches", tags=["Niches"])
niche_service = NicheService()

# Role checkers
admin_only = RoleChecker(["admin"])


@niche_router.get(
    "/",
    response_model=NicheListResponseModel,
    status_code=status.HTTP_200_OK,
    summary="Get all niches",
    description="Get a list of all niches with optional industry filtering (public endpoint)",
)
async def get_all_niches(
    skip: int = Query(0, ge=0, description="Number of niches to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of niches to return"),
    industry_id: Optional[uuid.UUID] = Query(
        None, description="Filter niches by industry ID"
    ),
    session: AsyncSession = Depends(get_session),
):
    """Get all niches with pagination and optional industry filtering (public endpoint)"""
    return await niche_service.get_all_niches(
        session=session, skip=skip, limit=limit, industry_id=industry_id
    )


@niche_router.get(
    "/industry/{industry_id}",
    response_model=NicheListResponseModel,
    status_code=status.HTTP_200_OK,
    summary="Get niches by industry",
    description="Get all niches for a specific industry (public endpoint)",
)
async def get_niches_by_industry(
    industry_id: uuid.UUID,
    skip: int = Query(0, ge=0, description="Number of niches to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of niches to return"),
    session: AsyncSession = Depends(get_session),
):
    """Get all niches for a specific industry (public endpoint)"""
    return await niche_service.get_niches_by_industry(
        industry_id=industry_id, session=session, skip=skip, limit=limit
    )


@niche_router.get(
    "/{niche_id}",
    response_model=NicheModel,
    status_code=status.HTTP_200_OK,
    summary="Get niche by ID",
    description="Get a specific niche by ID (public endpoint)",
)
async def get_niche_by_id(
    niche_id: uuid.UUID,
    session: AsyncSession = Depends(get_session),
):
    """Get niche by ID (public endpoint)"""
    niche = await niche_service.get_niche_by_id(niche_id, session)
    if not niche:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Niche not found"
        )

    return NicheModel.model_validate(niche)


@niche_router.post(
    "/",
    response_model=NicheModel,
    status_code=status.HTTP_201_CREATED,
    summary="Create new niche",
    description="Create a new niche (admin only)",
)
async def create_niche(
    niche_data: NicheCreateModel,
    _: bool = Depends(admin_only),
    session: AsyncSession = Depends(get_session),
):
    """Create a new niche (admin only)"""
    return await niche_service.create_niche(niche_data, session)


@niche_router.put(
    "/{niche_id}",
    response_model=NicheModel,
    status_code=status.HTTP_200_OK,
    summary="Update niche",
    description="Update an existing niche (admin only)",
)
async def update_niche(
    niche_id: uuid.UUID,
    update_data: NicheUpdateModel,
    _: bool = Depends(admin_only),
    session: AsyncSession = Depends(get_session),
):
    """Update a niche (admin only)"""
    return await niche_service.update_niche(niche_id, update_data, session)


@niche_router.delete(
    "/{niche_id}",
    response_model=MessageResponseModel,
    status_code=status.HTTP_200_OK,
    summary="Delete niche",
    description="Delete a niche (admin only)",
)
async def delete_niche(
    niche_id: uuid.UUID,
    _: bool = Depends(admin_only),
    session: AsyncSession = Depends(get_session),
):
    """Delete a niche (admin only)"""
    return await niche_service.delete_niche(niche_id, session)
