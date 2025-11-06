from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


# ==================== REQUEST SCHEMAS ====================


class KeyTakeawayCreate(BaseModel):
    """Schema for creating a key takeaway"""

    content: str = Field(description="Content of the key takeaway")


class AdditionalResourceCreate(BaseModel):
    """Schema for creating an additional resource"""

    title: str = Field(description="Title of the resource")
    link: str = Field(description="Link to the resource")


class CourseCreateModel(BaseModel):
    """Schema for creating a course"""

    title: str = Field(description="Course title")
    industry_id: uuid.UUID = Field(description="Industry ID")
    niche_id: uuid.UUID = Field(description="Niche ID")
    video_link: str = Field(description="Video link (e.g., YouTube)")
    summary: str = Field(description="Course summary")
    source: Optional[str] = Field(default=None, description="Source information/link")
    key_takeaways: List[KeyTakeawayCreate] = Field(
        description="List of key takeaways", min_items=1
    )
    additional_resources: Optional[List[AdditionalResourceCreate]] = Field(
        default=[], description="List of additional resources"
    )


class CourseUpdateModel(BaseModel):
    """Schema for updating a course (all fields optional)"""

    title: Optional[str] = None
    industry_id: Optional[uuid.UUID] = None
    niche_id: Optional[uuid.UUID] = None
    video_link: Optional[str] = None
    summary: Optional[str] = None
    source: Optional[str] = None
    key_takeaways: Optional[List[KeyTakeawayCreate]] = None
    additional_resources: Optional[List[AdditionalResourceCreate]] = None


# ==================== RESPONSE SCHEMAS ====================


class KeyTakeawayResponse(BaseModel):
    """Schema for key takeaway response"""

    id: uuid.UUID
    content: str
    order: int

    class Config:
        from_attributes = True


class AdditionalResourceResponse(BaseModel):
    """Schema for additional resource response"""

    id: uuid.UUID
    title: str
    link: str
    order: int

    class Config:
        from_attributes = True


class CourseDetailResponse(BaseModel):
    """Schema for detailed course response"""

    id: uuid.UUID
    title: str
    industry_id: uuid.UUID
    niche_id: uuid.UUID
    video_link: str
    summary: str
    source: Optional[str]
    created_at: datetime
    updated_at: datetime
    key_takeaways: List[KeyTakeawayResponse]
    additional_resources: List[AdditionalResourceResponse]

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    """Schema for course list response (simplified)"""

    id: uuid.UUID
    title: str
    industry_id: uuid.UUID
    niche_id: uuid.UUID
    video_link: str
    summary: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserCourseProgressResponse(BaseModel):
    """Schema for user course progress response"""

    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    is_favourite: bool
    is_completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PaginatedCourseResponse(BaseModel):
    """Schema for paginated course list response"""

    items: List[CourseListResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponseModel(BaseModel):
    """Schema for simple message responses"""

    message: str
