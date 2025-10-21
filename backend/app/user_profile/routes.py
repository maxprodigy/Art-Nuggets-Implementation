from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Dict, Any
import uuid

from app.core.database import get_session
from app.auth.dependencies import AccessTokenBearer
from app.user_profile.services import UserProfileService
from app.user_profile.schemas import (
    UserProfileUpdateModel,
    UserIndustryNicheUpdateModel,
    UserProfileModel,
    UserIndustryNicheResponseModel,
    MessageResponseModel,
)

# Initialize router and service
user_profile_router = APIRouter(prefix="/user-profile", tags=["User Profile"])
user_profile_service = UserProfileService()


@user_profile_router.get(
    "/me",
    response_model=UserProfileModel,
    status_code=status.HTTP_200_OK,
)
async def get_user_profile(
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Get current user's profile"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await user_profile_service.get_user_profile(user_id, session)


@user_profile_router.put(
    "/profile",
    response_model=UserProfileModel,
    status_code=status.HTTP_200_OK,
)
async def update_user_profile(
    update_data: UserProfileUpdateModel,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Update user's profile information"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await user_profile_service.update_user_profile(user_id, update_data, session)


@user_profile_router.put(
    "/industry-niches",
    response_model=UserIndustryNicheResponseModel,
    status_code=status.HTTP_200_OK,
)
async def update_user_industry_and_niches(
    update_data: UserIndustryNicheUpdateModel,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Update user's industry and niches"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await user_profile_service.update_user_industry_and_niches(
        user_id, update_data, session
    )


@user_profile_router.delete(
    "/industry-niches",
    response_model=MessageResponseModel,
    status_code=status.HTTP_200_OK,
)
async def clear_user_industry_and_niches(
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Clear user's industry and niches"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    return await user_profile_service.clear_user_industry_and_niches(user_id, session)
