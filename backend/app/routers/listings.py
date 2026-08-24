"""
Listings router — CRUD + advanced search (full-text + trigram + geo distance).
"""
import math
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, or_, text, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Listing, ListingImage, User, Institute
from ..schemas import (
    ListingOut, ListingImageOut, ListingCreateRequest, ListingUpdateRequest,
    PaginatedResponse,
)
from ..auth import get_current_user, get_optional_user, require_admin
from ..r2 import build_public_url

router = APIRouter(prefix="/listings", tags=["listings"])

AUTO_SOLD_THRESHOLD = 3   # §3.6 — distinct "already_sold" reports


def _image_out(img: ListingImage) -> ListingImageOut:
    return ListingImageOut(
        id=img.id,
        listing_id=img.listing_id,
        r2_key=img.r2_key,
        url=build_public_url(img.r2_key),
        sort_order=img.sort_order,
    )


def _listing_out(listing: Listing, distance_m: Optional[float] = None) -> ListingOut:
    # Build images manually — the ORM model has no `url` column, only `r2_key`,
    # so Pydantic's model_validate would fail on ListingImageOut.url.
    images = [_image_out(i) for i in listing.images]

    out = ListingOut(
        id=listing.id,
        seller_id=listing.seller_id,
        seller=listing.seller,
        category_slug=listing.category_slug,
        institute_id=listing.institute_id,
        institute=listing.institute,
        title=listing.title,
        author=listing.author,
        description_bn=listing.description_bn,
        description_en=listing.description_en,
        condition=listing.condition,
        level_label=listing.level_label,
        price=listing.price,
        negotiable=listing.negotiable,
        quantity=listing.quantity,
        status=listing.status,
        contact_preference=listing.contact_preference,
        whatsapp_number=listing.whatsapp_number,
        lat=listing.lat,
        lng=listing.lng,
        images=images,
        view_count=listing.view_count,
        created_at=listing.created_at,
        distance_m=distance_m,
    )
    return out


