from fastapi import APIRouter, HTTPException, status
from app.auth.schemas import UserCreateModel, UserModel, UserLoginModel
from app.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import Depends
from app.auth.services import UserService
from .utils import create_access_token, verify_password
from fastapi.responses import JSONResponse
from datetime import timedelta, datetime
from .dependencies import AccessTokenBearer, RefreshTokenBearer
from app.core.redis import add_jti_to_blocklist


auth_router = APIRouter()
user_service = UserService()


@auth_router.post("/signup/", status_code=201)
async def create_user_account(
    user_data: UserCreateModel,
    session: AsyncSession = Depends(get_session),
):
    """Create user account and return tokens for immediate access"""
    return await user_service.create_user_with_tokens(user_data, session)


@auth_router.post("/login", status_code=200)
async def login_users(
    login_data: UserLoginModel, session: AsyncSession = Depends(get_session)
):
    """Authenticate user and return tokens"""
    return await user_service.authenticate_user(
        login_data.email, login_data.password, session
    )


@auth_router.get("/refresh")
async def get_new_access_token(token_details: dict = Depends(RefreshTokenBearer())):
    expiry_timestamp = token_details["exp"]

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_access_token(user_data=token_details["user"])
        return JSONResponse(content={"access_token": new_access_token})


@auth_router.get("/logout")
async def revoke_token(token_details: dict = Depends(AccessTokenBearer())):
    jti = token_details["jti"]
    await add_jti_to_blocklist(jti)
    return JSONResponse(content={"message": "Logged Out Successfully"}, status_code=200)
