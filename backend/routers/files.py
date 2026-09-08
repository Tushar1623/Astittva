"""Astitva Real Estate - File Upload & Serving Routes
"""
import io
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse

from config import db, APP_NAME
from models import now_utc_iso
from auth import require_staff
from storage import put_object, get_object

router = APIRouter(tags=["files"])

MIME_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "gif": "image/gif",
}


@router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(require_staff)):
    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    path = f"{APP_NAME}/properties/{user['id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")
    content_type = file.content_type or MIME_TYPES[ext]
    result = put_object(path, data, content_type)
    stored_path = result["path"]
    await db.files.insert_one(
        {
            "storage_path": stored_path,
            "original_filename": file.filename,
            "content_type": content_type,
            "size": result.get("size", len(data)),
            "uploaded_by": user["id"],
            "is_deleted": False,
            "created_at": now_utc_iso(),
        }
    )
    return {"path": stored_path}


@router.get("/files/{path:path}")
async def serve_file(path: str):
    """Publicly serve property images with 30-day cache header."""
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return StreamingResponse(
        io.BytesIO(data),
        media_type=record.get("content_type", content_type),
        headers={
            "Cache-Control": "public, max-age=2592000, stale-while-revalidate=604800",
        },
    )
