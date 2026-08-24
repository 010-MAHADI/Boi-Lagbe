"""
Chat router — conversations and polling-based messages (§5 note: no WebSockets on Vercel free tier).
"""
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Conversation, Message, Listing, ListingImage, User, PriceOffer
from ..schemas import (
    ConversationOut, MessageOut, MessageSendRequest,
    PriceOfferOut, PriceOfferCreate, UserOut,
)
from ..auth import get_current_user
from ..r2 import build_public_url

router = APIRouter(prefix="/chat", tags=["chat"])


async def _build_conv_out(
    conv: Conversation,
    current_user_id: str,
    db: AsyncSession,
) -> ConversationOut:
    # Load listing separately (no relationship on model)
    listing_title: Optional[str] = None
    listing_image_url: Optional[str] = None

    listing_result = await db.execute(
        select(Listing).where(Listing.id == conv.listing_id)
    )
    listing = listing_result.scalar_one_or_none()
    if listing:
        listing_title = listing.title
        img_result = await db.execute(
            select(ListingImage)
            .where(ListingImage.listing_id == listing.id)
            .order_by(ListingImage.sort_order)
            .limit(1)
        )
        first_img = img_result.scalar_one_or_none()
        if first_img:
            listing_image_url = build_public_url(first_img.r2_key)

    # Unread count
    unread_result = await db.execute(
        select(Message)
        .where(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user_id,
            Message.read_at == None,  # noqa: E711
        )
    )
    unread = len(unread_result.scalars().all())

    # Other user
    other_user_id = conv.seller_id if conv.buyer_id == current_user_id else conv.buyer_id
    other_result = await db.execute(select(User).where(User.id == other_user_id))
    other_user = other_result.scalar_one_or_none()

    return ConversationOut(
        id=conv.id,
        listing_id=conv.listing_id,
        buyer_id=conv.buyer_id,
        seller_id=conv.seller_id,
        listing_title=listing_title,
        listing_image_url=listing_image_url,
        last_message=conv.last_message,
        last_message_at=conv.last_message_at,
        unread_count=unread,
        other_user=UserOut.model_validate(other_user) if other_user else None,
        created_at=conv.created_at,
    )


# ---------------------------------------------------------------------------
# GET /chat/conversations
# ---------------------------------------------------------------------------
@router.get("/conversations", response_model=List[ConversationOut])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(
            (Conversation.buyer_id == current_user.id)
            | (Conversation.seller_id == current_user.id)
        )
        .order_by(Conversation.last_message_at.desc().nullslast())
    )
    convs = result.scalars().all()
    out = []
    for c in convs:
        out.append(await _build_conv_out(c, current_user.id, db))
    return out


# ---------------------------------------------------------------------------
# POST /chat/conversations  — start or find existing
# ---------------------------------------------------------------------------
@router.post("/conversations", response_model=ConversationOut, status_code=201)
async def start_conversation(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Listing).where(Listing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="বিজ্ঞাপনটি পাওয়া যায়নি")
    if listing.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="নিজের বিজ্ঞাপনে চ্যাট করা যাবে না")

    existing = await db.execute(
        select(Conversation).where(
            (Conversation.listing_id == listing_id)
            & (Conversation.buyer_id == current_user.id)
        )
    )
    conv = existing.scalar_one_or_none()
    if not conv:
        conv = Conversation(
            listing_id=listing_id,
            buyer_id=current_user.id,
            seller_id=listing.seller_id,
        )
        db.add(conv)
        await db.flush()

    return await _build_conv_out(conv, current_user.id, db)


# ---------------------------------------------------------------------------
# GET /chat/conversations/:id/messages  — polling endpoint
# ---------------------------------------------------------------------------
@router.get("/conversations/{conv_id}/messages", response_model=List[MessageOut])
async def get_messages(
    conv_id: str,
    after: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="কথোপকথনটি পাওয়া যায়নি")
    if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="এই কথোপকথনে অ্যাক্সেস নেই")

    stmt = select(Message).where(Message.conversation_id == conv_id)
    if after:
        try:
            after_dt = datetime.fromisoformat(after.replace("Z", "+00:00"))
            stmt = stmt.where(Message.created_at > after_dt)
        except ValueError:
            pass
    stmt = stmt.order_by(Message.created_at.asc())

    result = await db.execute(stmt)
    messages = result.scalars().all()

    # Mark as read
    now = datetime.utcnow()
    await db.execute(
        update(Message)
        .where(
            Message.conversation_id == conv_id,
            Message.sender_id != current_user.id,
            Message.read_at == None,  # noqa: E711
        )
        .values(read_at=now)
    )

    return [MessageOut.model_validate(m) for m in messages]


# ---------------------------------------------------------------------------
# POST /chat/conversations/:id/messages
# ---------------------------------------------------------------------------
@router.post("/conversations/{conv_id}/messages", response_model=MessageOut, status_code=201)
async def send_message(
    conv_id: str,
    payload: MessageSendRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="কথোপকথনটি পাওয়া যায়নি")
    if conv.buyer_id != current_user.id and conv.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="এই কথোপকথনে অ্যাক্সেস নেই")

    now = datetime.utcnow()
    msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=payload.content,
        is_offer=payload.is_offer,
        offer_amount=payload.offer_amount,
        created_at=now,
    )
    db.add(msg)

    conv.last_message = payload.content[:200]
    conv.last_message_at = now
    db.add(conv)

    # Upsert PriceOffer if this is an offer message
    if payload.is_offer and payload.offer_amount:
        existing = await db.execute(
            select(PriceOffer).where(
                PriceOffer.listing_id == conv.listing_id,
                PriceOffer.buyer_id == current_user.id,
            )
        )
        offer = existing.scalar_one_or_none()
        if offer:
            offer.offered_price = payload.offer_amount
            offer.created_at = now
            db.add(offer)
        else:
            db.add(PriceOffer(
                listing_id=conv.listing_id,
                buyer_id=current_user.id,
                offered_price=payload.offer_amount,
                created_at=now,
            ))

    await db.flush()
    return MessageOut.model_validate(msg)


# ---------------------------------------------------------------------------
# GET /chat/listings/:listing_id/offers  — public price offer feed (§3.5)
# ---------------------------------------------------------------------------
@router.get("/listings/{listing_id}/offers", response_model=List[PriceOfferOut])
async def get_price_offers(
    listing_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PriceOffer)
        .where(PriceOffer.listing_id == listing_id)
        .order_by(PriceOffer.created_at.desc())
        .limit(20)
    )
    return [PriceOfferOut.model_validate(o) for o in result.scalars().all()]
