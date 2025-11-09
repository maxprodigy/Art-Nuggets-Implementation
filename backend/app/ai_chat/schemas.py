from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class ContractAnalysisRequest(BaseModel):
    """Request model for contract analysis"""

    user_text: Optional[str] = Field(
        None, description="Additional text or questions from the user"
    )


class ContractAnalysisResponse(BaseModel):
    """Response model for contract analysis"""

    analysis: str = Field(..., description="The AI-generated contract analysis")
    extracted_text: Optional[str] = Field(
        None, description="Extracted text from the PDF if provided"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    chat_id: Optional[uuid.UUID] = Field(
        default=None, description="Associated chat ID if the conversation was saved"
    )


class ErrorResponse(BaseModel):
    """Error response model"""

    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")


class ChatMessageCreate(BaseModel):
    """Schema for creating a chat message"""

    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    reasoning: Optional[str] = Field(
        None, description="Reasoning text for assistant messages"
    )


class ChatMessageModel(BaseModel):
    """Schema for chat message response"""

    id: uuid.UUID
    role: str
    content: str
    reasoning: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreate(BaseModel):
    """Schema for creating a new chat"""

    title: Optional[str] = Field(None, description="Optional chat title")
    messages: List[ChatMessageCreate] = Field(
        default_factory=list, description="Initial messages"
    )
    contract_text: Optional[str] = Field(
        None, description="Original contract text for follow-up questions"
    )


class ChatModel(BaseModel):
    """Schema for chat response"""

    id: uuid.UUID
    user_id: uuid.UUID
    title: Optional[str]
    contract_text: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageModel] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    """Schema for list of chats"""

    chats: List[ChatModel]
    total: int
