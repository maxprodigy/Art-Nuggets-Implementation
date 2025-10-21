from sqlmodel.ext.asyncio.session import AsyncSession
from app.auth.schemas import UserCreateModel
from app.models.user import User
from sqlmodel import select
from .utils import generate_passwd_hash
from fastapi import HTTPException, status
from typing import Dict, Any
from datetime import timedelta
from .utils import create_access_token, verify_password


class UserService:
    REFRESH_TOKEN_EXPIRY = 2  # days

    async def get_user_by_email(self, email: str, session: AsyncSession):
        statement = select(User).where(User.email == email)
        result = await session.exec(statement)
        return result.first()

    async def user_exists(self, email: str, session: AsyncSession):
        user = await self.get_user_by_email(email, session)
        return user is not None

    async def validate_user_creation(self, email: str, session: AsyncSession):
        """Validate that user doesn't already exist"""
        if await self.user_exists(email, session):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User with this email already exists",
            )

    async def create_user_with_tokens(
        self, user_data: UserCreateModel, session: AsyncSession
    ) -> Dict[str, Any]:
        """Create user and return user data with tokens"""
        # Validate user doesn't exist
        await self.validate_user_creation(user_data.email, session)

        # Create user based on role
        if user_data.role == "admin":
            new_user = await self.create_admin_user(user_data, session)
        else:
            new_user = await self.create_regular_user(user_data, session)

        # Generate tokens
        access_token = create_access_token(
            user_data={
                "email": new_user.email,
                "user_uid": str(new_user.id),
                "role": new_user.role,
            }
        )

        refresh_token = create_access_token(
            user_data={"email": new_user.email, "user_uid": str(new_user.id)},
            refresh=True,
            expiry=timedelta(days=self.REFRESH_TOKEN_EXPIRY),
        )

        return {
            "message": "Account created successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": new_user.email,
                "uid": str(new_user.id),
                "role": new_user.role,
                "artist_name": new_user.artist_name,
            },
        }

    async def create_regular_user(
        self, user_data: UserCreateModel, session: AsyncSession
    ):
        user_data_dict = user_data.model_dump()
        password = user_data_dict.pop("password", None)

        new_user = User(**user_data_dict)
        new_user.password_hash = generate_passwd_hash(password)

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        return new_user

    async def create_admin_user(
        self, user_data: UserCreateModel, session: AsyncSession
    ):
        user_data_dict = user_data.model_dump()
        password = user_data_dict.pop("password", None)

        new_user = User(**user_data_dict)
        new_user.password_hash = generate_passwd_hash(password)
        new_user.role = "admin"  # Ensure admin role

        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)

        return new_user

    async def authenticate_user(
        self, email: str, password: str, session: AsyncSession
    ) -> Dict[str, Any]:
        """Authenticate user and return tokens"""
        user = await self.get_user_by_email(email, session)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid email or password",
            )

        if not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid email or password",
            )

        # Generate tokens
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
            expiry=timedelta(days=self.REFRESH_TOKEN_EXPIRY),
        )

        return {
            "message": "Login Successful",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "email": user.email,
                "uid": str(user.id),
                "role": user.role,
                "artist_name": user.artist_name,
            },
        }
