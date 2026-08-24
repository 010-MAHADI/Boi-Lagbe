from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import User
from ..schemas import SignupRequest, LoginRequest, TokenResponse, UserOut, UserUpdateRequest
from ..auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(payload: SignupRequest, db: AsyncSession = Depends(get_db)):
    # Check duplicate email
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট আছে")

    # Check duplicate phone
    if payload.phone:
        result = await db.execute(select(User).where(User.phone == payload.phone))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="এই ফোন নম্বর দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট আছে")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone=payload.phone or None,
        institute_id=payload.institute_id or None,
        role="user",
    )
    db.add(user)
    await db.flush()

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="ইমেইল বা পাসওয়ার্ড সঠিক নয়")

    if user.is_blocked:
        raise HTTPException(status_code=403, detail="আপনার অ্যাকাউন্ট সাময়িকভাবে স্থগিত করা হয়েছে")

    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.patch("/me", response_model=UserOut)
async def update_me(
    payload: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url
    if payload.institute_id is not None:
        current_user.institute_id = payload.institute_id

    db.add(current_user)
    return UserOut.model_validate(current_user)
