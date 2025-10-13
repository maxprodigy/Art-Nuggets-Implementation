from sqlmodel.ext.asyncio.session import AsyncSession
from app.auth.schemas import UserCreateModel
from app.models.user import User
from sqlmodel import select
from .utils import generate_passwd_hash


class UserService:

    async def get_user_by_email(self, email: str, session: AsyncSession):
        statement = select(User).where(User.email == email)

        result = await session.exec(statement)

        user = result.first()

        return user

    async def user_exists(self, email: str, session: AsyncSession):

        user = await self.get_user_by_email(email, session)

        return True if user is not None else False

    async def create_regular_user(
        self, user_data: UserCreateModel, session: AsyncSession
    ):
        user_data_dict = user_data.model_dump()

        # Remove password from dict before creating User object
        password = user_data_dict.pop("password", None)

        new_user = User(**user_data_dict)

        new_user.password_hash = generate_passwd_hash(password)

        session.add(new_user)
        await session.commit()
        await session.refresh(
            new_user
        )  # Refresh to get the generated ID and timestamps

        return new_user

    async def create_admin_user(
        self, user_data: UserCreateModel, session: AsyncSession
    ):
        user_data_dict = user_data.model_dump()

        # Remove password from dict before creating User object
        password = user_data_dict.pop("password", None)

        new_user = User(**user_data_dict)

        new_user.password_hash = generate_passwd_hash(password)
        new_user.role = "admin"

        session.add(new_user)
        await session.commit()
        await session.refresh(
            new_user
        )  # Refresh to get the generated ID and timestamps

        return new_user
