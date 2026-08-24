"""
Boi Lagbe (বই লাগবে) — FastAPI backend entry point.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .routers import auth, institutes, listings, upload, chat, wanted, reviews, reports, favorites, admin

settings = get_settings()

ALLOWED_ORIGINS = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "https://boilagbe.vercel.app",
    "https://boi-lagbe.vercel.app",
    "https://boilagbe.site",
]

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
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://boilagbe.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global error handler — ensures CORS headers are present even on 500s
# Without this, FastAPI's default error responses omit CORS headers and the
# browser reports a CORS error instead of the real server error.
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    import re
    allowed = (
        origin in ALLOWED_ORIGINS
        or bool(re.match(r"https://boilagbe.*\.vercel\.app", origin))
    )
    headers = {}
    if allowed:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers=headers,
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
