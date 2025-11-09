import uuid
from sqlmodel import Column, SQLModel, Field
from typing import List, Optional
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Relationship
from sqlalchemy import ForeignKey
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User


class Chat(SQLModel, table=True):
    """Chat conversation model"""

    __tablename__ = "chats"

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
    title: Optional[str] = Field(
        default=None, sa_column=Column(pg.VARCHAR, nullable=True)
    )  # Optional title for the chat
    contract_text: Optional[str] = Field(
        default=None, sa_column=Column(pg.TEXT, nullable=True)
    )  # Store the original contract text for follow-up questions
    contract_excerpt: Optional[str] = Field(
        default=None, sa_column=Column(pg.TEXT, nullable=True)
    )
    created_at: datetime = Field(
        sa_column=Column(pg.TIMESTAMP, nullable=False, default=datetime.utcnow)
    )
    updated_at: datetime = Field(
        sa_column=Column(
            pg.TIMESTAMP,
            nullable=False,
            default=datetime.utcnow,
            onupdate=datetime.utcnow,
        )
    )

    # Relationships
    user: Optional["User"] = Relationship(back_populates="chats")
    messages: List["ChatMessage"] = Relationship(
        back_populates="chat",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "lazy": "selectin",
        },
    )


class ChatMessage(SQLModel, table=True):
    """Individual message in a chat"""

    __tablename__ = "chat_messages"

    id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            nullable=False,
            primary_key=True,
            default=uuid.uuid4,
        )
    )
    chat_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            ForeignKey("chats.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        )
    )
    role: str = Field(
        sa_column=Column(pg.VARCHAR, nullable=False)
    )  # "user" or "assistant"
    content: str = Field(sa_column=Column(pg.TEXT, nullable=False))  # Message content
    reasoning: Optional[str] = Field(
        default=None, sa_column=Column(pg.TEXT, nullable=True)
    )  # Optional reasoning for assistant messages
    created_at: datetime = Field(
        sa_column=Column(pg.TIMESTAMP, nullable=False, default=datetime.utcnow)
    )

    # Relationships
    chat: Optional["Chat"] = Relationship(
        back_populates="messages",
        sa_relationship_kwargs={"lazy": "selectin"},
    )
