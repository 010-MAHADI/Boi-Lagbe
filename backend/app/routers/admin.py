"""
Admin router — user management, institute approval, stats.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User, Listing, Institute, Report
from ..schemas import UserOut
from ..auth import require_admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    users_count = (await db.execute(select(func.count(User.id)))).scalar_one()
    listings_count = (await db.execute(select(func.count(Listing.id)))).scalar_one()
    active_count = (
        await db.execute(select(func.count(Listing.id)).where(Listing.status == "active"))
    ).scalar_one()
    open_reports = (
        await db.execute(select(func.count(Report.id)).where(Report.status == "open"))
    ).scalar_one()
    pending_institutes = (
        await db.execute(select(func.count(Institute.id)).where(Institute.verified == False))
    ).scalar_one()

    return {
        "users": users_count,
        "total_listings": listings_count,
        "active_listings": active_count,
        "open_reports": open_reports,
        "pending_institutes": pending_institutes,
    }


@router.get("/users", response_model=List[UserOut])
async def list_users(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return [UserOut.model_validate(u) for u in result.scalars().all()]


@router.post("/users/{user_id}/block", response_model=UserOut)
async def block_user(
    user_id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="ব্যবহারকারী পাওয়া যায়নি")
    user.is_blocked = not user.is_blocked
    db.add(user)
    return UserOut.model_validate(user)


@router.post("/users/{user_id}/verify", response_model=UserOut)
async def verify_user(
    user_id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="ব্যবহারকারী পাওয়া যায়নি")
    user.is_verified = not user.is_verified
    db.add(user)
    return UserOut.model_validate(user)


@router.get("/institutes/pending")
async def pending_institutes(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Institute)
        .where(Institute.verified == False)
        .order_by(Institute.created_at.desc())
    )
    from ..schemas import InstituteOut
    return [InstituteOut.model_validate(i) for i in result.scalars().all()]
