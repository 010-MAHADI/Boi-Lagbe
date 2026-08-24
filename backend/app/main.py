"""
Boi Lagbe (বই লাগবে) — FastAPI backend entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import auth, institutes, listings, upload, chat, wanted, reviews, reports, favorites, admin

settings = get_settings()

app = FastAPI(
    title="বই লাগবে API",
    description="Campus used-book marketplace — Boi Lagbe",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ---------------------------------------------------------------------------
# CORS — allow the Next.js frontend
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://boilagbe.vercel.app",
        "https://boi-lagbe.vercel.app",
        "https://boilagbe.site"
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
PREFIX = "/api"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(institutes.router, prefix=PREFIX)
app.include_router(listings.router, prefix=PREFIX)
app.include_router(upload.router, prefix=PREFIX)
app.include_router(chat.router, prefix=PREFIX)
app.include_router(wanted.router, prefix=PREFIX)
app.include_router(reviews.router, prefix=PREFIX)
app.include_router(reports.router, prefix=PREFIX)
app.include_router(favorites.router, prefix=PREFIX)
app.include_router(admin.router, prefix=PREFIX)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "বই লাগবে API"}
