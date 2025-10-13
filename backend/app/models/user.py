import uuid
from sqlmodel import Column, SQLModel, Field
from typing import List, Optional
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg


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
    password_hash: str = Field(
        exclude=True, sa_column=Column(pg.VARCHAR, nullable=False)
    )
    artist_name: Optional[str] = Field(default=None, sa_column=Column(pg.VARCHAR))
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

    def __repr__(self):
        return f"<User {self.artist_name}>"
