"""
One-shot migration: create all tables + enable pg_trgm and postgis extensions.
Run:  python -m app.migrate
"""
import asyncio
from sqlalchemy import text
from .database import engine, Base
from . import models  # noqa: F401 — import so metadata is populated


EXTENSIONS_SQL = """
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
"""

SEARCH_INDEXES_SQL = """
-- Trigram index for typo-tolerant title search (§8)
CREATE INDEX IF NOT EXISTS listings_title_trgm_idx
    ON listings USING GIN (title gin_trgm_ops);

-- Full-text index over title + descriptions
CREATE INDEX IF NOT EXISTS listings_search_idx
    ON listings USING GIN (
        to_tsvector('simple',
            coalesce(title,'') || ' ' ||
            coalesce(description_bn,'') || ' ' ||
            coalesce(description_en,'')
        )
    );
"""


async def migrate():
    async with engine.begin() as conn:
        # Enable extensions (requires superuser in Neon — run once via Neon SQL editor if this fails)
        try:
            await conn.execute(text(EXTENSIONS_SQL))
            print("✅ Extensions enabled")
        except Exception as e:
            print(f"⚠️  Extensions: {e} (run manually in Neon SQL editor if needed)")

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created")

        # Add search indexes
        try:
            await conn.execute(text(SEARCH_INDEXES_SQL))
            print("✅ Search indexes created")
        except Exception as e:
            print(f"⚠️  Search indexes: {e}")

    print("\n🎉 Migration complete!")


if __name__ == "__main__":
    asyncio.run(migrate())
