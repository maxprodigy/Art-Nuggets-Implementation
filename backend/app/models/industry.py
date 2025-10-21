import uuid
from sqlmodel import Column, SQLModel, Field
from typing import List
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Relationship
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.niche import Niche
    from app.models.user import User


class Industry(SQLModel, table=True):
    __tablename__ = "industries"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    name: str = Field(sa_column=Column(pg.VARCHAR, nullable=False, unique=True, index=True))
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
    niches: List["Niche"] = Relationship(back_populates="industry")
    users: List["User"] = Relationship(back_populates="industry")
