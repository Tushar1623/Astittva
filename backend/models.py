"""Astitva Real Estate - Pydantic Data Models & Helpers
"""
from datetime import datetime, timezone
from typing import List, Optional, Annotated
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr, BeforeValidator


def _validate_objectid(v):
    if isinstance(v, ObjectId):
        return str(v)
    if isinstance(v, str):
        return v
    raise ValueError("Invalid ObjectId")


PyObjectId = Annotated[str, BeforeValidator(_validate_objectid)]


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Auth / User Models
# ---------------------------------------------------------------------------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class RegisterUserIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # admin, sales, marketing


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    created_at: Optional[str] = None


# ---------------------------------------------------------------------------
# Property Models
# ---------------------------------------------------------------------------
class PropertyIn(BaseModel):
    project_name: str
    builder: Optional[str] = ""
    location: str
    city: str
    starting_price: Optional[float] = None
    price_label: Optional[str] = ""
    property_type: str  # Residential / Commercial / Retail / Office Space / Villa / Apartment / Penthouse / Plot
    property_category: Optional[str] = ""  # Luxury / Ultra Luxury / Investment / Commercial / Waterfront / Golf Facing / Smart Home
    description: str
    images: List[str] = Field(default_factory=list)  # storage paths
    rera_number: Optional[str] = ""
    possession_date: Optional[str] = ""
    google_maps_url: Optional[str] = ""
    bedrooms: Optional[str] = ""
    area_sqft: Optional[str] = ""
    amenities: List[str] = Field(default_factory=list)
    status: str = "draft"  # draft / published / unpublished (publication state)
    availability: Optional[str] = "Under Construction"  # Ready To Move / Under Construction / New Launch / Sold Out
    is_featured: bool = False


class PropertyOut(PropertyIn):
    id: str
    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# Lead Models
# ---------------------------------------------------------------------------
class LeadIn(BaseModel):
    prefix: Optional[str] = "Mr"
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    phone_code: Optional[str] = "+91"
    name: Optional[str] = None  # legacy compatibility
    email: EmailStr
    phone: str
    interest: Optional[str] = ""
    budget: Optional[str] = ""
    message: Optional[str] = ""
    source: Optional[str] = "homepage"
    preferred_city: Optional[str] = "Kolkata"
    preferred_locality: Optional[str] = ""
    investment_purpose: Optional[str] = ""
    property_type: Optional[str] = ""
    timeline: Optional[str] = ""
    project: Optional[str] = ""
    property_location: Optional[str] = ""
    preferred_date: Optional[str] = ""
    form: Optional[str] = ""


class LeadOut(LeadIn):
    id: str
    created_at: str
    status: str = "new"


# ---------------------------------------------------------------------------
# Blog Models
# ---------------------------------------------------------------------------
class BlogIn(BaseModel):
    title: str
    slug: Optional[str] = ""
    featured_image: Optional[str] = ""
    short_description: Optional[str] = ""
    body: str = ""
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""
    seo_keywords: Optional[str] = ""
    status: str = "draft"
    publish_date: Optional[str] = ""
    author: Optional[str] = "Astittva Editorial"
