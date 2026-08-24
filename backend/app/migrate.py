"""
One-shot migration: create all tables + enable pg_trgm extension.
Run:  python -m app.migrate
"""
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from .database import _build_engine_url
from .config import get_settings
from . import models  # noqa: F401 — registers all ORM models on Base.metadata
from .database import Base

settings = get_settings()


async def _exec_ddl(engine, sql: str, label: str):
    """Execute a single DDL statement, ignoring errors (best-effort)."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text(sql))
            await conn.commit()
        print(f"✅ {label}")
    except Exception as e:
        print(f"⚠️  {label}: {e}")


async def migrate():
    url, connect_args = _build_engine_url(settings.DATABASE_URL)

    # Use AUTOCOMMIT for DDL — extensions and indexes must run outside transactions
    engine = create_async_engine(
        url,
        connect_args=connect_args,
        isolation_level="AUTOCOMMIT",
        echo=False,
    )

    async with engine.begin() as conn:
        # Each extension in its own statement
        for ext in ["pg_trgm", "unaccent"]:
            try:
                await conn.execute(text(f"CREATE EXTENSION IF NOT EXISTS {ext}"))
                print(f"✅ Extension {ext} enabled")
            except Exception as e:
                print(f"⚠️  Extension {ext}: {e}")

    # Create all tables (uses a separate transactional engine)
    transactional_engine = create_async_engine(url, connect_args=connect_args, echo=False)
    async with transactional_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables created")
    await transactional_engine.dispose()

    # Search indexes — each individually so one failure doesn't abort the rest
    indexes = [
        (
            "listings_title_trgm_idx",
            "CREATE INDEX IF NOT EXISTS listings_title_trgm_idx ON listings USING GIN (title gin_trgm_ops)",
        ),
        (
            "listings_search_idx",
            """CREATE INDEX IF NOT EXISTS listings_search_idx ON listings USING GIN (
                to_tsvector('simple',
                    coalesce(title,'') || ' ' ||
                    coalesce(description_bn,'') || ' ' ||
                    coalesce(description_en,'')
                )
            )""",
        ),
        (
            "listings_slug_idx",
            "CREATE UNIQUE INDEX IF NOT EXISTS listings_slug_idx ON listings (slug) WHERE slug IS NOT NULL",
        ),
    ]

    for label, sql in indexes:
        await _exec_ddl(engine, sql, f"Index {label}")

    # Add slug column to existing databases (idempotent)
    await _exec_ddl(
        engine,
        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS slug VARCHAR(200)",
        "Column listings.slug",
    )

    # Back-fill slugs for any existing rows that don't have one yet.
    # Python-side generation is simpler than a pure-SQL version here.
    backfill_sql = """
        UPDATE listings
        SET slug = regexp_replace(
                       lower(translate(title, '০১২৩৪৫৬৭৮৯', '0123456789')),
                       '[^a-z0-9]+', '-', 'g'
                   ) || '-' || substring(id, 1, 6)
        WHERE slug IS NULL
    """
    await _exec_ddl(engine, backfill_sql, "Back-fill slugs")

    await engine.dispose()
    print("\n🎉 Migration complete!")


if __name__ == "__main__":
    asyncio.run(migrate())
