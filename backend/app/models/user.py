import uuid
from sqlmodel import Column, SQLModel, Field
from typing import List, Optional
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Relationship
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.industry import Industry
    from app.models.user_niche import UserNiche
    from app.models.course import UserCourseProgress
    from app.models.chat import Chat


class User(SQLModel, table=True):
    """User model following industry best practices"""

    __tablename__ = "users"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    email: str = Field(
        sa_column=Column(pg.VARCHAR, nullable=False, unique=True, index=True)
    )
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password_hash: str = Field(
        exclude=True, sa_column=Column(pg.VARCHAR, nullable=False)
    )
    artist_name: Optional[str] = Field(default=None, sa_column=Column(pg.VARCHAR))
    industry_id: Optional[uuid.UUID] = Field(
        sa_column=Column(pg.UUID, ForeignKey("industries.id"), nullable=True)
    )
    role: str = Field(sa_column=Column(pg.VARCHAR, nullable=False, default="regular"))
    is_verified: bool = Field(
        default=False, sa_column=Column(pg.BOOLEAN, nullable=False, default=False)
    )
    created_at: datetime = Field(
        sa_column=Column(pg.TIMESTAMP, nullable=False, default=datetime.now)
    )
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.now,
            onupdate=datetime.now,
        )
    )

    # Relationships
    industry: Optional["Industry"] = Relationship(back_populates="users")
    user_niches: List["UserNiche"] = Relationship(back_populates="user")
    course_progress: List["UserCourseProgress"] = Relationship(back_populates="user")
    chats: List["Chat"] = Relationship(back_populates="user")

    def __repr__(self):
        return f"<User {self.artist_name}>"
