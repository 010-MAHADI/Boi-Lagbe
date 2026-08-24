"""
Reports router — §3.6 crowd-sourced sold detection + admin moderation queue.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Report, Listing, User
from ..schemas import ReportOut, ReportCreate, ReportResolve
from ..auth import get_current_user, require_admin

router = APIRouter(prefix="/reports", tags=["reports"])

AUTO_SOLD_THRESHOLD = 3


@router.post("", response_model=dict, status_code=201)
async def submit_report(
    payload: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Upsert — one report per (target_id, reporter_id, reason)
    existing = await db.execute(
        select(Report).where(
            (Report.target_id == payload.target_id)
            & (Report.reporter_id == current_user.id)
            & (Report.reason == payload.reason)
        )
    )
    report = existing.scalar_one_or_none()
    if report:
        return {"message": "আপনি ইতোমধ্যে এটি রিপোর্ট করেছেন", "auto_marked_sold": False}

    report = Report(
        target_type=payload.target_type,
        target_id=payload.target_id,
        reporter_id=current_user.id,
        reason=payload.reason,
        listing_id=payload.target_id if payload.target_type == "listing" else None,
        status="open",
    )
    db.add(report)
    await db.flush()

    auto_marked_sold = False

    # §3.6 — crowd-sourced sold detection
    if payload.target_type == "listing" and payload.reason == "already_sold":
        count_result = await db.execute(
            select(func.count(Report.id.distinct())).where(
                (Report.target_type == "listing")
                & (Report.target_id == payload.target_id)
                & (Report.reason == "already_sold")
            )
        )
        distinct_count = count_result.scalar_one()

        if distinct_count >= AUTO_SOLD_THRESHOLD:
            await db.execute(
                update(Listing)
                .where(
                    (Listing.id == payload.target_id)
                    & (Listing.status == "active")
                )
                .values(status="sold")
            )
            auto_marked_sold = True

    return {
        "message": "রিপোর্ট সফলভাবে জমা দেওয়া হয়েছে",
        "auto_marked_sold": auto_marked_sold,
    }


# ---------------------------------------------------------------------------
# Admin endpoints
# ---------------------------------------------------------------------------
@router.get("", response_model=List[ReportOut])
async def list_reports(
    status: str = "open",
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report)
        .where(Report.status == status)
        .order_by(Report.created_at.desc())
    )
    return [ReportOut.model_validate(r) for r in result.scalars().all()]


@router.patch("/{report_id}", response_model=ReportOut)
async def resolve_report(
    report_id: str,
    payload: ReportResolve,
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="রিপোর্ট পাওয়া যায়নি")
    report.status = payload.status
    db.add(report)
    return ReportOut.model_validate(report)
