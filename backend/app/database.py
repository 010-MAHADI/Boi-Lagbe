from urllib.parse import urlparse, urlunparse, parse_qs, urlencode
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from .config import get_settings

settings = get_settings()


def _build_engine_url(raw: str) -> tuple[str, dict]:
    """
    asyncpg does not accept ?sslmode= as a query parameter.
    Strip it from the URL and return ssl connect_args instead.
    Also strips channel_binding which older asyncpg versions don't support
    (Vercel bundles a vendored asyncpg that predates that parameter).
    """
    # Normalise scheme
    if raw.startswith("postgres://"):
        raw = raw.replace("postgres://", "postgresql+asyncpg://", 1)
    elif raw.startswith("postgresql://"):
        raw = raw.replace("postgresql://", "postgresql+asyncpg://", 1)

    parsed = urlparse(raw)
    params = parse_qs(parsed.query, keep_blank_values=True)

    # Pull out sslmode — asyncpg doesn't understand it
    sslmode = params.pop("sslmode", [""])[0]

    # Remove channel_binding if present (older asyncpg versions don't support it)
    params.pop("channel_binding", None)

    # Rebuild URL without sslmode and channel_binding
    clean_query = urlencode({k: v[0] for k, v in params.items()})
    clean_url = urlunparse(parsed._replace(query=clean_query))

    # Map sslmode → asyncpg ssl kwarg
    connect_args: dict = {}
    if sslmode in ("require", "verify-ca", "verify-full"):
        connect_args["ssl"] = "require"
    elif sslmode == "prefer":
        connect_args["ssl"] = "prefer"
    # disable / allow → no ssl kwarg needed

    return clean_url, connect_args


_db_url, _connect_args = _build_engine_url(settings.DATABASE_URL)

# NullPool is required for Vercel serverless — each function invocation is
# stateless and short-lived so SQLAlchemy's connection pool cannot maintain
# persistent connections across invocations, causing 500s on cold starts.
engine = create_async_engine(
    _db_url,
    echo=settings.ENVIRONMENT == "development",
    poolclass=NullPool,
    connect_args=_connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:  # type: ignore[return]
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
