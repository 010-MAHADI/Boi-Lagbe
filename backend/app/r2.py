"""
Cloudflare R2 helper — presigned upload/download URLs via boto3 (S3-compatible API).
"""
import uuid
from typing import Tuple

import boto3
from botocore.config import Config

from .config import get_settings

settings = get_settings()

_s3_client = None


def _get_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",
        )
    return _s3_client


def generate_presigned_upload(filename: str, content_type: str) -> Tuple[str, str, str]:
    """
    Returns (upload_url, r2_key, public_url).
    The client does a PUT to upload_url, then passes r2_key back to the API.
    """
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
    r2_key = f"listings/{uuid.uuid4()}.{ext}"

    client = _get_client()
    upload_url: str = client.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.R2_BUCKET_NAME,
            "Key": r2_key,
            "ContentType": content_type,
        },
        ExpiresIn=600,  # 10 minutes
        HttpMethod="PUT",
    )

    public_url = build_public_url(r2_key)
    return upload_url, r2_key, public_url


def build_public_url(r2_key: str) -> str:
    """
    Build the public URL for an R2 object.
    Uses R2_PUBLIC_URL if set, otherwise falls back to the R2 dev URL pattern.
    """
    base = settings.R2_PUBLIC_URL.rstrip("/")
    if base:
        return f"{base}/{r2_key}"
    # Fallback for Cloudflare R2 public development URL
    return f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{settings.R2_BUCKET_NAME}/{r2_key}"


def delete_object(r2_key: str) -> None:
    """Delete an object from R2. Swallows errors (best-effort cleanup)."""
    try:
        _get_client().delete_object(Bucket=settings.R2_BUCKET_NAME, Key=r2_key)
    except Exception:
        pass
