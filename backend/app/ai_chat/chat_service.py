from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import uuid
from datetime import datetime
from app.models.chat import Chat, ChatMessage
from app.ai_chat.schemas import ChatCreate, ChatMessageCreate


class ChatService:
    """Service for managing chat conversations"""

    async def create_chat(
        self,
        user_id: uuid.UUID,
        chat_data: ChatCreate,
        session: AsyncSession,
    ) -> Chat:
        """Create a new chat with messages"""
        chat = Chat(
            user_id=user_id,
            title=chat_data.title,
            contract_text=getattr(chat_data, "contract_text", None),
        )
        session.add(chat)
        await session.flush()  # Get the chat ID

        # Add messages
        for msg_data in chat_data.messages:
            message = ChatMessage(
                chat_id=chat.id,
                role=msg_data.role,
                content=msg_data.content,
                reasoning=msg_data.reasoning,
            )
            session.add(message)

        await session.commit()
        await session.refresh(chat, ["messages"])
        return chat

    async def get_user_chats(
        self,
        user_id: uuid.UUID,
        skip: int = 0,
        limit: int = 50,
        session: AsyncSession = None,
    ) -> tuple[List[Chat], int]:
        """Get all chats for a user"""
        # Get total count
        count_stmt = (
            select(func.count()).select_from(Chat).where(Chat.user_id == user_id)
        )
        total_result = await session.execute(count_stmt)
        total = total_result.scalar_one()

        # Get chats with messages
        stmt = (
            select(Chat)
            .where(Chat.user_id == user_id)
            .order_by(Chat.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await session.execute(stmt)
        chats = result.scalars().all()

        # Eager load messages
        for chat in chats:
            await session.refresh(chat, ["messages"])

        return list(chats), total

    async def get_chat_by_id(
        self,
        chat_id: uuid.UUID,
        user_id: uuid.UUID,
        session: AsyncSession,
    ) -> Optional[Chat]:
        """Get a specific chat by ID (ensuring it belongs to the user)"""
        stmt = select(Chat).where(Chat.id == chat_id, Chat.user_id == user_id)
        result = await session.execute(stmt)
        chat = result.scalar_one_or_none()

        if chat:
            await session.refresh(chat, ["messages"])

        return chat

    async def add_message_to_chat(
        self,
        chat_id: uuid.UUID,
        user_id: uuid.UUID,
        message_data: ChatMessageCreate,
        session: AsyncSession,
    ) -> ChatMessage:
        """Add a message to an existing chat"""
        # Verify chat belongs to user
        chat = await self.get_chat_by_id(chat_id, user_id, session)
        if not chat:
            raise ValueError("Chat not found or access denied")

        message = ChatMessage(
            chat_id=chat_id,
            role=message_data.role,
            content=message_data.content,
            reasoning=message_data.reasoning,
        )
        session.add(message)

        # Update chat's updated_at
        chat.updated_at = datetime.utcnow()

        await session.commit()
        await session.refresh(message)
        return message

    async def delete_chat(
        self,
        chat_id: uuid.UUID,
        user_id: uuid.UUID,
        session: AsyncSession,
    ) -> bool:
        """Delete a chat"""
        chat = await self.get_chat_by_id(chat_id, user_id, session)
        if not chat:
            return False

        await session.delete(chat)
        await session.commit()
        return True
