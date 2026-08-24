"""
SQLAlchemy ORM models — mirrors the schema from the build plan §7.
"""
import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey,
    Integer, String, Text, UniqueConstraint,
    text, Index,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def _now():
    return datetime.utcnow()


def _uuid():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# institutes
# ---------------------------------------------------------------------------
class Institute(Base):
    __tablename__ = "institutes"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(
        Enum("school", "college", "polytechnic", "university", "madrasah", "coaching",
             name="institute_type"),
        nullable=False,
    )
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    division: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_by: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    listings: Mapped[List["Listing"]] = relationship("Listing", back_populates="institute")


# ---------------------------------------------------------------------------
# users
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, unique=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    institute_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("institutes.id", ondelete="SET NULL"), nullable=True
    )
    role: Mapped[str] = mapped_column(String(20), default="user", nullable=False)
    rating_avg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    listings: Mapped[List["Listing"]] = relationship("Listing", back_populates="seller")
    conversations_as_buyer: Mapped[List["Conversation"]] = relationship(
        "Conversation", foreign_keys="Conversation.buyer_id", back_populates="buyer"
    )
    conversations_as_seller: Mapped[List["Conversation"]] = relationship(
        "Conversation", foreign_keys="Conversation.seller_id", back_populates="seller"
    )


# ---------------------------------------------------------------------------
# listings
# ---------------------------------------------------------------------------
class Listing(Base):
    __tablename__ = "listings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    seller_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category_slug: Mapped[str] = mapped_column(
        Enum("academic_book", "general_book", "notes_suggestion", name="category_slug"),
        nullable=False,
    )
    institute_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("institutes.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    description_bn: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    condition: Mapped[str] = mapped_column(
        Enum("new", "like_new", "good", "fair", name="book_condition"),
        nullable=False,
    )
    level_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    negotiable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("active", "sold", name="listing_status"),
        default="active",
        nullable=False,
        index=True,
    )
    contact_preference: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False)
    whatsapp_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now, index=True)

    seller: Mapped["User"] = relationship("User", back_populates="listings")
    institute: Mapped[Optional["Institute"]] = relationship("Institute", back_populates="listings")
    images: Mapped[List["ListingImage"]] = relationship(
        "ListingImage", back_populates="listing", order_by="ListingImage.sort_order",
        cascade="all, delete-orphan"
    )
    price_offers: Mapped[List["PriceOffer"]] = relationship(
        "PriceOffer", back_populates="listing", cascade="all, delete-orphan"
    )
    reports: Mapped[List["Report"]] = relationship(
        "Report", back_populates="listing", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("listings_seller_status_idx", "seller_id", "status"),
        Index("listings_location_idx", "lat", "lng"),
        Index("listings_created_idx", "created_at"),
    )


# ---------------------------------------------------------------------------
# listing_images
# ---------------------------------------------------------------------------
class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    listing_id: Mapped[str] = mapped_column(
        String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    r2_key: Mapped[str] = mapped_column(String(500), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    listing: Mapped["Listing"] = relationship("Listing", back_populates="images")


# ---------------------------------------------------------------------------
# conversations
# ---------------------------------------------------------------------------
class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    listing_id: Mapped[str] = mapped_column(
        String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    buyer_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    seller_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    last_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    buyer: Mapped["User"] = relationship(
        "User", foreign_keys=[buyer_id], back_populates="conversations_as_buyer"
    )
    seller: Mapped["User"] = relationship(
        "User", foreign_keys=[seller_id], back_populates="conversations_as_seller"
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan",
        order_by="Message.created_at"
    )

    __table_args__ = (
        UniqueConstraint("listing_id", "buyer_id", name="uq_conv_listing_buyer"),
    )


# ---------------------------------------------------------------------------
# messages
# ---------------------------------------------------------------------------
class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    conversation_id: Mapped[str] = mapped_column(
        String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_offer: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    offer_amount: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now, index=True)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")


# ---------------------------------------------------------------------------
# price_offers
# ---------------------------------------------------------------------------
class PriceOffer(Base):
    __tablename__ = "price_offers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    listing_id: Mapped[str] = mapped_column(
        String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    buyer_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    offered_price: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    listing: Mapped["Listing"] = relationship("Listing", back_populates="price_offers")

    __table_args__ = (
        UniqueConstraint("listing_id", "buyer_id", name="uq_offer_listing_buyer"),
    )


# ---------------------------------------------------------------------------
# wanted_posts
# ---------------------------------------------------------------------------
class WantedPost(Base):
    __tablename__ = "wanted_posts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    institute_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("institutes.id", ondelete="SET NULL"), nullable=True
    )
    level_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fulfilled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    wanted_offers: Mapped[List["WantedOffer"]] = relationship(
        "WantedOffer", back_populates="wanted_post", cascade="all, delete-orphan"
    )


# ---------------------------------------------------------------------------
# wanted_offers
# ---------------------------------------------------------------------------
class WantedOffer(Base):
    __tablename__ = "wanted_offers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    wanted_id: Mapped[str] = mapped_column(
        String, ForeignKey("wanted_posts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    seller_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    condition: Mapped[str] = mapped_column(String(20), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    wanted_post: Mapped["WantedPost"] = relationship("WantedPost", back_populates="wanted_offers")


# ---------------------------------------------------------------------------
# favorites
# ---------------------------------------------------------------------------
class Favorite(Base):
    __tablename__ = "favorites"

    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    listing_id: Mapped[str] = mapped_column(
        String, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


# ---------------------------------------------------------------------------
# reviews
# ---------------------------------------------------------------------------
class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    reviewed_user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reviewer_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    listing_id: Mapped[str] = mapped_column(
        String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    __table_args__ = (
        UniqueConstraint("reviewer_id", "listing_id", name="uq_review_reviewer_listing"),
    )


# ---------------------------------------------------------------------------
# reports
# ---------------------------------------------------------------------------
class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    target_type: Mapped[str] = mapped_column(
        Enum("listing", "user", name="report_target_type"), nullable=False
    )
    target_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    reporter_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    listing_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("listings.id", ondelete="CASCADE"), nullable=True, index=True
    )
    reason: Mapped[str] = mapped_column(
        Enum("already_sold", "spam", "scam", "inappropriate", "other", name="report_reason"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum("open", "reviewed", "dismissed", name="report_status"),
        default="open",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    listing: Mapped[Optional["Listing"]] = relationship("Listing", back_populates="reports")

    __table_args__ = (
        UniqueConstraint("target_id", "reporter_id", "reason", name="uq_report_dedup"),
    )
