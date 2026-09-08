"""Astitva Real Estate - Blog & Editorial Routes (Public + Admin)
"""
import re
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from config import db
from models import BlogIn, now_utc_iso
from auth import require_staff, require_admin

router = APIRouter(tags=["blogs"])


def slugify(text: str) -> str:
    """URL-safe slug: lowercase, non-alphanumerics -> hyphens, trimmed."""
    if not text:
        return ""
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:120] or "blog"


async def ensure_unique_slug(base: str, exclude_id: Optional[str] = None) -> str:
    """Append -2, -3 ... until the slug is unique in db.blogs."""
    slug = base
    n = 2
    while True:
        query = {"slug": slug}
        if exclude_id:
            try:
                query["_id"] = {"$ne": ObjectId(exclude_id)}
            except Exception:
                pass
        existing = await db.blogs.find_one(query)
        if not existing:
            return slug
        slug = f"{base}-{n}"
        n += 1


def serialize_blog(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "slug": doc.get("slug", ""),
        "featured_image": doc.get("featured_image", ""),
        "short_description": doc.get("short_description", ""),
        "body": doc.get("body", ""),
        "seo_title": doc.get("seo_title", ""),
        "seo_description": doc.get("seo_description", ""),
        "seo_keywords": doc.get("seo_keywords", ""),
        "status": doc.get("status", "draft"),
        "publish_date": doc.get("publish_date", ""),
        "author": doc.get("author", "Astittva Editorial"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


def serialize_blog_summary(doc: dict) -> dict:
    """Lightweight projection used for listing pages - omits the (large) body."""
    return {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "slug": doc.get("slug", ""),
        "featured_image": doc.get("featured_image", ""),
        "short_description": doc.get("short_description", ""),
        "status": doc.get("status", "draft"),
        "publish_date": doc.get("publish_date", ""),
        "author": doc.get("author", "Astittva Editorial"),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@router.get("/blogs")
async def list_blogs(limit: int = 50):
    """Public - list published blogs, newest publish_date first."""
    docs = (
        await db.blogs.find({"status": "published"})
        .sort([("publish_date", -1), ("created_at", -1)])
        .to_list(limit)
    )
    return [serialize_blog_summary(d) for d in docs]


@router.get("/blogs/{slug}")
async def get_blog_by_slug(slug: str):
    doc = await db.blogs.find_one({"slug": slug, "status": "published"})
    if not doc:
        raise HTTPException(status_code=404, detail="Blog not found")
    return serialize_blog(doc)


@router.get("/admin/blogs")
async def admin_list_blogs(_user: dict = Depends(require_staff)):
    docs = await db.blogs.find().sort("created_at", -1).to_list(500)
    return [serialize_blog_summary(d) for d in docs]


@router.get("/admin/blogs/{blog_id}")
async def admin_get_blog(blog_id: str, _user: dict = Depends(require_staff)):
    try:
        doc = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="Blog not found")
    return serialize_blog(doc)


@router.post("/admin/blogs", status_code=201)
async def create_blog(payload: BlogIn, _user: dict = Depends(require_staff)):
    doc = payload.model_dump()
    base_slug = slugify(doc.get("slug") or doc.get("title") or "blog")
    doc["slug"] = await ensure_unique_slug(base_slug)
    doc["created_at"] = now_utc_iso()
    doc["updated_at"] = doc["created_at"]
    if doc.get("status") == "published" and not doc.get("publish_date"):
        doc["publish_date"] = doc["created_at"][:10]
    res = await db.blogs.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_blog(doc)


@router.put("/admin/blogs/{blog_id}")
async def update_blog(blog_id: str, payload: BlogIn, _user: dict = Depends(require_staff)):
    update = payload.model_dump()
    base_slug = slugify(update.get("slug") or update.get("title") or "blog")
    update["slug"] = await ensure_unique_slug(base_slug, exclude_id=blog_id)
    update["updated_at"] = now_utc_iso()
    if update.get("status") == "published" and not update.get("publish_date"):
        update["publish_date"] = update["updated_at"][:10]
    res = await db.blogs.update_one({"_id": ObjectId(blog_id)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    doc = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    return serialize_blog(doc)


@router.patch("/admin/blogs/{blog_id}/status")
async def set_blog_status(blog_id: str, body: dict, _user: dict = Depends(require_staff)):
    status = body.get("status")
    if status not in {"draft", "published"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    update = {"status": status, "updated_at": now_utc_iso()}
    if status == "published":
        existing = await db.blogs.find_one({"_id": ObjectId(blog_id)}, {"publish_date": 1})
        if existing is not None and not existing.get("publish_date"):
            update["publish_date"] = update["updated_at"][:10]
    res = await db.blogs.update_one({"_id": ObjectId(blog_id)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"ok": True, "status": status}


@router.delete("/admin/blogs/{blog_id}")
async def delete_blog(blog_id: str, _user: dict = Depends(require_admin)):
    res = await db.blogs.delete_one({"_id": ObjectId(blog_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"ok": True}
