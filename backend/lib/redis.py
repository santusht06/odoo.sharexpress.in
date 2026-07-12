from redis import Redis
from redis.asyncio import Redis as AsyncRedis
from core.config import REDIS_PORT, REDIS_HOST


Redis_client = Redis(
    host=REDIS_HOST,
    port=int(REDIS_PORT),
    decode_responses=True,
)

async_redis_client = AsyncRedis(
    host=REDIS_HOST,
    port=int(REDIS_PORT),
    decode_responses=True,
)
