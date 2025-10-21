import uuid
from sqlmodel import Column, SQLModel, Field
from typing import Optional
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Relationship
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.niche import Niche

class UserNiche(SQLModel, table=True):
    __tablename__ = "user_niches"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    user_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey("users.id"), nullable=False)
    )
    niche_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey("niches.id"), nullable=False)
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
    user: Optional["User"] = Relationship(back_populates="user_niches")
    niche: Optional["Niche"] = Relationship(back_populates="user_niches")
