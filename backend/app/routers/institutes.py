from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Institute, User
from ..schemas import InstituteOut, InstituteCreateRequest
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/institutes", tags=["institutes"])


@router.get("", response_model=List[InstituteOut])
async def list_institutes(
    q: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    verified_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Institute)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Institute.name.ilike(pattern),
                Institute.name_en.ilike(pattern),
            )
        )
    if type:
        stmt = stmt.where(Institute.type == type)
    if verified_only:
        stmt = stmt.where(Institute.verified == True)

    stmt = stmt.order_by(Institute.verified.desc(), Institute.name)
    result = await db.execute(stmt)
    return [InstituteOut.model_validate(i) for i in result.scalars().all()]


@router.post("", response_model=InstituteOut, status_code=201)
async def create_institute(
    payload: InstituteCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    institute = Institute(
        **payload.model_dump(),
        created_by=current_user.id,
        verified=False,  # always pending approval unless set by admin
    )
    db.add(institute)
    await db.flush()
    return InstituteOut.model_validate(institute)


@router.post("/{institute_id}/approve", response_model=InstituteOut)
async def approve_institute(
    institute_id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Institute).where(Institute.id == institute_id))
    institute = result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="ইনস্টিটিউট পাওয়া যায়নি")
    institute.verified = True
    db.add(institute)
    return InstituteOut.model_validate(institute)


@router.delete("/{institute_id}", status_code=204)
async def delete_institute(
    institute_id: str,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Institute).where(Institute.id == institute_id))
    institute = result.scalar_one_or_none()
    if not institute:
        raise HTTPException(status_code=404, detail="ইনস্টিটিউট পাওয়া যায়নি")
    await db.delete(institute)
