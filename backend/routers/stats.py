"""Astitva Real Estate - Admin Stats Routes
"""
from fastapi import APIRouter, Depends
from config import db
from auth import require_staff

router = APIRouter(tags=["stats"])


@router.get("/admin/stats")
async def stats(_user: dict = Depends(require_staff)):
    return {
        "properties_total": await db.properties.count_documents({}),
        "properties_published": await db.properties.count_documents({"status": "published"}),
        "leads_total": await db.leads.count_documents({}),
        "leads_new": await db.leads.count_documents({"status": "new"}),
        "users_total": await db.users.count_documents({}),
    }
