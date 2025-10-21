from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime


# ==================== REQUEST SCHEMAS ====================


class IndustryCreateModel(BaseModel):
    """Schema for creating a new industry"""

    name: str = Field(max_length=100, description="Industry name")


class IndustryUpdateModel(BaseModel):
    """Schema for updating an industry"""

    name: Optional[str] = Field(
        default=None, max_length=100, description="Industry name"
    )


# ==================== RESPONSE SCHEMAS ====================


class IndustryModel(BaseModel):
    """Schema for industry response"""

    id: uuid.UUID
    name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IndustryListResponseModel(BaseModel):
    """Schema for industry list response"""

    industries: List[IndustryModel]
    total: int


class MessageResponseModel(BaseModel):
    """Schema for simple message responses"""

    message: str
