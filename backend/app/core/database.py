from sqlmodel import create_engine, text, SQLModel
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from app.core.config import settings as Config
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker


async_engine = create_async_engine(
    url=Config.DATABASE_URL,
    echo=True,
    pool_size=2,
    max_overflow=2,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_timeout=30,
    connect_args={
        "prepared_statement_cache_size": 0,
        "statement_cache_size": 0,
        # Add server settings for pooler
        "server_settings": {"application_name": "art_nuggets_backend"},
    },
)


async def init_db():
    async with async_engine.begin() as conn:

        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:  # type: ignore

    Session = sessionmaker(
        bind=async_engine, class_=AsyncSession, expire_on_commit=False
    )

    # async with Session() as session:
    #     yield session

    async with Session() as session:
        try:
            yield session
        finally:
            await session.close()
