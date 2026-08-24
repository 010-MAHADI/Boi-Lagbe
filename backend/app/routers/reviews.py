from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Review, User
from ..schemas import ReviewOut, ReviewCreate
from ..auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/user/{user_id}", response_model=List[ReviewOut])
async def get_user_reviews(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Review)
        .options()
        .where(Review.reviewed_user_id == user_id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()
    # Fetch reviewer names
    out = []
    for r in reviews:
        reviewer_result = await db.execute(select(User).where(User.id == r.reviewer_id))
        reviewer = reviewer_result.scalar_one_or_none()
        out.append(ReviewOut(
            id=r.id,
            reviewed_user_id=r.reviewed_user_id,
            reviewer_id=r.reviewer_id,
            reviewer_name=reviewer.name if reviewer else None,
            listing_id=r.listing_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
        ))
    return out


@router.post("", response_model=ReviewOut, status_code=201)
async def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Prevent duplicate review for same listing
    existing = await db.execute(
        select(Review).where(
            (Review.reviewer_id == current_user.id)
            & (Review.listing_id == payload.listing_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="আপনি এই বিজ্ঞাপনে ইতোমধ্যে রিভিউ দিয়েছেন")

    if payload.reviewed_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="নিজেকে রিভিউ দেওয়া যাবে না")

    review = Review(
        reviewed_user_id=payload.reviewed_user_id,
        reviewer_id=current_user.id,
        listing_id=payload.listing_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    await db.flush()

    # Recalculate user rating
    avg_result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.reviewed_user_id == payload.reviewed_user_id)
    )
    avg, count = avg_result.one()
    await db.execute(
        update(User)
        .where(User.id == payload.reviewed_user_id)
        .values(rating_avg=float(avg or 0), rating_count=int(count or 0))
    )

    return ReviewOut(
        id=review.id,
        reviewed_user_id=review.reviewed_user_id,
        reviewer_id=review.reviewer_id,
        reviewer_name=current_user.name,
        listing_id=review.listing_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )
