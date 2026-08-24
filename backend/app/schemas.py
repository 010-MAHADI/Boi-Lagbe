"""
Pydantic schemas — request/response models for all API endpoints.
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    institute_id: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------
class UserOut(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    institute_id: Optional[str] = None
    role: str = "user"
    rating_avg: float = 0.0
    rating_count: int = 0
    is_blocked: bool = False
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    institute_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Institute
# ---------------------------------------------------------------------------
class InstituteOut(BaseModel):
    id: str
    name: str
    name_en: str
    type: str
    district: str
    division: str
    lat: float
    lng: float
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class InstituteCreateRequest(BaseModel):
    name: str
    name_en: str
    type: str
    district: str
    division: str
    lat: float
    lng: float


# ---------------------------------------------------------------------------
# Listing Image
# ---------------------------------------------------------------------------
class ListingImageOut(BaseModel):
    id: str
    listing_id: str
    r2_key: str
    url: str          # full public URL, assembled by the API
    sort_order: int

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Listing
# ---------------------------------------------------------------------------
class ListingOut(BaseModel):
    id: str
    seller_id: str
    seller: Optional[UserOut] = None
    category_slug: str
    institute_id: Optional[str] = None
    institute: Optional[InstituteOut] = None
    title: str
    author: Optional[str] = None
    description_bn: Optional[str] = None
    description_en: Optional[str] = None
    condition: str
    level_label: Optional[str] = None
    price: int
    negotiable: bool
    quantity: int
    status: str
    contact_preference: List[str]
    whatsapp_number: Optional[str] = None
    lat: float
    lng: float
    images: List[ListingImageOut] = []
    view_count: int
    created_at: datetime
    distance_m: Optional[float] = None   # injected at query time

    class Config:
        from_attributes = True


class ListingCreateRequest(BaseModel):
    category_slug: str
    institute_id: Optional[str] = None
    title: str
    author: Optional[str] = None
    description_bn: Optional[str] = None
    description_en: Optional[str] = None
    condition: str
    level_label: Optional[str] = None
    price: int
    negotiable: bool = False
    quantity: int = 1
    contact_preference: List[str]
    whatsapp_number: Optional[str] = None
    lat: float
    lng: float
    # r2_keys returned from the presigned upload flow
    image_keys: List[str] = []


class ListingUpdateRequest(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description_bn: Optional[str] = None
    description_en: Optional[str] = None
    condition: Optional[str] = None
    price: Optional[int] = None
    negotiable: Optional[bool] = None
    quantity: Optional[int] = None
    status: Optional[str] = None


class ListingSearchParams(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    institute_type: Optional[str] = None
    institute_id: Optional[str] = None
    level_label: Optional[str] = None
    condition: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    division: Optional[str] = None
    district: Optional[str] = None
    sort_by: Optional[str] = "newest"
    lat: Optional[float] = None
    lng: Optional[float] = None
    page: int = 1
    page_size: int = 20


# ---------------------------------------------------------------------------
# Upload (presigned URL)
# ---------------------------------------------------------------------------
class PresignedUploadRequest(BaseModel):
    filename: str
    content_type: str = "image/jpeg"


class PresignedUploadResponse(BaseModel):
    upload_url: str   # PUT this URL
    r2_key: str       # pass back when creating/updating listing
    public_url: str   # final URL after upload completes


# ---------------------------------------------------------------------------
# Price Offer
# ---------------------------------------------------------------------------
class PriceOfferOut(BaseModel):
    id: str
    listing_id: str
    offered_price: int
    created_at: datetime
    # buyer details NOT included (shown anonymized per plan §3.5)

    class Config:
        from_attributes = True


class PriceOfferCreate(BaseModel):
    offered_price: int


# ---------------------------------------------------------------------------
# Conversation & Messages
# ---------------------------------------------------------------------------
class ConversationOut(BaseModel):
    id: str
    listing_id: str
    buyer_id: str
    seller_id: str
    listing_title: Optional[str] = None
    listing_image_url: Optional[str] = None
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    other_user: Optional[UserOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    content: str
    is_offer: bool = False
    offer_amount: Optional[int] = None
    created_at: datetime
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageSendRequest(BaseModel):
    content: str
    is_offer: bool = False
    offer_amount: Optional[int] = None


# ---------------------------------------------------------------------------
# Wanted
# ---------------------------------------------------------------------------
class WantedPostOut(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    title: str
    institute_id: Optional[str] = None
    institute_name: Optional[str] = None
    level_label: Optional[str] = None
    description: Optional[str] = None
    fulfilled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WantedPostCreate(BaseModel):
    title: str
    institute_id: Optional[str] = None
    level_label: Optional[str] = None
    description: Optional[str] = None


class WantedOfferOut(BaseModel):
    id: str
    wanted_id: str
    seller_id: str
    seller_name: Optional[str] = None
    condition: str
    price: int
    location: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WantedOfferCreate(BaseModel):
    condition: str
    price: int
    location: str
    description: Optional[str] = None


# ---------------------------------------------------------------------------
# Review
# ---------------------------------------------------------------------------
class ReviewOut(BaseModel):
    id: str
    reviewed_user_id: str
    reviewer_id: str
    reviewer_name: Optional[str] = None
    listing_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    reviewed_user_id: str
    listing_id: str
    rating: int
    comment: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if not (1 <= v <= 5):
            raise ValueError("rating must be 1–5")
        return v


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------
class ReportOut(BaseModel):
    id: str
    target_type: str
    target_id: str
    reporter_id: str
    reason: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportCreate(BaseModel):
    target_type: str
    target_id: str
    reason: str


class ReportResolve(BaseModel):
    status: str  # "reviewed" | "dismissed"


# ---------------------------------------------------------------------------
# Generic
# ---------------------------------------------------------------------------
class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    has_next: bool
