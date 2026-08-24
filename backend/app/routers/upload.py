from fastapi import APIRouter, Depends
from ..schemas import PresignedUploadRequest, PresignedUploadResponse
from ..auth import get_current_user
from ..models import User
from ..r2 import generate_presigned_upload

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/presign", response_model=PresignedUploadResponse)
async def get_presigned_url(
    payload: PresignedUploadRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Returns a presigned PUT URL so the browser can upload directly to R2.
    The browser PUTs the file, then sends r2_key back to POST /listings.
    """
    upload_url, r2_key, public_url = generate_presigned_upload(
        payload.filename, payload.content_type
    )
    return PresignedUploadResponse(
        upload_url=upload_url,
        r2_key=r2_key,
        public_url=public_url,
    )
