"""Astitva Real Estate - Lead Capture & Management Routes
"""
import logging
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks

from config import db
from models import LeadIn, now_utc_iso
from auth import require_staff, require_admin
from crm_service import forward_lead

logger = logging.getLogger("astitva.leads")
router = APIRouter(tags=["leads"])


async def _forward_lead_and_stamp(lead_id: ObjectId, doc: dict) -> None:
    """Background worker: forward lead to CRM and update CRM status."""
    try:
        crm_result = await forward_lead(doc)
        await db.leads.update_one(
            {"_id": lead_id},
            {
                "$set": {
                    "crm_status": crm_result["status"],
                    "crm_http_status": crm_result.get("http_status"),
                    "crm_error": crm_result.get("error"),
                    "crm_response": crm_result.get("response"),
                    "crm_attempted_at": now_utc_iso(),
                }
            },
        )
    except Exception as e:
        logger.exception("Background CRM forward crashed: %s", e)
        await db.leads.update_one(
            {"_id": lead_id},
            {
                "$set": {
                    "crm_status": "error",
                    "crm_error": f"background_exception: {e}",
                    "crm_attempted_at": now_utc_iso(),
                }
            },
        )


@router.post("/leads", status_code=201)
async def create_lead(payload: LeadIn, background_tasks: BackgroundTasks):
    doc = payload.model_dump()
    if doc.get("name") and not (doc.get("first_name") or doc.get("last_name")):
        parts = (doc["name"] or "").strip().split(None, 1)
        doc["first_name"] = parts[0] if parts else ""
        doc["last_name"] = parts[1] if len(parts) > 1 else ""
    doc["created_at"] = now_utc_iso()
    doc["status"] = "new"
    doc["crm_status"] = "pending"
    res = await db.leads.insert_one(doc)
    lead_id = str(res.inserted_id)
    background_tasks.add_task(_forward_lead_and_stamp, res.inserted_id, doc)
    return {"id": lead_id, "ok": True, "crm": {"status": "pending"}}


@router.get("/admin/leads")
async def list_leads(_user: dict = Depends(require_staff)):
    projection = {
        "name": 1, "email": 1, "phone": 1, "interest": 1, "budget": 1,
        "preferred_locality": 1, "investment_purpose": 1, "property_type": 1,
        "timeline": 1, "message": 1, "source": 1, "status": 1,
        "crm_status": 1, "crm_http_status": 1, "crm_error": 1, "created_at": 1,
    }
    docs = await db.leads.find({}, projection).sort("created_at", -1).to_list(1000)
    return [
        {
            "id": str(d["_id"]),
            "name": d.get("name"),
            "email": d.get("email"),
            "phone": d.get("phone"),
            "interest": d.get("interest", ""),
            "budget": d.get("budget", ""),
            "preferred_locality": d.get("preferred_locality", ""),
            "investment_purpose": d.get("investment_purpose", ""),
            "property_type": d.get("property_type", ""),
            "timeline": d.get("timeline", ""),
            "message": d.get("message", ""),
            "source": d.get("source", ""),
            "status": d.get("status", "new"),
            "crm_status": d.get("crm_status", "skipped"),
            "crm_http_status": d.get("crm_http_status"),
            "crm_error": d.get("crm_error"),
            "created_at": d.get("created_at"),
        }
        for d in docs
    ]


@router.patch("/admin/leads/{lead_id}")
async def update_lead_status(lead_id: str, body: dict, _user: dict = Depends(require_staff)):
    status = body.get("status")
    if status not in {"new", "contacted", "qualified", "closed"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True}


@router.post("/admin/leads/{lead_id}/crm-retry")
async def retry_crm(lead_id: str, _user: dict = Depends(require_staff)):
    doc = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Lead not found")
    crm_result = await forward_lead(doc)
    await db.leads.update_one(
        {"_id": ObjectId(lead_id)},
        {
            "$set": {
                "crm_status": crm_result["status"],
                "crm_http_status": crm_result.get("http_status"),
                "crm_error": crm_result.get("error"),
                "crm_response": crm_result.get("response"),
                "crm_attempted_at": now_utc_iso(),
            }
        },
    )
    return {"ok": crm_result["ok"], "crm": crm_result}


@router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, _user: dict = Depends(require_admin)):
    res = await db.leads.delete_one({"_id": ObjectId(lead_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True}
