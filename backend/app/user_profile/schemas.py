from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

from app.industry.schemas import IndustryModel
from app.niche.schemas import NicheModel


# ==================== REQUEST SCHEMAS ====================


class UserProfileUpdateModel(BaseModel):
    """Schema for updating user profile information"""

    artist_name: Optional[str] = Field(default=None, max_length=50)
    first_name: Optional[str] = Field(default=None, max_length=50)
    last_name: Optional[str] = Field(default=None, max_length=50)


class UserIndustryNicheUpdateModel(BaseModel):
    """Schema for updating user's industry and niches"""

    industry_id: uuid.UUID = Field(description="Industry ID")
    niche_ids: List[uuid.UUID] = Field(description="List of niche IDs")


# ==================== RESPONSE SCHEMAS ====================


class UserProfileModel(BaseModel):
    """Schema for user profile response"""

    id: uuid.UUID
    artist_name: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    is_verified: bool
    industry_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserIndustryNicheResponseModel(BaseModel):
    """Schema for industry and niche update response"""

    message: str
    industry: IndustryModel
    niches: List[NicheModel]


class MessageResponseModel(BaseModel):
    """Schema for simple message responses"""

    message: str
