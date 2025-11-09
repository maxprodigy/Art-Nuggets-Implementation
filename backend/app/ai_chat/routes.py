from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Form,
    Query,
)
from typing import Optional
from sqlmodel.ext.asyncio.session import AsyncSession
import uuid

from app.core.database import get_session
from app.auth.dependencies import AccessTokenBearer
from app.ai_chat.services import ContractAnalyzerService
from app.ai_chat.chat_service import ChatService
from app.ai_chat.schemas import (
    ContractAnalysisResponse,
    ErrorResponse,
    ChatCreate,
    ChatModel,
    ChatListResponse,
    ChatMessageCreate,
    ChatMessageModel,
)
from typing import Dict, Any

# Initialize router and service
ai_chat_router = APIRouter(prefix="/ai-chat", tags=["AI Chat"])
contract_analyzer = ContractAnalyzerService()
chat_service = ChatService()


@ai_chat_router.post(
    "/analyze-contract",
    response_model=ContractAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze a contract",
    description="Upload a PDF contract and optionally add text for analysis. Returns AI-generated contract analysis.",
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Bad request - invalid file or missing data",
        },
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def analyze_contract(
    file: Optional[UploadFile] = File(None, description="PDF contract file"),
    user_text: Optional[str] = Form(
        None, description="Additional text or questions from the user"
    ),
    chat_id: Optional[uuid.UUID] = Form(
        None, description="Optional: Save to existing chat"
    ),
    save_to_chat: bool = Form(
        False, description="Save this conversation to a new chat"
    ),
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """
    Analyze a contract using AI.

    Either a PDF file or user_text (or both) must be provided.
    - If PDF is provided: extracts text from PDF and analyzes it
    - If user_text is provided: analyzes the text directly
    - If both are provided: combines both for analysis

    Optionally save the conversation to a chat:
    - Set save_to_chat=True to create a new chat
    - Provide chat_id to add messages to an existing chat
    """

    contract_text = ""
    extracted_text = None
    additional_context = None

    # If chat_id is provided and no file, try to get contract text from chat (follow-up question)
    if chat_id and not file:
        chat = await chat_service.get_chat_by_id(
            chat_id,
            uuid.UUID(token_details["user"]["user_uid"]),
            session,
        )
        if chat and chat.contract_text:
            contract_text = chat.contract_text
            # user_text is now a follow-up question about the contract
            additional_context = user_text
        elif not user_text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please provide a question or upload a file",
            )

    # Extract text from PDF if provided
    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported",
            )

        extracted_text = contract_analyzer.extract_text_from_pdf(file)
        contract_text = extracted_text

    # Handle user text - if there's PDF text, treat user_text as additional context/questions
    # Otherwise, user_text is the contract text itself
    if (
        user_text and not additional_context
    ):  # Only process if not already set as follow-up
        if contract_text:
            # User text is additional context/questions for the PDF contract
            additional_context = user_text
        else:
            # User text is the contract itself (no PDF uploaded)
            contract_text = user_text

    # Validate that we have some text to analyze
    if not contract_text or not contract_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a PDF file or text input must be provided, or this chat must have a previously uploaded contract",
        )

    # Analyze the contract (returns formatted analysis with reasoning)
    formatted_analysis = await contract_analyzer.analyze_contract(
        contract_text=contract_text,
        user_text=additional_context,  # Pass additional context separately if provided
    )

    # Extract reasoning and main response from formatted string for saving to database
    # The formatted string has format: "--- Model Reasoning ---\n\n[reasoning]\n\n[divider]\n\n[main]"
    separator = "--- Model Reasoning ---\n\n"
    divider = "\n\n" + "=" * 60 + "\n\n"

    main_response = formatted_analysis
    reasoning_text = None

    if separator in formatted_analysis and divider in formatted_analysis:
        parts = formatted_analysis.split(divider)
        if len(parts) == 2:
            reasoning_part = parts[0].replace(separator, "").strip()
            main_response = parts[1].strip()
            reasoning_text = reasoning_part if reasoning_part else None

    # Save to chat if requested
    user_id = uuid.UUID(token_details["user"]["user_uid"])

    result_chat_id: Optional[uuid.UUID] = None

    if save_to_chat:
        # Create a new chat
        chat_title = file.filename if file else "Contract Analysis"
        user_message_content = user_text or (
            f"Uploaded: {file.filename}" if file else "Contract analysis request"
        )

        chat_data = ChatCreate(
            title=chat_title,
            messages=[
                ChatMessageCreate(
                    role="user",
                    content=user_message_content,
                ),
                ChatMessageCreate(
                    role="assistant",
                    content=main_response,
                    reasoning=reasoning_text if reasoning_text else None,
                ),
            ],
            contract_text=extracted_text or contract_text,  # Store contract text
        )
        created_chat = await chat_service.create_chat(user_id, chat_data, session)
        result_chat_id = created_chat.id

    elif chat_id:
        # Add messages to existing chat
        user_message_content = user_text or (
            f"Uploaded: {file.filename}" if file else "Contract analysis request"
        )

        # Update chat's contract_text if we have a new file
        if extracted_text:
            chat = await chat_service.get_chat_by_id(chat_id, user_id, session)
            if chat:
                chat.contract_text = extracted_text
                session.add(chat)
                await session.commit()

        # Add user message
        await chat_service.add_message_to_chat(
            chat_id,
            user_id,
            ChatMessageCreate(
                role="user",
                content=user_message_content,
            ),
            session,
        )

        # Add assistant message
        await chat_service.add_message_to_chat(
            chat_id,
            user_id,
            ChatMessageCreate(
                role="assistant",
                content=main_response,
                reasoning=reasoning_text if reasoning_text else None,
            ),
            session,
        )
        result_chat_id = chat_id

    return ContractAnalysisResponse(
        analysis=formatted_analysis,
        extracted_text=extracted_text,
        chat_id=result_chat_id,
    )


@ai_chat_router.post(
    "/chats",
    response_model=ChatModel,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chat",
)
async def create_chat(
    chat_data: ChatCreate,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Create a new chat conversation"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    chat = await chat_service.create_chat(user_id, chat_data, session)
    return chat


@ai_chat_router.get(
    "/chats",
    response_model=ChatListResponse,
    summary="Get user's chats",
)
async def get_chats(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Get all chats for the current user"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    chats, total = await chat_service.get_user_chats(user_id, skip, limit, session)
    return ChatListResponse(chats=chats, total=total)


@ai_chat_router.get(
    "/chats/{chat_id}",
    response_model=ChatModel,
    summary="Get a specific chat",
)
async def get_chat(
    chat_id: uuid.UUID,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Get a specific chat by ID"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    chat = await chat_service.get_chat_by_id(chat_id, user_id, session)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )
    return chat


@ai_chat_router.post(
    "/chats/{chat_id}/messages",
    response_model=ChatMessageModel,
    status_code=status.HTTP_201_CREATED,
    summary="Add message to chat",
)
async def add_message(
    chat_id: uuid.UUID,
    message_data: ChatMessageCreate,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Add a message to an existing chat"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    try:
        message = await chat_service.add_message_to_chat(
            chat_id, user_id, message_data, session
        )
        return message
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@ai_chat_router.delete(
    "/chats/{chat_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a chat",
)
async def delete_chat(
    chat_id: uuid.UUID,
    token_details: Dict[str, Any] = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
):
    """Delete a chat"""
    user_id = uuid.UUID(token_details["user"]["user_uid"])
    deleted = await chat_service.delete_chat(chat_id, user_id, session)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found",
        )
