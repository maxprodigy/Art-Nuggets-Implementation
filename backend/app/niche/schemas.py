from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime


# ==================== REQUEST SCHEMAS ====================


class NicheCreateModel(BaseModel):
    """Schema for creating a new niche"""

    name: str = Field(max_length=100, description="Niche name")
    industry_id: uuid.UUID = Field(description="Industry ID this niche belongs to")


class NicheUpdateModel(BaseModel):
    """Schema for updating a niche"""

    name: Optional[str] = Field(default=None, max_length=100, description="Niche name")
    industry_id: Optional[uuid.UUID] = Field(
        default=None, description="Industry ID this niche belongs to"
    )


# ==================== RESPONSE SCHEMAS ====================


class NicheModel(BaseModel):
    """Schema for niche response"""

    id: uuid.UUID
    name: str
    industry_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NicheListResponseModel(BaseModel):
    """Schema for niche list response"""

    niches: List[NicheModel]
    total: int


class MessageResponseModel(BaseModel):
    """Schema for simple message responses"""

    message: str
