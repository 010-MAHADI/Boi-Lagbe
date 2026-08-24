from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Favorite, Listing, User
from ..schemas import ListingOut, ListingImageOut
from ..auth import get_current_user
from ..r2 import build_public_url
from .listings import _listing_out

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.get("", response_model=List[ListingOut])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Listing)
        .options(
            selectinload(Listing.seller),
            selectinload(Listing.institute),
            selectinload(Listing.images),
        )
        .join(Favorite, Favorite.listing_id == Listing.id)
        .where(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
    )
    return [_listing_out(l) for l in result.scalars().all()]


@router.post("/{listing_id}", status_code=201)
async def add_favorite(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(Favorite).where(
            (Favorite.user_id == current_user.id) & (Favorite.listing_id == listing_id)
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "ইতোমধ্যে ফেভারিটে আছে"}

    db.add(Favorite(user_id=current_user.id, listing_id=listing_id))
    return {"message": "ফেভারিটে যোগ করা হয়েছে"}


@router.delete("/{listing_id}", status_code=204)
async def remove_favorite(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(Favorite).where(
            (Favorite.user_id == current_user.id) & (Favorite.listing_id == listing_id)
        )
    )


@router.get("/check/{listing_id}")
async def is_favorite(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Favorite).where(
            (Favorite.user_id == current_user.id) & (Favorite.listing_id == listing_id)
        )
    )
    return {"is_favorite": result.scalar_one_or_none() is not None}
