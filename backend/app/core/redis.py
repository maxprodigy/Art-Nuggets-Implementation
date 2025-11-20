import re
import redis.asyncio as redis
from app.core.config import settings as Config


JTI_EXPIRY = 18000  # 5 hours in seconds

# Create Redis connection with password support
redis_kwargs = {"host": Config.REDIS_HOST, "port": Config.REDIS_PORT, "db": 0}

if Config.REDIS_PASSWORD:
    redis_kwargs["password"] = Config.REDIS_PASSWORD

token_blocklist = redis.StrictRedis(**redis_kwargs)


async def add_jti_to_blocklist(jti: str) -> None:
    await token_blocklist.set(name=jti, value="", ex=JTI_EXPIRY)


async def token_in_blocklist(jti: str) -> bool:
    jti = await token_blocklist.get(jti)

    return jti is not None
