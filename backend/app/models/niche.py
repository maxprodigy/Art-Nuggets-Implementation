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

class Niche(SQLModel, table=True):
    __tablename__ = "niches"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    industry_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey("industries.id"), nullable=False)
    )
    name: str = Field(sa_column=Column(pg.VARCHAR, nullable=False, index=True))
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
    industry: Optional["Industry"] = Relationship(back_populates="niches")
    user_niches: List["UserNiche"] = Relationship(back_populates="niche")
