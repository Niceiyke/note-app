import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
import os

async def test():
    url = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@note-app-db/notes_db")
    print(f"Testing connection to: {url}")
    engine = create_async_engine(url)
    try:
        async with engine.begin() as conn:
            print("Successfully connected to database!")
    except Exception as e:
        print(f"Failed to connect: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test())
