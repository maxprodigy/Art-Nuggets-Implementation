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

REFRESH_TOKEN_EXPIRY = 2


@auth_router.post(
    "/signup/",
    response_model=UserModel,
    status_code=status.HTTP_201_CREATED,
)
async def create_user_account(
    user_data: UserCreateModel,
    session: AsyncSession = Depends(get_session),
):
    email = user_data.email

    user_exists = await user_service.user_exists(email, session)

    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User with this email already exists",
        )

    new_user = await user_service.create_regular_user(user_data, session)

    return new_user


@auth_router.post("/login", status_code=status.HTTP_200_OK)
async def login_users(
    login_data: UserLoginModel, session: AsyncSession = Depends(get_session)
):
    email = login_data.email
    password = login_data.password

    user = await user_service.get_user_by_email(email, session)

    if user is not None:
        password_valid = verify_password(password, user.password_hash)

        if password_valid:
            access_token = create_access_token(
                user_data={
                    "email": user.email,
                    "user_uid": str(user.id),
                    "role": user.role,
                }
            )

            refresh_token = create_access_token(
                user_data={"email": user.email, "user_uid": str(user.id)},
                refresh=True,
                expiry=timedelta(days=REFRESH_TOKEN_EXPIRY),
            )

            return JSONResponse(
                content={
                    "message": "Login Successful",
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": {"email": user.email, "uid": str(user.id), "role": user.role},
                }
            )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid email or password",
    )


@auth_router.get("/refresh")
async def get_new_access_token(token_details: dict = Depends(RefreshTokenBearer())):
    expiry_timestamp = token_details["exp"]

    if datetime.fromtimestamp(expiry_timestamp) > datetime.now():
        new_access_token = create_access_token(user_data=token_details["user"])

        return JSONResponse(content={"access_token": new_access_token})

    # The exception has been handled in the RefreshTokenBearer class, so the one below is optional
    # raise HTTPException(
    #     status_code=status.HTTP_400_BAD_REQUEST,
    #     detail="Please provide a valid refresh token",
    # )


@auth_router.get("/logout")
async def revoke_token(token_details: dict = Depends(AccessTokenBearer())):

    jti = token_details["jti"]

    await add_jti_to_blocklist(jti)

    return JSONResponse(
        content={"message": "Logged Out Successfully"}, status_code=status.HTTP_200_OK
    )
