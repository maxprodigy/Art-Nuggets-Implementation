import uuid
from sqlmodel import Column, SQLModel, Field
from typing import List, Optional
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Relationship
from sqlalchemy import ForeignKey, UniqueConstraint
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.industry import Industry
    from app.models.niche import Niche
    from app.models.user import User


class Course(SQLModel, table=True):
    """Course/Lesson model"""

    __tablename__ = "courses"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    title: str = Field(sa_column=Column(pg.VARCHAR, nullable=False, index=True))
    industry_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID, ForeignKey("industries.id", ondelete="CASCADE"), nullable=False
        )
    )
    niche_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID, ForeignKey("niches.id", ondelete="CASCADE"), nullable=False
        )
    )
    video_link: str = Field(sa_column=Column(pg.VARCHAR, nullable=False))
    summary: str = Field(sa_column=Column(pg.TEXT, nullable=False))
    source: Optional[str] = Field(
        default=None, sa_column=Column(pg.VARCHAR, nullable=True)
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
    industry: Optional["Industry"] = Relationship(back_populates="courses")
    niche: Optional["Niche"] = Relationship(back_populates="courses")
    key_takeaways: List["CourseKeyTakeaway"] = Relationship(
        back_populates="course",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    additional_resources: List["CourseAdditionalResource"] = Relationship(
        back_populates="course",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    user_progress: List["UserCourseProgress"] = Relationship(
        back_populates="course",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    def __repr__(self):
        return f"<Course {self.title}>"


class CourseKeyTakeaway(SQLModel, table=True):
    """Key takeaways for courses"""

    __tablename__ = "course_key_takeaways"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    course_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
        )
    )
    content: str = Field(sa_column=Column(pg.TEXT, nullable=False))
    order: int = Field(sa_column=Column(pg.INTEGER, nullable=False))

    # Relationship
    course: Optional["Course"] = Relationship(back_populates="key_takeaways")

    def __repr__(self):
        return f"<CourseKeyTakeaway {self.order}: {self.content[:30]}>"


class CourseAdditionalResource(SQLModel, table=True):
    """Additional resources for courses"""

    __tablename__ = "course_additional_resources"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    course_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
        )
    )
    title: str = Field(sa_column=Column(pg.VARCHAR, nullable=False))
    link: str = Field(sa_column=Column(pg.VARCHAR, nullable=False))
    order: int = Field(sa_column=Column(pg.INTEGER, nullable=False))

    # Relationship
    course: Optional["Course"] = Relationship(back_populates="additional_resources")

    def __repr__(self):
        return f"<CourseAdditionalResource {self.title}>"


class UserCourseProgress(SQLModel, table=True):
    """Track user's progress and interactions with courses"""

    __tablename__ = "user_course_progress"

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="unique_user_course"),
    )

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    user_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    course_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("courses.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    is_favourite: bool = Field(
        default=False, sa_column=Column(pg.BOOLEAN, nullable=False, default=False)
    )
    is_completed: bool = Field(
        default=False, sa_column=Column(pg.BOOLEAN, nullable=False, default=False)
    )
    completed_at: Optional[datetime] = Field(
        default=None, sa_column=Column(pg.TIMESTAMP, nullable=True)
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
    user: Optional["User"] = Relationship(back_populates="course_progress")
    course: Optional["Course"] = Relationship(back_populates="user_progress")

    def __repr__(self):
        return f"<UserCourseProgress User:{self.user_id} Course:{self.course_id}>"