# ---------------------------------------------------------------------------
# GET /listings  — search & browse
# ---------------------------------------------------------------------------
@router.get("", response_model=PaginatedResponse)
async def search_listings(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    institute_type: Optional[str] = Query(None),
    institute_id: Optional[str] = Query(None),
    level_label: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    min_price: Optional[int] = Query(None),
    max_price: Optional[int] = Query(None),
    division: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    sort_by: str = Query("newest"),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query("active"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    stmt = (
        select(Listing)
        .options(
            selectinload(Listing.seller),
            selectinload(Listing.institute),
            selectinload(Listing.images),
        )
        .where(Listing.status == status)
    )

    # --- filters ---
    if category:
        stmt = stmt.where(Listing.category_slug == category)
    if institute_id:
        stmt = stmt.where(Listing.institute_id == institute_id)
    if institute_type:
        stmt = stmt.join(Institute, Listing.institute_id == Institute.id).where(
            Institute.type == institute_type
        )
    if level_label:
        stmt = stmt.where(Listing.level_label == level_label)
    if condition:
        stmt = stmt.where(Listing.condition == condition)
    if min_price is not None:
        stmt = stmt.where(Listing.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price <= max_price)
    if division:
        # Only add join if institute_type filter didn't already join
        if not institute_type:
            stmt = stmt.join(Institute, Listing.institute_id == Institute.id, isouter=True)
        stmt = stmt.where(
            or_(Institute.division == division, Listing.institute_id == None)
        )

    # --- full-text + trigram search (§8) ---
    # Use ILIKE only — similarity() requires pg_trgm loaded in the session
    # which is not guaranteed on Vercel serverless cold starts
    if q:
        pattern = f"%{q}%"
        stmt = stmt.where(
            or_(
                Listing.title.ilike(pattern),
                Listing.description_bn.ilike(pattern),
                Listing.description_en.ilike(pattern),
            )
        )

    # --- sorting ---
    if sort_by == "newest":
        stmt = stmt.order_by(Listing.created_at.desc())
    elif sort_by == "price_low":
        stmt = stmt.order_by(Listing.price.asc())
    elif sort_by == "price_high":
        stmt = stmt.order_by(Listing.price.desc())
    elif sort_by == "nearest" and lat is not None and lng is not None:
        # Haversine-approximate sort via computed column
        stmt = stmt.order_by(
            func.sqrt(
                func.pow(Listing.lat - lat, 2) + func.pow(Listing.lng - lng, 2)
            ).asc()
        )
    else:
        stmt = stmt.order_by(Listing.created_at.desc())

    # --- count + paginate ---
    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    listings = result.scalars().all()

    items = []
    for l in listings:
        distance_m: Optional[float] = None
        if lat is not None and lng is not None:
            # Simple Euclidean approximation in km
            dlat = (l.lat - lat) * 111.0
            dlng = (l.lng - lng) * 111.0 * math.cos(math.radians(lat))
            distance_m = math.sqrt(dlat**2 + dlng**2) * 1000
        items.append(_listing_out(l, distance_m))

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        has_next=(page * page_size) < total,
    )


# ---------------------------------------------------------------------------
# GET /listings/:id
# ---------------------------------------------------------------------------
@router.get("/{listing_id}", response_model=ListingOut)
async def get_listing(
    listing_id: str,
    db: AsyncSession = Depends(get_db),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    current_user: Optional[User] = Depends(get_optional_user),
):
    result = await db.execute(
        select(Listing)
        .options(
            selectinload(Listing.seller),
            selectinload(Listing.institute),
            selectinload(Listing.images),
        )
        .where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="বিজ্ঞাপনটি পাওয়া যায়নি")

    # Increment view count (fire-and-forget style)
    await db.execute(
        update(Listing).where(Listing.id == listing_id).values(view_count=Listing.view_count + 1)
    )

    distance_m = None
    if lat is not None and lng is not None:
        dlat = (listing.lat - lat) * 111.0
        dlng = (listing.lng - lng) * 111.0 * math.cos(math.radians(lat))
        distance_m = math.sqrt(dlat**2 + dlng**2) * 1000

    return _listing_out(listing, distance_m)


# ---------------------------------------------------------------------------
# POST /listings
# ---------------------------------------------------------------------------
@router.post("", response_model=ListingOut, status_code=201)
async def create_listing(
    payload: ListingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = Listing(
        seller_id=current_user.id,
        category_slug=payload.category_slug,
        institute_id=payload.institute_id or None,
        title=payload.title,
        author=payload.author,
        description_bn=payload.description_bn,
        description_en=payload.description_en,
        condition=payload.condition,
        level_label=payload.level_label,
        price=payload.price,
        negotiable=payload.negotiable,
        quantity=payload.quantity,
        contact_preference=payload.contact_preference,
        whatsapp_number=payload.whatsapp_number,
        lat=payload.lat,
        lng=payload.lng,
        status="active",
        view_count=0,
    )
    db.add(listing)
    await db.flush()  # get listing.id

    for i, key in enumerate(payload.image_keys):
        db.add(ListingImage(listing_id=listing.id, r2_key=key, sort_order=i))

    await db.flush()

    # Reload with relationships
    result = await db.execute(
        select(Listing)
        .options(
            selectinload(Listing.seller),
            selectinload(Listing.institute),
            selectinload(Listing.images),
        )
        .where(Listing.id == listing.id)
    )
    listing = result.scalar_one()
    return _listing_out(listing)


# ---------------------------------------------------------------------------
# PATCH /listings/:id
# ---------------------------------------------------------------------------
@router.patch("/{listing_id}", response_model=ListingOut)
async def update_listing(
    listing_id: str,
    payload: ListingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.seller), selectinload(Listing.institute), selectinload(Listing.images))
        .where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="বিজ্ঞাপনটি পাওয়া যায়নি")
    if listing.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="এই বিজ্ঞাপন পরিবর্তন করার অনুমতি নেই")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(listing, field, value)

    db.add(listing)
    return _listing_out(listing)


# ---------------------------------------------------------------------------
# DELETE /listings/:id
# ---------------------------------------------------------------------------
@router.delete("/{listing_id}", status_code=204)
async def delete_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="বিজ্ঞাপনটি পাওয়া যায়নি")
    if listing.seller_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="এই বিজ্ঞাপন মুছে দেওয়ার অনুমতি নেই")
    await db.delete(listing)


# ---------------------------------------------------------------------------
# GET /listings/user/:user_id  — listings by a specific seller
# ---------------------------------------------------------------------------
@router.get("/user/{user_id}", response_model=List[ListingOut])
async def get_user_listings(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.seller), selectinload(Listing.institute), selectinload(Listing.images))
        .where(Listing.seller_id == user_id)
        .order_by(Listing.created_at.desc())
    )
    return [_listing_out(l) for l in result.scalars().all()]
