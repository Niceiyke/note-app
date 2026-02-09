from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import notes
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    retries = 5
    while retries > 0:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            break
        except Exception as e:
            retries -= 1
            print(f"Database not ready, retrying in 2 seconds... ({retries} left)")
            await asyncio.sleep(2)
    else:
        print("Could not connect to database after retries.")
    yield

app = FastAPI(lifespan=lifespan, title="Note Taking API")

origins = [
    "http://localhost:5173",
    "https://note-app-web.wordlyte.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes.router, prefix="/api/notes", tags=["notes"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
