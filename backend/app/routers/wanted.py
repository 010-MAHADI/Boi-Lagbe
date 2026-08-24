from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import WantedPost, WantedOffer, User, Institute
from ..schemas import WantedPostOut, WantedPostCreate, WantedOfferOut, WantedOfferCreate
from ..auth import get_current_user

router = APIRouter(prefix="/wanted", tags=["wanted"])


def _wanted_out(post: WantedPost) -> WantedPostOut:
    inst_name = None
    if post.institute_id:
        # institute may be loaded via selectinload
        pass
    return WantedPostOut(
        id=post.id,
        user_id=post.user_id,
        user_name=post.user.name if hasattr(post, "user") and post.user else None,
        title=post.title,
        institute_id=post.institute_id,
        institute_name=(
            post.institute.name if hasattr(post, "institute") and post.institute else None
        ),
        level_label=post.level_label,
        description=post.description,
        fulfilled=post.fulfilled,
        created_at=post.created_at,
    )


@router.get("", response_model=List[WantedPostOut])
async def list_wanted(
    fulfilled: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WantedPost)
        .options(
            selectinload(WantedPost.user),
            selectinload(WantedPost.institute),
        )
        .where(WantedPost.fulfilled == fulfilled)
        .order_by(WantedPost.created_at.desc())
    )
    return [_wanted_out(p) for p in result.scalars().all()]


@router.post("", response_model=WantedPostOut, status_code=201)
async def create_wanted(
    payload: WantedPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = WantedPost(
        user_id=current_user.id,
        title=payload.title,
        institute_id=payload.institute_id or None,
        level_label=payload.level_label,
        description=payload.description,
    )
    db.add(post)
    await db.flush()
    # Reload
    result = await db.execute(
        select(WantedPost)
        .options(selectinload(WantedPost.user), selectinload(WantedPost.institute))
        .where(WantedPost.id == post.id)
    )
    return _wanted_out(result.scalar_one())


@router.post("/{post_id}/fulfill", response_model=WantedPostOut)
async def fulfill_wanted(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WantedPost)
        .options(selectinload(WantedPost.user), selectinload(WantedPost.institute))
        .where(WantedPost.id == post_id)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="পোস্টটি পাওয়া যায়নি")
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="এই পোস্ট পরিবর্তন করার অনুমতি নেই")
    post.fulfilled = True
    db.add(post)
    return _wanted_out(post)


@router.delete("/{post_id}", status_code=204)
async def delete_wanted(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WantedPost).where(WantedPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="পোস্টটি পাওয়া যায়নি")
    if post.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="এই পোস্ট মুছে দেওয়ার অনুমতি নেই")
    await db.delete(post)


@router.get("/{post_id}/offers", response_model=List[WantedOfferOut])
async def get_wanted_offers(
    post_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WantedOffer)
        .options(selectinload(WantedOffer.seller))
        .where(WantedOffer.wanted_id == post_id)
        .order_by(WantedOffer.created_at.desc())
    )
    offers = result.scalars().all()
    return [
        WantedOfferOut(
            id=o.id,
            wanted_id=o.wanted_id,
            seller_id=o.seller_id,
            seller_name=o.seller.name if o.seller else None,
            condition=o.condition,
            price=o.price,
            location=o.location,
            description=o.description,
            created_at=o.created_at,
        )
        for o in offers
    ]


@router.post("/{post_id}/offers", response_model=WantedOfferOut, status_code=201)
async def submit_wanted_offer(
    post_id: str,
    payload: WantedOfferCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(WantedPost).where(WantedPost.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="পোস্টটি পাওয়া যায়নি")

    offer = WantedOffer(
        wanted_id=post_id,
        seller_id=current_user.id,
        condition=payload.condition,
        price=payload.price,
        location=payload.location,
        description=payload.description,
    )
    db.add(offer)
    await db.flush()
    return WantedOfferOut(
        id=offer.id,
        wanted_id=offer.wanted_id,
        seller_id=offer.seller_id,
        seller_name=current_user.name,
        condition=offer.condition,
        price=offer.price,
        location=offer.location,
        description=offer.description,
        created_at=offer.created_at,
    )
