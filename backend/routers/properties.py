"""Astitva Real Estate - Property Management Routes (Public + Admin)
"""
import re
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from config import db
from models import PropertyIn, now_utc_iso
from auth import require_staff, require_admin

router = APIRouter(tags=["properties"])

_PRICE_NUMBER_RE = re.compile(r"(\d+(?:[.,]\d+)?)")


def parse_price_label(label) -> Optional[float]:
    """Parse an Indian-format price string into Rupees (float)."""
    if not label or not isinstance(label, str):
        return None
    cleaned = label.replace(",", "").replace("₹", "").strip().lower()
    m = _PRICE_NUMBER_RE.search(cleaned)
    if not m:
        return None
    try:
        n = float(m.group(1))
    except ValueError:
        return None
    if "cr" in cleaned or "crore" in cleaned:
        return n * 10_000_000
    if "lac" in cleaned or "lakh" in cleaned:
        return n * 100_000
    return n


def effective_price(doc: dict) -> Optional[float]:
    sp = doc.get("starting_price")
    if isinstance(sp, (int, float)) and sp > 0:
        return float(sp)
    return parse_price_label(doc.get("price_label"))


def serialize_property(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "project_name": doc.get("project_name", ""),
        "builder": doc.get("builder", ""),
        "location": doc.get("location", ""),
        "city": doc.get("city", ""),
        "starting_price": doc.get("starting_price"),
        "price_label": doc.get("price_label", ""),
        "property_type": doc.get("property_type", ""),
        "property_category": doc.get("property_category", ""),
        "description": doc.get("description", ""),
        "images": doc.get("images", []),
        "rera_number": doc.get("rera_number", ""),
        "possession_date": doc.get("possession_date", ""),
        "availability": doc.get("availability", ""),
        "google_maps_url": doc.get("google_maps_url", ""),
        "bedrooms": doc.get("bedrooms", ""),
        "area_sqft": doc.get("area_sqft", ""),
        "amenities": doc.get("amenities", []),
        "status": doc.get("status", "draft"),
        "is_featured": doc.get("is_featured", False),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@router.get("/properties")
async def list_properties(
    city: Optional[str] = None,
    location: Optional[str] = None,
    property_type: Optional[str] = None,
    category: Optional[str] = None,
    builder: Optional[str] = None,
    availability: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    featured: Optional[bool] = None,
    limit: int = 100,
):
    """Public endpoint - only returns published properties. All filters AND-combined."""
    query: dict = {"status": "published"}
    if city:
        query["city"] = city
    if location:
        LOCATION_HIERARCHY = {
            "Kolkata": [
                "Kolkata", "New Town", "Rajarhat",
                "Action Area I", "Action Area II", "Action Area III",
                "Action Area 1", "Action Area 2", "Action Area 3",
            ],
            "New Town": [
                "New Town",
                "Action Area I", "Action Area II", "Action Area III",
                "Action Area 1", "Action Area 2", "Action Area 3",
            ],
            "Action Area I": ["Action Area I", "Action Area 1", "New Town"],
            "Action Area II": ["Action Area II", "Action Area 2", "New Town"],
            "Action Area III": ["Action Area III", "Action Area 3", "New Town"],
            "Action Area 1": ["Action Area I", "Action Area 1", "New Town"],
            "Action Area 2": ["Action Area II", "Action Area 2", "New Town"],
            "Action Area 3": ["Action Area III", "Action Area 3", "New Town"],
        }
        location_values = LOCATION_HIERARCHY.get(location, [location])
        query["$or"] = [
            {"location": {"$in": location_values}},
            {"city": {"$in": location_values}},
        ]
    if property_type:
        query["property_type"] = {"$regex": f"^{re.escape(property_type)}$", "$options": "i"}
    if category:
        query["property_category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
    if builder:
        builder_norm = builder.strip()
        if builder_norm:
            query["builder"] = {"$regex": re.escape(builder_norm), "$options": "i"}
    if availability:
        query["availability"] = {"$regex": f"^{re.escape(availability)}$", "$options": "i"}
    if featured is not None:
        query["is_featured"] = featured

    docs = await db.properties.find(query).sort("created_at", -1).to_list(limit)

    if min_price is not None or max_price is not None:
        mn = float(min_price) if min_price is not None else None
        mx = float(max_price) if max_price is not None else None
        filtered = []
        for d in docs:
            p = effective_price(d)
            if p is None:
                continue
            if mn is not None and p < mn:
                continue
            if mx is not None and p > mx:
                continue
            filtered.append(d)
        docs = filtered

    return [serialize_property(d) for d in docs]


@router.get("/properties/{prop_id}")
async def get_property(prop_id: str):
    try:
        doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc or doc.get("status") != "published":
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize_property(doc)


@router.get("/admin/properties")
async def admin_list_properties(_user: dict = Depends(require_staff)):
    docs = await db.properties.find().sort("created_at", -1).to_list(500)
    return [serialize_property(d) for d in docs]


@router.get("/admin/properties/{prop_id}")
async def admin_get_property(prop_id: str, _user: dict = Depends(require_staff)):
    try:
        doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize_property(doc)


@router.post("/admin/properties", status_code=201)
async def create_property(payload: PropertyIn, _user: dict = Depends(require_staff)):
    doc = payload.model_dump()
    doc["created_at"] = now_utc_iso()
    doc["updated_at"] = doc["created_at"]
    res = await db.properties.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_property(doc)


@router.put("/admin/properties/{prop_id}")
async def update_property(prop_id: str, payload: PropertyIn, _user: dict = Depends(require_staff)):
    update = payload.model_dump()
    update["updated_at"] = now_utc_iso()
    res = await db.properties.update_one({"_id": ObjectId(prop_id)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    return serialize_property(doc)


@router.patch("/admin/properties/{prop_id}/status")
async def set_property_status(prop_id: str, body: dict, _user: dict = Depends(require_staff)):
    status = body.get("status")
    if status not in {"draft", "published", "unpublished"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.properties.update_one(
        {"_id": ObjectId(prop_id)},
        {"$set": {"status": status, "updated_at": now_utc_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"ok": True, "status": status}


@router.delete("/admin/properties/{prop_id}")
async def delete_property(prop_id: str, _user: dict = Depends(require_admin)):
    res = await db.properties.delete_one({"_id": ObjectId(prop_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"ok": True}
