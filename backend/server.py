"""Astitva Real Estate - FastAPI Backend
Premium luxury real estate platform.
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
import re
import requests
import random
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated
from bson import ObjectId

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Header, Query, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from pydantic import BaseModel, Field, EmailStr, BeforeValidator, ConfigDict

import io
import base64
import urllib.parse

from news_service import (
    fetch_topic, fetch_group, fetch_all_classified, latest_fetched_at,
    TOPICS, GROUPS, CACHE_TTL_HOURS, ROLLING_ARCHIVE_LIMIT,
)
from crm_service import forward_lead

# ---------------------------------------------------------------------------
# Config & Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("astitva")

mongo_url = os.environ.get("MONGODB_URI") or os.environ.get("MONGO_URL", "mongodb://localhost:27017")
if not os.environ.get("MONGODB_URI") and not os.environ.get("MONGO_URL"):
    logger.warning("Neither MONGODB_URI nor MONGO_URL environment variable is set; using fallback mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get("DB_NAME", "astitva_db")]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ.get("JWT_SECRET", "astitva-secret-key-change-in-prod")
if JWT_SECRET == "astitva-secret-key-change-in-prod":
    logger.warning("JWT_SECRET environment variable is not set or using default value")
ACCESS_EXPIRES_MIN = 60 * 12  # 12 hours for admin convenience
REFRESH_EXPIRES_DAYS = 7

APP_NAME = os.environ.get("APP_NAME", "astitva-realestate")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
_storage_key: Optional[str] = None

VALID_ROLES = {"admin", "sales", "marketing"}

# ---------------------------------------------------------------------------
# Object Storage Helpers
# ---------------------------------------------------------------------------
def init_storage() -> Optional[str]:
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY missing - object storage disabled")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        logger.info("Object storage initialized")
        return _storage_key
    except Exception as e:  # noqa: BLE001
        logger.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 403:
        # Refresh key once
        global _storage_key
        _storage_key = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    if not key:
        raise HTTPException(status_code=503, detail="Storage unavailable")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Mongo helpers
# ---------------------------------------------------------------------------
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
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_EXPIRES_MIN),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRES_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, httponly=True, secure=True,
                        samesite="none", max_age=ACCESS_EXPIRES_MIN * 60, path="/")
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True,
                        samesite="none", max_age=REFRESH_EXPIRES_DAYS * 86400, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["id"] = str(user.pop("_id"))
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(*roles):
    async def checker(user: dict = Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return user
    return checker


require_admin = require_role("admin")
require_staff = require_role("admin", "sales", "marketing")


# ---------------------------------------------------------------------------
# Pydantic Models
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


class LeadIn(BaseModel):
    # New CRM-aligned identity fields
    prefix: Optional[str] = "Mr"
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    phone_code: Optional[str] = "+91"
    # Legacy compatibility — accept `name` and we'll split it into first/last
    name: Optional[str] = None
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
    # Property tracking — populated by Property Detail / Site Visit forms
    project: Optional[str] = ""
    property_location: Optional[str] = ""
    preferred_date: Optional[str] = ""
    # Form label — used as CRM lead-type tag (e.g. "Site Visit Enquiry")
    form: Optional[str] = ""


class LeadOut(LeadIn):
    id: str
    created_at: str
    status: str = "new"


class PropertyLeadIn(BaseModel):
    name: Optional[str] = ""
    phone: str
    email: Optional[str] = ""
    propertyId: Optional[str] = ""
    propertyName: Optional[str] = ""
    location: Optional[str] = ""
    leadType: Optional[str] = "Property Enquiry"
    message: Optional[str] = ""
    source: Optional[str] = "property-form"
    budget: Optional[str] = ""
    timeline: Optional[str] = ""
    investment_purpose: Optional[str] = ""
    property_type: Optional[str] = ""
    project: Optional[str] = ""
    property_location: Optional[str] = ""
    preferred_locality: Optional[str] = ""
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    prefix: Optional[str] = "Mr"


class CareerApplicationIn(BaseModel):
    name: str
    phone: str
    email: str
    jobTitle: str
    department: Optional[str] = "Private Client Advisory"
    experience: Optional[str] = "Not specified"
    location: Optional[str] = "Kolkata"
    resumeUrl: Optional[str] = ""
    coverLetter: Optional[str] = ""
    source: Optional[str] = "career-portal"
    resume: Optional[dict] = None


class JobOpeningIn(BaseModel):
    title: str
    slug: Optional[str] = ""
    department: Optional[str] = "Sales & Advisory"
    location: Optional[str] = "New Town, Kolkata"
    employmentType: Optional[str] = "Full-time"
    workplaceType: Optional[str] = "On-site"
    experienceLevel: Optional[str] = "Mid-Senior Level"
    experienceMinYears: Optional[int] = 0
    experienceMaxYears: Optional[int] = 0
    salaryRange: Optional[dict] = {
        "min": 0,
        "max": 0,
        "currency": "INR",
        "period": "yearly",
        "isDisclosed": False,
    }
    description: Optional[str] = ""
    responsibilities: Optional[list] = []
    requirements: Optional[list] = []
    benefits: Optional[list] = []
    tags: Optional[list] = []
    status: Optional[str] = "draft"
    isFeatured: Optional[bool] = False
    expiresAt: Optional[str] = None


class JobOpeningUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    employmentType: Optional[str] = None
    workplaceType: Optional[str] = None
    experienceLevel: Optional[str] = None
    experienceMinYears: Optional[int] = None
    experienceMaxYears: Optional[int] = None
    salaryRange: Optional[dict] = None
    description: Optional[str] = None
    responsibilities: Optional[list] = None
    requirements: Optional[list] = None
    benefits: Optional[list] = None
    tags: Optional[list] = None
    status: Optional[str] = None
    isFeatured: Optional[bool] = None
    expiresAt: Optional[str] = None


class JobApplicationIn(BaseModel):
    name: str
    email: str
    phone: str
    linkedin: Optional[str] = ""
    portfolioUrl: Optional[str] = ""
    coverNote: Optional[str] = ""
    experienceYears: Optional[float] = 0.0
    currentCompany: Optional[str] = ""
    currentCtc: Optional[str] = ""
    expectedCtc: Optional[str] = ""
    noticePeriodDays: Optional[int] = 0
    resumeUrl: Optional[str] = ""
    resume: Optional[dict] = None
    source: Optional[str] = "job-board"


class JobApplicationStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = ""


class JobApplicationNoteIn(BaseModel):
    note: str


class BlogIn(BaseModel):
    title: str
    slug: Optional[str] = ""  # auto-generated from title if empty
    featured_image: Optional[str] = ""  # storage path (from /api/admin/upload) or full URL
    short_description: Optional[str] = ""
    body: str = ""  # rich text HTML
    seo_title: Optional[str] = ""
    seo_description: Optional[str] = ""
    seo_keywords: Optional[str] = ""
    status: str = "draft"  # draft / published
    publish_date: Optional[str] = ""  # ISO date string, e.g. "2026-02-15"
    author: Optional[str] = "Astittva Editorial"


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Astitva Real Estate API")
api_router = APIRouter(prefix="/api")


# ---------------------- Health Checks ----------------------
@app.get("/")
@app.get("/healthz")
async def healthz():
    """Service health check probe for Render, uptime monitors, and load balancers."""
    return {"status": "ok", "service": "Astitva Real Estate API", "time": now_utc_iso()}


# ---------------------- SEO ----------------------
SITE_URL = "https://astittva.in"
STATIC_SITEMAP_URLS = [
    ("/", "daily", "1.0"),
    ("/properties", "daily", "0.9"),
    ("/resale", "daily", "0.9"),
    ("/calculators", "weekly", "0.85"),
    ("/blogs", "daily", "0.8"),
    ("/news", "daily", "0.8"),
    ("/about", "monthly", "0.7"),
    ("/contact", "monthly", "0.7"),
    ("/career", "monthly", "0.6"),
    ("/careers/jobs", "daily", "0.85"),
    ("/calculators/home-loan-emi", "weekly", "0.8"),
    ("/calculators/property-affordability", "weekly", "0.8"),
    ("/calculators/property-roi", "weekly", "0.8"),
    ("/calculators/rental-yield", "weekly", "0.8"),
    ("/calculators/rent-vs-buy", "weekly", "0.8"),
    ("/calculators/property-appreciation", "weekly", "0.8"),
    ("/calculators/area-conversion", "weekly", "0.8"),
    ("/calculators/price-per-sqft", "weekly", "0.8"),
    ("/calculators/stamp-duty-registration", "weekly", "0.8"),
    ("/calculators/construction-cost", "weekly", "0.8"),
    ("/calculators/down-payment", "weekly", "0.8"),
    ("/calculators/capital-gains-tax", "weekly", "0.8"),
]


@app.get("/sitemap.xml")
@app.get("/api/sitemap.xml")
async def sitemap_xml():
    """Dynamic sitemap.xml — includes every published property, resale, blog + static pages."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, changefreq, priority in STATIC_SITEMAP_URLS:
        parts.append(
            f"  <url><loc>{SITE_URL}{path}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>"
        )
    # Dynamic published properties
    try:
        cursor = db.properties.find(
            {"status": "published"},
            {"_id": 1, "updated_at": 1, "created_at": 1},
        )
        async for p in cursor:
            pid = str(p["_id"])
            lastmod = (p.get("updated_at") or p.get("created_at") or today)
            if isinstance(lastmod, str) and "T" in lastmod:
                lastmod = lastmod.split("T", 1)[0]
            parts.append(
                f"  <url><loc>{SITE_URL}/properties/{pid}</loc>"
                f"<lastmod>{lastmod}</lastmod><changefreq>weekly</changefreq>"
                f"<priority>0.85</priority></url>"
            )

        # Dynamic published resale properties
        resale_cursor = db.resale_properties.find(
            {"status": "published"},
            {"_id": 1, "updatedAt": 1, "createdAt": 1},
        )
        async for rp in resale_cursor:
            rpid = str(rp["_id"])
            lastmod = (rp.get("updatedAt") or rp.get("createdAt") or today)
            if isinstance(lastmod, str) and "T" in lastmod:
                lastmod = lastmod.split("T", 1)[0]
            parts.append(
                f"  <url><loc>{SITE_URL}/resale/{rpid}</loc>"
                f"<lastmod>{lastmod}</lastmod><changefreq>weekly</changefreq>"
                f"<priority>0.85</priority></url>"
            )

        # Dynamic published blogs (SEO-friendly /blogs/<slug> URLs)
        blog_cursor = db.blogs.find(
            {"status": "published"},
            {"slug": 1, "updated_at": 1, "publish_date": 1, "created_at": 1},
        )
        async for b in blog_cursor:
            slug = b.get("slug")
            if not slug:
                continue
            lastmod = (b.get("updated_at") or b.get("publish_date") or b.get("created_at") or today)
            if isinstance(lastmod, str) and "T" in lastmod:
                lastmod = lastmod.split("T", 1)[0]
            parts.append(
                f"  <url><loc>{SITE_URL}/blogs/{slug}</loc>"
                f"<lastmod>{lastmod}</lastmod><changefreq>weekly</changefreq>"
                f"<priority>0.8</priority></url>"
            )

        # Dynamic published job openings (/careers/jobs/<slug>)
        job_cursor = db.job_openings.find(
            {"status": "published"},
            {"slug": 1, "updatedAt": 1, "postedAt": 1, "createdAt": 1},
        )
        async for j in job_cursor:
            slug = j.get("slug")
            if not slug:
                continue
            lastmod = (j.get("updatedAt") or j.get("postedAt") or j.get("createdAt") or today)
            if isinstance(lastmod, str) and "T" in lastmod:
                lastmod = lastmod.split("T", 1)[0]
            parts.append(
                f"  <url><loc>{SITE_URL}/careers/jobs/{slug}</loc>"
                f"<lastmod>{lastmod}</lastmod><changefreq>daily</changefreq>"
                f"<priority>0.85</priority></url>"
            )
    except Exception as e:
        logging.getLogger("astitva.sitemap").exception("sitemap generation failed: %s", e)
    parts.append("</urlset>")
    xml = "\n".join(parts)
    return Response(content=xml, media_type="application/xml")



# ---------------------- Auth Routes ----------------------
@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response, request: Request):
    email = payload.email.lower().strip()
    identifier = f"{request.client.host if request.client else 'unknown'}:{email}"

    # Brute force check
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await db.login_attempts.delete_one({"identifier": identifier})
    uid = str(user["_id"])
    access = create_access_token(uid, user["email"], user["role"])
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {
        "user": {
            "id": uid,
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
        },
        "access_token": access,
    }


@api_router.post("/auth/logout")
async def logout(response: Response, _user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
    }


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"], user["role"])
        response.set_cookie("access_token", access, httponly=True, secure=True,
                            samesite="none", max_age=ACCESS_EXPIRES_MIN * 60, path="/")
        return {"access_token": access}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------------------- User Management (admin only) ----------------------
@api_router.get("/users", response_model=List[UserOut])
async def list_users(_admin: dict = Depends(require_admin)):
    users = await db.users.find().sort("created_at", -1).to_list(500)
    return [
        UserOut(
            id=str(u["_id"]), email=u["email"], name=u["name"], role=u["role"],
            created_at=u.get("created_at"),
        ) for u in users
    ]


@api_router.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: RegisterUserIn, _admin: dict = Depends(require_admin)):
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email already in use")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "role": payload.role,
        "created_at": now_utc_iso(),
    }
    res = await db.users.insert_one(doc)
    return UserOut(id=str(res.inserted_id), email=email, name=payload.name,
                   role=payload.role, created_at=doc["created_at"])


@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete self")
    res = await db.users.delete_one({"_id": ObjectId(user_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


# ---------------------- Properties (public + admin) ----------------------
# ---------- Price normalisation (Indian formats) ----------
# Properties carry both a numeric `starting_price` (₹) and a free-form
# `price_label` (e.g. "₹ 4.52 Crores Onwards", "77 Lacs Onwards"). Historically
# many admin-entered properties left `starting_price` empty, so price filters
# silently dropped them. `effective_price()` returns the best numeric value
# we can derive from either field — used for filtering only, never written back.
_PRICE_NUMBER_RE = re.compile(r"(\d+(?:[.,]\d+)?)")


def parse_price_label(label) -> Optional[float]:
    """Parse an Indian-format price string into Rupees (float).

    Handles inputs like:
      "₹ 4.52 Crores Onwards"      -> 45200000
      "1.82 Cr Onwards"            -> 18200000
      "77 Lacs Onwards"            -> 7700000
      "75 Lakh"                    -> 7500000
      "₹95,00,000"                 -> 9500000
      "9500000"                    -> 9500000
    Returns None if no numeric value can be extracted.
    """
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
    return n  # already in Rupees (or unitless number)


def effective_price(doc: dict) -> Optional[float]:
    sp = doc.get("starting_price")
    if isinstance(sp, (int, float)) and sp > 0:
        return float(sp)
    return parse_price_label(doc.get("price_label"))


def serialize_property(doc: dict) -> dict:
    raw_imgs = doc.get("images", []) if isinstance(doc.get("images"), list) else []
    valid = []
    legacy = []
    for img in raw_imgs:
        if isinstance(img, str) and img.strip():
            clean = img.strip()
            if "drive.google.com" in clean or "googleusercontent.com" in clean or clean.startswith("http://") or clean.startswith("https://") or clean.startswith("/uploads/"):
                valid.append(clean)
            elif not clean.startswith("astitva-realestate"):
                legacy.append(clean)
    ordered_images = valid + legacy
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
        "featured_image": doc.get("featured_image") or (valid[0] if valid else ""),
        "images": ordered_images,
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


@api_router.get("/properties")
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
        # Hierarchical parent ↔ child expansion. Selecting a parent city/area should
        # return all child sub-markets; selecting a child should also return the
        # parent's properties (parents and children share natural overlap, e.g. a
        # listing tagged simply "New Town" should appear for any Action Area buyer).
        #
        # Both Roman (I/II/III) and Arabic (1/2/3) Action Area spellings are mapped
        # so the filter is resilient to how a property is tagged in the admin panel.
        LOCATION_HIERARCHY = {
            # City-level
            "Kolkata": ["Kolkata", "New Town", "Rajarhat",
                        "Action Area I", "Action Area II", "Action Area III",
                        "Action Area 1", "Action Area 2", "Action Area 3"],
            # New Town parent → all Action Areas
            "New Town": ["New Town",
                          "Action Area I", "Action Area II", "Action Area III",
                          "Action Area 1", "Action Area 2", "Action Area 3"],
            # Each Action Area → itself + parent New Town
            "Action Area I":   ["Action Area I",   "Action Area 1", "New Town"],
            "Action Area II":  ["Action Area II",  "Action Area 2", "New Town"],
            "Action Area III": ["Action Area III", "Action Area 3", "New Town"],
            "Action Area 1":   ["Action Area I",   "Action Area 1", "New Town"],
            "Action Area 2":   ["Action Area II",  "Action Area 2", "New Town"],
            "Action Area 3":   ["Action Area III", "Action Area 3", "New Town"],
        }
        location_values = LOCATION_HIERARCHY.get(location, [location])
        # Match against the location field OR the city field — luxury micro-markets
        # like "New Town" / "Action Area II" can live in either column historically.
        query["$or"] = [
            {"location": {"$in": location_values}},
            {"city": {"$in": location_values}},
        ]
    if property_type:
        # Case-insensitive exact match — guards against historic data variants
        # like "RESIDENTIAL" vs "Residential".
        query["property_type"] = {"$regex": f"^{re.escape(property_type)}$", "$options": "i"}
    if category:
        query["property_category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
    if builder:
        # Case-insensitive CONTAINS match — DB stores "MERLIN GROUP",
        # "Shrachi Keventer Abasan Private Limited", etc. while the filter
        # uses short brand names ("Merlin", "Shrachi"). Trim + strip $ chars
        # so any whitespace/formatting differences are forgiven.
        builder_norm = builder.strip()
        if builder_norm:
            query["builder"] = {"$regex": re.escape(builder_norm), "$options": "i"}
    if availability:
        query["availability"] = {"$regex": f"^{re.escape(availability)}$", "$options": "i"}
    # NOTE: Price filtering is NOT pushed into Mongo because many properties
    # carry the price only in `price_label` ("₹ 4.52 Crores Onwards") while
    # `starting_price` is NULL. We fetch the candidate set first, then apply
    # the normalised price filter in Python using effective_price().
    if featured is not None:
        query["is_featured"] = featured
    docs = await db.properties.find(query).sort("created_at", -1).to_list(limit)
    # In-memory price normalisation + filter.
    if min_price is not None or max_price is not None:
        mn = float(min_price) if min_price is not None else None
        mx = float(max_price) if max_price is not None else None
        filtered = []
        for d in docs:
            p = effective_price(d)
            if p is None:
                continue  # price unknown → exclude from explicit range query
            if mn is not None and p < mn:
                continue
            if mx is not None and p > mx:
                continue
            filtered.append(d)
        docs = filtered
    return [serialize_property(d) for d in docs]


@api_router.get("/properties/{prop_id}")
async def get_property(prop_id: str):
    try:
        doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc or doc.get("status") != "published":
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize_property(doc)


@api_router.get("/admin/properties")
async def admin_list_properties(_user: dict = Depends(require_staff)):
    docs = await db.properties.find().sort("created_at", -1).to_list(500)
    return [serialize_property(d) for d in docs]


@api_router.get("/admin/properties/{prop_id}")
async def admin_get_property(prop_id: str, _user: dict = Depends(require_staff)):
    try:
        doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="Property not found")
    return serialize_property(doc)


@api_router.post("/admin/properties", status_code=201)
async def create_property(payload: PropertyIn, _user: dict = Depends(require_staff)):
    doc = payload.model_dump()
    doc["created_at"] = now_utc_iso()
    doc["updated_at"] = doc["created_at"]
    res = await db.properties.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_property(doc)


@api_router.put("/admin/properties/{prop_id}")
async def update_property(prop_id: str, payload: PropertyIn, _user: dict = Depends(require_staff)):
    update = payload.model_dump()
    update["updated_at"] = now_utc_iso()
    res = await db.properties.update_one({"_id": ObjectId(prop_id)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    doc = await db.properties.find_one({"_id": ObjectId(prop_id)})
    return serialize_property(doc)


@api_router.patch("/admin/properties/{prop_id}/status")
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


@api_router.delete("/admin/properties/{prop_id}")
async def delete_property(prop_id: str, _user: dict = Depends(require_admin)):
    res = await db.properties.delete_one({"_id": ObjectId(prop_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    return {"ok": True}


# ---------------------- Resale Module ----------------------
def serialize_resale_property(doc: dict, is_admin: bool = False) -> dict:
    images = doc.get("images", []) if isinstance(doc.get("images"), list) else []
    featured_img = doc.get("featuredImage") or (images[0] if images else "")
    try:
        price_val = float(doc.get("price", 0))
    except (ValueError, TypeError):
        price_val = 0.0
    try:
        area_val = float(doc.get("area", 0))
    except (ValueError, TypeError):
        area_val = 0.0
    try:
        ppsf_val = float(doc.get("pricePerSqFt", 0))
    except (ValueError, TypeError):
        ppsf_val = round(price_val / area_val) if price_val > 0 and area_val > 0 else 0.0

    res = {
        "id": str(doc["_id"]),
        "title": doc.get("title", ""),
        "propertyType": doc.get("propertyType", "Apartment"),
        "listingType": doc.get("listingType", "For Sale"),
        "location": doc.get("location", ""),
        "address": doc.get("address", ""),
        "locality": doc.get("locality", ""),
        "city": doc.get("city", "Kolkata"),
        "pincode": doc.get("pincode", ""),
        "price": price_val,
        "pricePerSqFt": ppsf_val,
        "area": area_val,
        "areaUnit": doc.get("areaUnit", "sq.ft."),
        "bedrooms": doc.get("bedrooms", ""),
        "bathrooms": doc.get("bathrooms", ""),
        "balconies": doc.get("balconies", ""),
        "floor": doc.get("floor", ""),
        "totalFloors": doc.get("totalFloors", ""),
        "furnishingStatus": doc.get("furnishingStatus", "Unfurnished"),
        "parking": doc.get("parking", "None"),
        "ageOfProperty": doc.get("ageOfProperty", ""),
        "description": doc.get("description", ""),
        "amenities": doc.get("amenities", []) if isinstance(doc.get("amenities"), list) else [],
        "images": images,
        "featuredImage": featured_img,
        "possessionStatus": doc.get("possessionStatus", "Ready to Move"),
        "status": doc.get("status", "Draft"),
        "featured": bool(doc.get("featured", False)),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", ""),
        "createdBy": doc.get("createdBy", "admin"),
    }
    if is_admin:
        res["sellerName"] = doc.get("sellerName", "")
        res["sellerPhone"] = doc.get("sellerPhone", "")
        res["sellerEmail"] = doc.get("sellerEmail", "")
    return res


def serialize_resale_lead(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "resalePropertyId": doc.get("resalePropertyId", ""),
        "propertyTitle": doc.get("propertyTitle", ""),
        "name": doc.get("name", ""),
        "phone": doc.get("phone", ""),
        "email": doc.get("email", ""),
        "message": doc.get("message", ""),
        "source": doc.get("source", "resale-page"),
        "status": doc.get("status", "New"),
        "assignedTo": doc.get("assignedTo", "Unassigned"),
        "notes": doc.get("notes", ""),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", ""),
    }


@api_router.get("/resale")
async def list_resale_properties(
    location: Optional[str] = None,
    city: Optional[str] = None,
    propertyType: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    bedrooms: Optional[str] = None,
    furnishingStatus: Optional[str] = None,
    featured: Optional[bool] = None,
    sort: Optional[str] = None,
    limit: int = 100,
    page: int = 1,
):
    query = {"status": {"$regex": "^published$", "$options": "i"}}
    if city:
        query["city"] = {"$regex": re.escape(city.strip()), "$options": "i"}
    if location:
        loc_esc = re.escape(location.strip())
        query["$or"] = [
            {"location": {"$regex": loc_esc, "$options": "i"}},
            {"locality": {"$regex": loc_esc, "$options": "i"}},
            {"city": {"$regex": loc_esc, "$options": "i"}},
            {"address": {"$regex": loc_esc, "$options": "i"}},
        ]
    if propertyType:
        query["propertyType"] = {"$regex": f"^{re.escape(propertyType.strip())}$", "$options": "i"}
    if furnishingStatus:
        query["furnishingStatus"] = {"$regex": re.escape(furnishingStatus.strip()), "$options": "i"}
    if bedrooms:
        try:
            nb = int(bedrooms.strip())
            query["$or"] = [{"bedrooms": nb}, {"bedrooms": str(nb)}, {"bedrooms": {"$regex": str(nb)}}]
        except ValueError:
            query["bedrooms"] = {"$regex": re.escape(bedrooms.strip()), "$options": "i"}
    if featured is not None:
        query["featured"] = featured
    if minPrice is not None or maxPrice is not None:
        query["price"] = {}
        if minPrice is not None:
            query["price"]["$gte"] = minPrice
        if maxPrice is not None:
            query["price"]["$lte"] = maxPrice

    sort_order = [("createdAt", -1)]
    if sort == "price_asc":
        sort_order = [("price", 1), ("createdAt", -1)]
    elif sort == "price_desc":
        sort_order = [("price", -1), ("createdAt", -1)]
    elif sort == "area_desc":
        sort_order = [("area", -1), ("createdAt", -1)]

    skip = (max(page, 1) - 1) * limit
    cursor = db.resale_properties.find(query).sort(sort_order).skip(skip).limit(min(limit, 200))
    docs = await cursor.to_list(length=200)
    return [serialize_resale_property(d, is_admin=False) for d in docs]


@api_router.get("/resale/{prop_id}")
async def get_resale_property_public(prop_id: str):
    try:
        oid = ObjectId(prop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale property ID")
    doc = await db.resale_properties.find_one({"_id": oid, "status": {"$regex": "^published$", "$options": "i"}})
    if not doc:
        raise HTTPException(status_code=404, detail="Resale property not found")
    return serialize_resale_property(doc, is_admin=False)


@api_router.post("/leads/resale", status_code=201)
async def submit_resale_lead(payload: dict):
    name = (payload.get("name") or f"{payload.get('first_name', '')} {payload.get('last_name', '')}").strip()
    phone = (payload.get("phone") or "").strip()
    email = (payload.get("email") or "").lower().strip()
    if not name and not phone and not email:
        raise HTTPException(status_code=400, detail="Please provide your name, phone number, or email.")

    lead_doc = {
        "resalePropertyId": str(payload.get("resalePropertyId") or payload.get("propertyId") or ""),
        "propertyTitle": str(payload.get("propertyTitle") or payload.get("propertyName") or ""),
        "name": name or "Anonymous Enquiry",
        "phone": phone,
        "email": email,
        "message": str(payload.get("message") or ""),
        "source": str(payload.get("source") or "resale-page"),
        "status": "New",
        "assignedTo": "Unassigned",
        "notes": "",
        "createdAt": now_utc_iso(),
        "updatedAt": now_utc_iso(),
    }
    res = await db.resale_leads.insert_one(lead_doc)
    return {"id": str(res.inserted_id), "ok": True, "message": "Resale enquiry submitted successfully"}


@api_router.get("/admin/resale")
async def list_admin_resale_properties(
    status: Optional[str] = None,
    propertyType: Optional[str] = None,
    location: Optional[str] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    _user: dict = Depends(require_staff),
):
    query = {}
    if status:
        query["status"] = {"$regex": f"^{re.escape(status.strip())}$", "$options": "i"}
    if propertyType:
        query["propertyType"] = {"$regex": f"^{re.escape(propertyType.strip())}$", "$options": "i"}
    if location:
        loc_esc = re.escape(location.strip())
        query["$or"] = [
            {"location": {"$regex": loc_esc, "$options": "i"}},
            {"locality": {"$regex": loc_esc, "$options": "i"}},
            {"city": {"$regex": loc_esc, "$options": "i"}},
        ]
    if featured is not None:
        query["featured"] = featured
    if search:
        s_esc = re.escape(search.strip())
        query["$or"] = [
            {"title": {"$regex": s_esc, "$options": "i"}},
            {"location": {"$regex": s_esc, "$options": "i"}},
            {"locality": {"$regex": s_esc, "$options": "i"}},
            {"city": {"$regex": s_esc, "$options": "i"}},
            {"sellerName": {"$regex": s_esc, "$options": "i"}},
            {"sellerPhone": {"$regex": s_esc, "$options": "i"}},
        ]
    cursor = db.resale_properties.find(query).sort([("createdAt", -1)]).limit(500)
    docs = await cursor.to_list(length=500)
    return [serialize_resale_property(d, is_admin=True) for d in docs]


@api_router.get("/admin/resale/{prop_id}")
async def get_admin_resale_property(prop_id: str, _user: dict = Depends(require_staff)):
    try:
        oid = ObjectId(prop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale property ID")
    doc = await db.resale_properties.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Resale property not found")
    return serialize_resale_property(doc, is_admin=True)


@api_router.post("/admin/resale", status_code=201)
async def create_admin_resale_property(payload: dict, user: dict = Depends(require_staff)):
    now = now_utc_iso()
    doc = {
        "title": (payload.get("title") or "Untitled Resale Property").strip(),
        "propertyType": payload.get("propertyType", "Apartment"),
        "listingType": payload.get("listingType", "For Sale"),
        "location": (payload.get("location") or "").strip(),
        "address": (payload.get("address") or "").strip(),
        "locality": (payload.get("locality") or "").strip(),
        "city": (payload.get("city") or "Kolkata").strip(),
        "pincode": (payload.get("pincode") or "").strip(),
        "price": float(payload.get("price") or 0),
        "pricePerSqFt": float(payload.get("pricePerSqFt") or 0),
        "area": float(payload.get("area") or 0),
        "areaUnit": payload.get("areaUnit", "sq.ft."),
        "bedrooms": payload.get("bedrooms", ""),
        "bathrooms": payload.get("bathrooms", ""),
        "balconies": payload.get("balconies", ""),
        "floor": payload.get("floor", ""),
        "totalFloors": payload.get("totalFloors", ""),
        "furnishingStatus": payload.get("furnishingStatus", "Unfurnished"),
        "parking": payload.get("parking", "None"),
        "ageOfProperty": payload.get("ageOfProperty", ""),
        "description": payload.get("description", ""),
        "amenities": payload.get("amenities", []) if isinstance(payload.get("amenities"), list) else [],
        "images": payload.get("images", []) if isinstance(payload.get("images"), list) else [],
        "featuredImage": payload.get("featuredImage") or "",
        "sellerName": (payload.get("sellerName") or "").strip(),
        "sellerPhone": (payload.get("sellerPhone") or "").strip(),
        "sellerEmail": (payload.get("sellerEmail") or "").lower().strip(),
        "possessionStatus": payload.get("possessionStatus", "Ready to Move"),
        "status": payload.get("status", "Draft"),
        "featured": bool(payload.get("featured", False)),
        "createdAt": now,
        "updatedAt": now,
        "createdBy": user.get("email", "admin"),
    }
    if not doc["pricePerSqFt"] and doc["price"] > 0 and doc["area"] > 0:
        doc["pricePerSqFt"] = round(doc["price"] / doc["area"])
    if not doc["featuredImage"] and doc["images"]:
        doc["featuredImage"] = doc["images"][0]
    res = await db.resale_properties.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_resale_property(doc, is_admin=True)


@api_router.put("/admin/resale/{prop_id}")
@api_router.patch("/admin/resale/{prop_id}")
async def update_admin_resale_property(prop_id: str, payload: dict, _user: dict = Depends(require_staff)):
    try:
        oid = ObjectId(prop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale property ID")
    update_data = {k: v for k, v in payload.items() if k not in ("_id", "id", "createdAt")}
    update_data["updatedAt"] = now_utc_iso()
    res = await db.resale_properties.find_one_and_update(
        {"_id": oid},
        {"$set": update_data},
        return_document=True,
    )
    if not res:
        raise HTTPException(status_code=404, detail="Resale property not found")
    return serialize_resale_property(res, is_admin=True)


@api_router.patch("/admin/resale/{prop_id}/status")
async def update_admin_resale_status(prop_id: str, payload: dict, _user: dict = Depends(require_staff)):
    try:
        oid = ObjectId(prop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale property ID")
    status = payload.get("status")
    allowed = ["Draft", "Pending Review", "Published", "Sold", "Inactive"]
    matched = next((s for s in allowed if s.lower() == (status or "").lower()), None)
    if not matched:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(allowed)}")
    res = await db.resale_properties.update_one(
        {"_id": oid},
        {"$set": {"status": matched, "updatedAt": now_utc_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resale property not found")
    return {"ok": True, "status": matched}


@api_router.patch("/admin/resale/{prop_id}/featured")
async def update_admin_resale_featured(prop_id: str, payload: dict, _user: dict = Depends(require_staff)):
    try:
        oid = ObjectId(prop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale property ID")
    featured = bool(payload.get("featured", False))
    res = await db.resale_properties.update_one(
        {"_id": oid},
        {"$set": {"featured": featured, "updatedAt": now_utc_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resale property not found")
    return {"ok": True, "featured": featured}


@api_router.delete("/admin/resale/{prop_id}")
async def delete_admin_resale_property(prop_id: str, _user: dict = Depends(require_admin)):
    try:
        oid = ObjectId(prop_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale property ID")
    res = await db.resale_properties.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resale property not found")
    return {"ok": True}


@api_router.get("/admin/leads/resale")
async def list_admin_resale_leads(
    status: Optional[str] = None,
    search: Optional[str] = None,
    _user: dict = Depends(require_staff),
):
    query = {}
    if status:
        query["status"] = {"$regex": f"^{re.escape(status.strip())}$", "$options": "i"}
    if search:
        s_esc = re.escape(search.strip())
        query["$or"] = [
            {"name": {"$regex": s_esc, "$options": "i"}},
            {"phone": {"$regex": s_esc, "$options": "i"}},
            {"email": {"$regex": s_esc, "$options": "i"}},
            {"propertyTitle": {"$regex": s_esc, "$options": "i"}},
        ]
    cursor = db.resale_leads.find(query).sort([("createdAt", -1)]).limit(1000)
    docs = await cursor.to_list(length=1000)
    return [serialize_resale_lead(d) for d in docs]


@api_router.patch("/admin/leads/resale/{lead_id}")
async def update_admin_resale_lead(lead_id: str, payload: dict, _user: dict = Depends(require_staff)):
    try:
        oid = ObjectId(lead_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale lead ID")
    update_data = {"updatedAt": now_utc_iso()}
    if "status" in payload:
        update_data["status"] = payload["status"]
    if "assignedTo" in payload:
        update_data["assignedTo"] = payload["assignedTo"]
    if "notes" in payload:
        update_data["notes"] = payload["notes"]
    res = await db.resale_leads.update_one({"_id": oid}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Resale lead not found")
    return {"ok": True, "update": update_data}


@api_router.delete("/admin/leads/resale/{lead_id}")
async def delete_admin_resale_lead(lead_id: str, _user: dict = Depends(require_admin)):
    try:
        oid = ObjectId(lead_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid resale lead ID")
    res = await db.resale_leads.delete_one({"_id": oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resale lead not found")
    return {"ok": True}


# ---------------------- Leads ----------------------
async def _forward_lead_and_stamp(lead_id: ObjectId, doc: dict) -> None:
    """Background-only worker: forward to CRM and stamp the result on the lead.
    Never raises — failures are logged by crm_service and surfaced via crm_status.
    """
    try:
        crm_result = await forward_lead(doc)
        await db.leads.update_one(
            {"_id": lead_id},
            {"$set": {
                "crm_status": crm_result["status"],
                "crm_http_status": crm_result.get("http_status"),
                "crm_error": crm_result.get("error"),
                "crm_response": crm_result.get("response"),
                "crm_attempted_at": now_utc_iso(),
            }},
        )
    except Exception as e:
        # Defensive — should never happen because forward_lead is fail-safe,
        # but if it does we keep the lead but record the failure.
        logging.getLogger("astitva.leads").exception("Background CRM forward crashed: %s", e)
        await db.leads.update_one(
            {"_id": lead_id},
            {"$set": {
                "crm_status": "error",
                "crm_error": f"background_exception: {e}",
                "crm_attempted_at": now_utc_iso(),
            }},
        )


@api_router.post("/leads", status_code=201)
async def create_lead(payload: LeadIn, background_tasks: BackgroundTasks):
    doc = payload.model_dump()
    # Legacy compat: if frontend still posts "name", split into first/last for CRM
    if doc.get("name") and not (doc.get("first_name") or doc.get("last_name")):
        parts = (doc["name"] or "").strip().split(None, 1)
        doc["first_name"] = parts[0] if parts else ""
        doc["last_name"] = parts[1] if len(parts) > 1 else ""
    doc["created_at"] = now_utc_iso()
    doc["status"] = "new"
    doc["crm_status"] = "pending"  # will be overwritten by background task
    # 1. Save locally FIRST so a CRM outage never loses the lead. <50ms.
    res = await db.leads.insert_one(doc)
    lead_id = str(res.inserted_id)
    # 2. Defer the CRM forward — runs AFTER the response is sent. The user
    # sees confirmation in ~50ms; CRM sync continues asynchronously.
    background_tasks.add_task(_forward_lead_and_stamp, res.inserted_id, doc)
    return {"id": lead_id, "ok": True, "crm": {"status": "pending"}}


@api_router.get("/admin/leads")
async def list_leads(_user: dict = Depends(require_staff)):
    # Project ONLY the fields the response actually uses — keeps payload light
    # and avoids shipping the potentially-large `crm_response` blob (full HTTP
    # body from the Azure CRM webhook) across the wire on every admin refresh.
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


@api_router.patch("/admin/leads/{lead_id}")
async def update_lead_status(lead_id: str, body: dict, _user: dict = Depends(require_staff)):
    status = body.get("status")
    if status not in {"new", "contacted", "qualified", "closed"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"status": status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True}


@api_router.post("/admin/leads/{lead_id}/crm-retry")
async def retry_crm(lead_id: str, _user: dict = Depends(require_staff)):
    """Manually re-forward a stored lead to the CRM (for ops recovery)."""
    doc = await db.leads.find_one({"_id": ObjectId(lead_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Lead not found")
    crm_result = await forward_lead(doc)
    await db.leads.update_one(
        {"_id": ObjectId(lead_id)},
        {"$set": {
            "crm_status": crm_result["status"],
            "crm_http_status": crm_result.get("http_status"),
            "crm_error": crm_result.get("error"),
            "crm_response": crm_result.get("response"),
            "crm_attempted_at": now_utc_iso(),
        }},
    )
    return {"ok": crm_result["ok"], "crm": crm_result}


@api_router.delete("/admin/leads/{lead_id}")
async def delete_lead(lead_id: str, _user: dict = Depends(require_admin)):
    res = await db.leads.delete_one({"_id": ObjectId(lead_id)})
    await db.property_leads.delete_one({"_id": ObjectId(lead_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"ok": True}


# ---------------------- Property Leads ----------------------
@api_router.post("/leads/property", status_code=201)
async def create_property_lead(payload: PropertyLeadIn, background_tasks: BackgroundTasks):
    doc = payload.model_dump()
    name = (doc.get("name") or f"{doc.get('first_name', '')} {doc.get('last_name', '')}").strip()
    doc["name"] = name or "Anonymous Enquiry"
    doc["status"] = "New"
    doc["assignedTo"] = "Unassigned"
    doc["notes"] = ""
    doc["createdAt"] = now_utc_iso()
    doc["updatedAt"] = now_utc_iso()

    res = await db.property_leads.insert_one(doc)
    lead_id = str(res.inserted_id)

    # Mirror to legacy leads
    try:
        legacy_doc = {
            **doc,
            "_id": res.inserted_id,
            "created_at": doc["createdAt"],
            "status": "new",
        }
        await db.leads.insert_one(legacy_doc)
        background_tasks.add_task(_forward_lead_and_stamp, res.inserted_id, legacy_doc)
    except Exception:
        pass

    return {"id": lead_id, "ok": True, "leadType": doc.get("leadType", "Property Enquiry")}


@api_router.get("/admin/leads/property")
async def list_property_leads(_user: dict = Depends(require_staff)):
    docs = await db.property_leads.find({}).sort("createdAt", -1).to_list(1000)
    return [
        {
            "id": str(d["_id"]),
            "_id": str(d["_id"]),
            "name": d.get("name", ""),
            "phone": d.get("phone", ""),
            "email": d.get("email", ""),
            "propertyId": d.get("propertyId", ""),
            "propertyName": d.get("propertyName", ""),
            "location": d.get("location", ""),
            "leadType": d.get("leadType", "Property Enquiry"),
            "message": d.get("message", ""),
            "source": d.get("source", "website"),
            "status": d.get("status", "New"),
            "assignedTo": d.get("assignedTo", "Unassigned"),
            "notes": d.get("notes", ""),
            "createdAt": d.get("createdAt") or d.get("created_at") or now_utc_iso(),
            "updatedAt": d.get("updatedAt") or d.get("createdAt") or now_utc_iso(),
        }
        for d in docs
    ]


@api_router.get("/admin/leads/property/{lead_id}")
async def get_property_lead(lead_id: str, _user: dict = Depends(require_staff)):
    d = await db.property_leads.find_one({"_id": ObjectId(lead_id)})
    if not d:
        raise HTTPException(status_code=404, detail="Property lead not found")
    return {
        "id": str(d["_id"]),
        "_id": str(d["_id"]),
        "name": d.get("name", ""),
        "phone": d.get("phone", ""),
        "email": d.get("email", ""),
        "propertyId": d.get("propertyId", ""),
        "propertyName": d.get("propertyName", ""),
        "location": d.get("location", ""),
        "leadType": d.get("leadType", "Property Enquiry"),
        "message": d.get("message", ""),
        "source": d.get("source", "website"),
        "status": d.get("status", "New"),
        "assignedTo": d.get("assignedTo", "Unassigned"),
        "notes": d.get("notes", ""),
        "createdAt": d.get("createdAt") or d.get("created_at"),
        "updatedAt": d.get("updatedAt"),
    }


@api_router.patch("/admin/leads/property/{lead_id}")
async def update_property_lead(lead_id: str, body: dict, _user: dict = Depends(require_staff)):
    update_data = {"updatedAt": now_utc_iso()}
    for k in ["status", "assignedTo", "notes"]:
        if k in body:
            update_data[k] = body[k]
    res = await db.property_leads.update_one({"_id": ObjectId(lead_id)}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property lead not found")
    if "status" in body:
        await db.leads.update_one({"_id": ObjectId(lead_id)}, {"$set": {"status": str(body["status"]).lower()}})
    return {"ok": True}


@api_router.delete("/admin/leads/property/{lead_id}")
async def delete_property_lead(lead_id: str, _user: dict = Depends(require_admin)):
    res = await db.property_leads.delete_one({"_id": ObjectId(lead_id)})
    await db.leads.delete_one({"_id": ObjectId(lead_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Property lead not found")
    return {"ok": True}


# ---------------------- Career Applications ----------------------
@api_router.post("/leads/career", status_code=201)
async def create_career_application(payload: CareerApplicationIn):
    name = (payload.name or "").strip()
    phone = (payload.phone or "").strip()
    email = (payload.email or "").strip().lower()
    job_title = (payload.jobTitle or "").strip()

    if not name:
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required.")
    if not email:
        raise HTTPException(status_code=400, detail="Email address is required.")
    if not job_title:
        raise HTTPException(status_code=400, detail="Position applying for is required.")

    resume_file_id = None
    resume_filename = ""
    resume_url = (payload.resumeUrl or "").strip()

    # Process resume upload if provided (base64)
    if payload.resume and isinstance(payload.resume, dict) and payload.resume.get("base64"):
        raw_b64 = str(payload.resume.get("base64", ""))
        filename = str(payload.resume.get("filename", "resume.pdf"))
        content_type = str(payload.resume.get("contentType", "application/pdf"))

        raw_ext = filename.split(".")[-1].lower() if "." in filename else ""
        if raw_ext not in ["pdf", "doc", "docx"]:
            raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are accepted for resumes.")

        clean_b64 = raw_b64.split(",", 1)[1].strip() if "," in raw_b64 else raw_b64.strip()
        try:
            file_bytes = base64.b64decode(clean_b64)
        except Exception:
            raise HTTPException(status_code=400, detail="Malformed base64 resume file data.")

        if not file_bytes or len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded resume file is empty or invalid.")
        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Resume file must be less than 10MB.")

        # Sanitize filename
        safe_filename = re.sub(r"[/\\?%*:|\"<>]", "_", filename)
        safe_filename = re.sub(r"[^a-zA-Z0-9._-]", "_", safe_filename)

        fs = AsyncIOMotorGridFSBucket(db, bucket_name="career_resumes")
        grid_in = fs.open_upload_stream(
            safe_filename,
            metadata={"uploadedAt": now_utc_iso(), "contentType": content_type}
        )
        await grid_in.write(file_bytes)
        await grid_in.close()

        resume_file_id = str(grid_in._id)
        resume_filename = safe_filename

    app_oid = ObjectId()
    app_id = str(app_oid)
    if resume_file_id:
        resume_url = f"/api/admin/leads/career/{app_id}/resume"

    doc = {
        "_id": app_oid,
        "name": name,
        "phone": phone,
        "email": email,
        "jobTitle": job_title,
        "department": (payload.department or "Advisory & Client Relations").strip(),
        "experience": (payload.experience or "Not specified").strip(),
        "location": (payload.location or "Kolkata").strip(),
        "resumeUrl": resume_url,
        "resumeFilename": resume_filename,
        "resumeFileId": resume_file_id,
        "coverLetter": (payload.coverLetter or "").strip(),
        "source": payload.source or "career-portal",
        "status": "New",
        "notes": "",
        "createdAt": now_utc_iso(),
        "updatedAt": now_utc_iso(),
    }

    try:
        await db.career_applications.insert_one(doc)
    except Exception as exc:
        if resume_file_id:
            try:
                fs = AsyncIOMotorGridFSBucket(db, bucket_name="career_resumes")
                await fs.delete(ObjectId(resume_file_id))
            except Exception:
                pass
        logger.error(f"Failed to insert career application: {exc}")
        raise HTTPException(status_code=500, detail="Failed to submit career application")

    return {
        "id": app_id,
        "ok": True,
        "message": "Application submitted successfully. Our talent team will review your profile.",
    }


@api_router.get("/admin/leads/career")
async def list_career_applications(_user: dict = Depends(require_staff)):
    docs = await db.career_applications.find({}).sort("createdAt", -1).to_list(1000)
    return [
        {
            "id": str(d["_id"]),
            "_id": str(d["_id"]),
            "name": d.get("name", ""),
            "phone": d.get("phone", ""),
            "email": d.get("email", ""),
            "jobTitle": d.get("jobTitle", ""),
            "department": d.get("department", ""),
            "experience": d.get("experience", ""),
            "location": d.get("location", ""),
            "resumeUrl": d.get("resumeUrl") or (f"/api/admin/leads/career/{d['_id']}/resume" if d.get("resumeFileId") else ""),
            "resumeFilename": d.get("resumeFilename", ""),
            "hasResumeFile": bool(d.get("resumeFileId") or (d.get("resumeUrl") and "/resume" in str(d.get("resumeUrl")))),
            "coverLetter": d.get("coverLetter", ""),
            "source": d.get("source", "career-portal"),
            "status": d.get("status", "New"),
            "notes": d.get("notes", ""),
            "createdAt": d.get("createdAt"),
            "updatedAt": d.get("updatedAt"),
        }
        for d in docs
    ]


@api_router.get("/admin/leads/career/{app_id}")
async def get_career_application(app_id: str, _user: dict = Depends(require_staff)):
    try:
        app_oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid career application ID")

    d = await db.career_applications.find_one({"_id": app_oid})
    if not d:
        raise HTTPException(status_code=404, detail="Career application not found")
    return {
        "id": str(d["_id"]),
        "_id": str(d["_id"]),
        "name": d.get("name", ""),
        "phone": d.get("phone", ""),
        "email": d.get("email", ""),
        "jobTitle": d.get("jobTitle", ""),
        "department": d.get("department", ""),
        "experience": d.get("experience", ""),
        "location": d.get("location", ""),
        "resumeUrl": d.get("resumeUrl") or (f"/api/admin/leads/career/{d['_id']}/resume" if d.get("resumeFileId") else ""),
        "resumeFilename": d.get("resumeFilename", ""),
        "hasResumeFile": bool(d.get("resumeFileId") or (d.get("resumeUrl") and "/resume" in str(d.get("resumeUrl")))),
        "coverLetter": d.get("coverLetter", ""),
        "source": d.get("source", "career-portal"),
        "status": d.get("status", "New"),
        "notes": d.get("notes", ""),
        "createdAt": d.get("createdAt"),
        "updatedAt": d.get("updatedAt"),
    }


@api_router.get("/admin/leads/career/{app_id}/resume")
async def download_career_resume(app_id: str, _user: dict = Depends(require_staff)):
    try:
        app_oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid career application ID")

    app_doc = await db.career_applications.find_one({"_id": app_oid})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Career application not found")

    file_id = app_doc.get("resumeFileId")
    if not file_id:
        resume_url = app_doc.get("resumeUrl", "")
        if resume_url and resume_url.startswith("http"):
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url=resume_url)
        raise HTTPException(status_code=404, detail="No resume file stored for this application")

    fs = AsyncIOMotorGridFSBucket(db, bucket_name="career_resumes")
    try:
        grid_out = await fs.open_download_stream(ObjectId(file_id))
    except Exception:
        raise HTTPException(status_code=404, detail="Resume file not found in storage")

    content = await grid_out.read()
    content_type = getattr(grid_out, "content_type", None) or (grid_out.metadata.get("contentType") if grid_out.metadata else None) or "application/pdf"
    filename = app_doc.get("resumeFilename") or grid_out.filename or "applicant-resume.pdf"
    encoded_filename = urllib.parse.quote(filename)

    return Response(
        content=content,
        media_type=content_type,
        headers={
            "Content-Disposition": f'attachment; filename="{encoded_filename}"',
            "Content-Length": str(len(content)),
        }
    )


@api_router.patch("/admin/leads/career/{app_id}")
async def update_career_application(app_id: str, body: dict, _user: dict = Depends(require_staff)):
    try:
        app_oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid career application ID")

    update_data = {"updatedAt": now_utc_iso()}
    for k in ["status", "notes"]:
        if k in body:
            update_data[k] = body[k]
    res = await db.career_applications.update_one({"_id": app_oid}, {"$set": update_data})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Career application not found")
    return {"ok": True, "message": "Career application updated"}


@api_router.delete("/admin/leads/career/{app_id}")
async def delete_career_application(app_id: str, _user: dict = Depends(require_admin)):
    try:
        app_oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid career application ID")

    app_doc = await db.career_applications.find_one({"_id": app_oid})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Career application not found")

    file_id = app_doc.get("resumeFileId")
    if file_id:
        try:
            fs = AsyncIOMotorGridFSBucket(db, bucket_name="career_resumes")
            await fs.delete(ObjectId(file_id))
        except Exception as e:
            logger.warning(f"Failed to delete resume file from GridFS: {e}")

    res = await db.career_applications.delete_one({"_id": app_oid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Career application not found")
    return {"ok": True, "message": "Career application deleted"}


# ---------------------- Recruitment & Job Openings Management ----------------------
def slugify_job_title(text: str) -> str:
    if not text:
        return "opening"
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_-]+", "-", s)
    s = re.sub(r"^-+|-+$", "", s)
    return s[:120] or "opening"


def generate_job_app_ref_number() -> str:
    year = datetime.now(timezone.utc).year
    chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    rand = "".join(random.choices(chars, k=5))
    return f"AST-{year}-{rand}"


def serialize_job_opening(doc: dict, is_admin: bool = False) -> dict:
    if not doc:
        return {}
    res = {
        "id": str(doc.get("_id", "")),
        "title": doc.get("title", ""),
        "slug": doc.get("slug", ""),
        "department": doc.get("department", "Sales & Advisory"),
        "location": doc.get("location", "New Town, Kolkata"),
        "employmentType": doc.get("employmentType", "Full-time"),
        "workplaceType": doc.get("workplaceType", "On-site"),
        "experienceLevel": doc.get("experienceLevel", "Mid-Senior Level"),
        "experienceMinYears": doc.get("experienceMinYears", 0),
        "experienceMaxYears": doc.get("experienceMaxYears", 0),
        "salaryRange": doc.get("salaryRange", {
            "min": 0,
            "max": 0,
            "currency": "INR",
            "period": "yearly",
            "isDisclosed": False,
        }),
        "description": doc.get("description", ""),
        "responsibilities": doc.get("responsibilities", []),
        "requirements": doc.get("requirements", []),
        "benefits": doc.get("benefits", []),
        "tags": doc.get("tags", []),
        "status": doc.get("status", "draft"),
        "isFeatured": bool(doc.get("isFeatured", False)),
        "applicationsCount": doc.get("applicationsCount", 0),
        "viewsCount": doc.get("viewsCount", 0),
        "postedAt": doc.get("postedAt"),
        "expiresAt": doc.get("expiresAt"),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", ""),
    }
    if is_admin:
        res["createdBy"] = doc.get("createdBy", "admin")
        res["updatedBy"] = doc.get("updatedBy", "admin")
    return res


def serialize_job_application(doc: dict) -> dict:
    if not doc:
        return {}
    app_id = str(doc.get("_id", ""))
    return {
        "id": app_id,
        "referenceNumber": doc.get("referenceNumber", ""),
        "jobId": str(doc.get("jobId", "")),
        "jobTitle": doc.get("jobTitle", ""),
        "jobSlug": doc.get("jobSlug", ""),
        "name": doc.get("name", ""),
        "email": doc.get("email", ""),
        "phone": doc.get("phone", ""),
        "linkedin": doc.get("linkedin", ""),
        "portfolioUrl": doc.get("portfolioUrl", ""),
        "coverNote": doc.get("coverNote", ""),
        "experienceYears": doc.get("experienceYears", 0),
        "currentCompany": doc.get("currentCompany", ""),
        "currentCtc": doc.get("currentCtc", ""),
        "expectedCtc": doc.get("expectedCtc", ""),
        "noticePeriodDays": doc.get("noticePeriodDays", 0),
        "resumeFilename": doc.get("resumeFilename", ""),
        "resumeContentType": doc.get("resumeContentType", "application/pdf"),
        "resumeSize": doc.get("resumeSize", 0),
        "resumeUrl": doc.get("resumeUrl") or (f"/api/admin/recruitment/applications/{app_id}/resume" if doc.get("resumeFileId") else ""),
        "hasResume": bool(doc.get("resumeFileId")),
        "status": doc.get("status", "New"),
        "statusHistory": doc.get("statusHistory", []),
        "notes": doc.get("notes", []),
        "source": doc.get("source", "job-board"),
        "createdAt": doc.get("createdAt", ""),
        "updatedAt": doc.get("updatedAt", ""),
    }


# Public Job Openings Endpoints
@api_router.get("/jobs")
async def list_public_jobs(
    department: Optional[str] = None,
    employmentType: Optional[str] = None,
    workplaceType: Optional[str] = None,
    location: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
):
    query = {"status": "published"}
    if department and department != "All":
        query["department"] = {"$regex": f"^{re.escape(department.strip())}$", "$options": "i"}
    if employmentType and employmentType != "All":
        query["employmentType"] = {"$regex": f"^{re.escape(employmentType.strip())}$", "$options": "i"}
    if workplaceType and workplaceType != "All":
        query["workplaceType"] = {"$regex": f"^{re.escape(workplaceType.strip())}$", "$options": "i"}
    if location and location != "All":
        query["location"] = {"$regex": re.escape(location.strip()), "$options": "i"}
    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"title": {"$regex": s, "$options": "i"}},
            {"department": {"$regex": s, "$options": "i"}},
            {"location": {"$regex": s, "$options": "i"}},
            {"tags": {"$in": [re.compile(s, re.IGNORECASE)]}},
            {"description": {"$regex": s, "$options": "i"}},
        ]

    page_size = min(max(limit, 1), 100)
    skip_num = max(skip, 0)

    total = await db.job_openings.count_documents(query)
    cursor = db.job_openings.find(query).sort([("isFeatured", -1), ("postedAt", -1), ("createdAt", -1)]).skip(skip_num).limit(page_size)
    docs = await cursor.to_list(page_size)

    # Dynamic filter lists
    all_published = await db.job_openings.find({"status": "published"}, {"department": 1, "location": 1, "employmentType": 1, "workplaceType": 1}).to_list(500)
    departments = sorted(list({j.get("department") for j in all_published if j.get("department")}))
    locations = sorted(list({j.get("location") for j in all_published if j.get("location")}))
    employment_types = sorted(list({j.get("employmentType") for j in all_published if j.get("employmentType")}))

    return {
        "jobs": [serialize_job_opening(d, False) for d in docs],
        "total": total,
        "departments": departments,
        "locations": locations,
        "employmentTypes": employment_types,
    }


@api_router.get("/jobs/{slug}")
async def get_public_job(slug: str):
    clean_slug = slug.strip().lower()
    doc = await db.job_openings.find_one({"slug": clean_slug, "status": "published"})
    if not doc:
        try:
            doc = await db.job_openings.find_one({"_id": ObjectId(slug), "status": "published"})
        except Exception:
            pass

    if not doc:
        raise HTTPException(status_code=404, detail="Job opening not found or no longer active")

    # Increment viewsCount non-blocking
    try:
        await db.job_openings.update_one({"_id": doc["_id"]}, {"$inc": {"viewsCount": 1}})
    except Exception:
        pass

    return serialize_job_opening(doc, False)


@api_router.post("/jobs/{job_id}/apply", status_code=201)
async def apply_to_job(job_id: str, payload: JobApplicationIn, request: Request):
    job_doc = None
    try:
        job_doc = await db.job_openings.find_one({"_id": ObjectId(job_id), "status": "published"})
    except Exception:
        pass
    if not job_doc:
        job_doc = await db.job_openings.find_one({"slug": job_id.strip().lower(), "status": "published"})

    if not job_doc:
        raise HTTPException(status_code=404, detail="Job opening not found or is no longer accepting applications")

    name = payload.name.strip()
    email = payload.email.strip().lower()
    phone = payload.phone.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Full name is required.")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email address is required.")
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required.")

    # Duplicate check in last 24h
    twenty_four_hours_ago = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    existing = await db.job_applications.find_one({
        "jobId": job_doc["_id"],
        "email": email,
        "createdAt": {"$gte": twenty_four_hours_ago},
    })
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"You have already applied for this position within the last 24 hours. Your application reference is {existing.get('referenceNumber')}."
        )

    # Process resume upload
    resume_file_id = None
    resume_filename = ""
    resume_content_type = "application/pdf"
    resume_size = 0

    if payload.resume and isinstance(payload.resume, dict) and payload.resume.get("base64"):
        raw_b64 = str(payload.resume.get("base64", ""))
        filename = str(payload.resume.get("filename", "resume.pdf"))
        content_type = str(payload.resume.get("contentType", "application/pdf"))

        raw_ext = filename.split(".")[-1].lower() if "." in filename else ""
        if raw_ext not in ["pdf", "doc", "docx"]:
            raise HTTPException(status_code=400, detail="Only PDF, DOC, and DOCX files are accepted for resumes.")

        clean_b64 = raw_b64.split(",", 1)[1].strip() if "," in raw_b64 else raw_b64.strip()
        try:
            file_bytes = base64.b64decode(clean_b64)
        except Exception:
            raise HTTPException(status_code=400, detail="Malformed base64 resume file data.")

        if not file_bytes or len(file_bytes) == 0:
            raise HTTPException(status_code=400, detail="Uploaded resume file is empty or invalid.")
        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Resume file must be less than 10MB.")

        safe_filename = re.sub(r"[/\\?%*:|\"<>]", "_", filename)
        safe_filename = re.sub(r"[^a-zA-Z0-9._-]", "_", safe_filename)

        fs = AsyncIOMotorGridFSBucket(db, bucket_name="career_resumes")
        grid_in = fs.open_upload_stream(
            safe_filename,
            metadata={"uploadedAt": now_utc_iso(), "contentType": content_type}
        )
        await grid_in.write(file_bytes)
        await grid_in.close()

        resume_file_id = str(grid_in._id)
        resume_filename = safe_filename
        resume_content_type = content_type
        resume_size = len(file_bytes)
    elif not payload.resumeUrl and not payload.linkedin:
        raise HTTPException(status_code=400, detail="Please upload your resume file (PDF, DOC, or DOCX) to apply.")

    inserted_oid = ObjectId()
    ref_number = generate_job_app_ref_number()
    resume_url = f"/api/admin/recruitment/applications/{str(inserted_oid)}/resume" if resume_file_id else (payload.resumeUrl or payload.linkedin or "")

    now_iso = now_utc_iso()
    application_doc = {
        "_id": inserted_oid,
        "referenceNumber": ref_number,
        "jobId": job_doc["_id"],
        "jobTitle": job_doc.get("title", ""),
        "jobSlug": job_doc.get("slug", ""),
        "name": name,
        "email": email,
        "phone": phone,
        "linkedin": (payload.linkedin or "").strip(),
        "portfolioUrl": (payload.portfolioUrl or "").strip(),
        "coverNote": (payload.coverNote or "").strip(),
        "experienceYears": payload.experienceYears or 0.0,
        "currentCompany": (payload.currentCompany or "").strip(),
        "currentCtc": (payload.currentCtc or "").strip(),
        "expectedCtc": (payload.expectedCtc or "").strip(),
        "noticePeriodDays": payload.noticePeriodDays or 0,
        "resumeFileId": resume_file_id,
        "resumeFilename": resume_filename,
        "resumeContentType": resume_content_type,
        "resumeSize": resume_size,
        "resumeUrl": resume_url,
        "status": "New",
        "statusHistory": [
            {
                "fromStatus": None,
                "toStatus": "New",
                "changedBy": "candidate",
                "changedAt": now_iso,
                "reason": "Application submitted via online portal",
            }
        ],
        "notes": [],
        "source": payload.source or "job-board",
        "ipAddress": request.client.host if request.client else "",
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    await db.job_applications.insert_one(application_doc)
    await db.job_openings.update_one({"_id": job_doc["_id"]}, {"$inc": {"applicationsCount": 1}})

    return {
        "ok": True,
        "message": "Application submitted successfully",
        "referenceNumber": ref_number,
        "applicationId": str(inserted_oid),
        "jobTitle": job_doc.get("title", ""),
    }


# Admin Recruitment Endpoints
@api_router.get("/admin/recruitment/dashboard")
async def recruitment_dashboard(_user: dict = Depends(require_staff)):
    total_jobs = await db.job_openings.count_documents({})
    published_jobs = await db.job_openings.count_documents({"status": "published"})
    draft_jobs = await db.job_openings.count_documents({"status": "draft"})
    closed_jobs = await db.job_openings.count_documents({"status": "closed"})

    total_apps = await db.job_applications.count_documents({})
    new_apps = await db.job_applications.count_documents({"status": {"$regex": "^new$", "$options": "i"}})
    under_review_apps = await db.job_applications.count_documents({"status": {"$regex": "^under review$", "$options": "i"}})
    shortlisted_apps = await db.job_applications.count_documents({"status": {"$regex": "^shortlisted$", "$options": "i"}})
    interview_apps = await db.job_applications.count_documents({"status": {"$regex": "^interview scheduled$", "$options": "i"}})
    selected_apps = await db.job_applications.count_documents({"status": {"$regex": "^selected$", "$options": "i"}})
    rejected_apps = await db.job_applications.count_documents({"status": {"$regex": "^rejected$", "$options": "i"}})
    withdrawn_apps = await db.job_applications.count_documents({"status": {"$regex": "^withdrawn$", "$options": "i"}})

    recent_apps_cursor = db.job_applications.find({}).sort("createdAt", -1).limit(8)
    recent_apps = await recent_apps_cursor.to_list(8)

    recent_jobs_cursor = db.job_openings.find({}).sort("createdAt", -1).limit(5)
    recent_jobs = await recent_jobs_cursor.to_list(5)

    return {
        "summary": {
            "totalJobs": total_jobs,
            "publishedJobs": published_jobs,
            "draftJobs": draft_jobs,
            "closedJobs": closed_jobs,
            "totalApplications": total_apps,
        },
        "byStatus": {
            "new": new_apps,
            "underReview": under_review_apps,
            "shortlisted": shortlisted_apps,
            "interviewScheduled": interview_apps,
            "selected": selected_apps,
            "rejected": rejected_apps,
            "withdrawn": withdrawn_apps,
        },
        "recentApplications": [serialize_job_application(a) for a in recent_apps],
        "recentJobs": [serialize_job_opening(j, True) for j in recent_jobs],
    }


@api_router.get("/admin/recruitment/jobs")
async def list_admin_jobs(
    status: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    _user: dict = Depends(require_staff),
):
    query = {}
    if status and status != "All":
        query["status"] = status.lower()
    if department and department != "All":
        query["department"] = {"$regex": f"^{re.escape(department.strip())}$", "$options": "i"}
    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"title": {"$regex": s, "$options": "i"}},
            {"department": {"$regex": s, "$options": "i"}},
            {"location": {"$regex": s, "$options": "i"}},
            {"tags": {"$in": [re.compile(s, re.IGNORECASE)]}},
        ]

    docs = await db.job_openings.find(query).sort("createdAt", -1).to_list(500)
    return [serialize_job_opening(d, True) for d in docs]


@api_router.post("/admin/recruitment/jobs", status_code=201)
async def create_admin_job(payload: JobOpeningIn, _user: dict = Depends(require_staff)):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Job title is required.")

    base_slug = (payload.slug or slugify_job_title(title)).lower().strip()
    if not base_slug:
        base_slug = "opening"
    final_slug = base_slug
    counter = 1
    while await db.job_openings.find_one({"slug": final_slug}):
        counter += 1
        final_slug = f"{base_slug}-{counter}"

    status = (payload.status or "draft").lower()
    is_published = status == "published"
    now_iso = now_utc_iso()

    doc = {
        "_id": ObjectId(),
        "title": title,
        "slug": final_slug,
        "department": (payload.department or "Sales & Advisory").strip(),
        "location": (payload.location or "New Town, Kolkata").strip(),
        "employmentType": payload.employmentType or "Full-time",
        "workplaceType": payload.workplaceType or "On-site",
        "experienceLevel": payload.experienceLevel or "Mid-Senior Level",
        "experienceMinYears": payload.experienceMinYears or 0,
        "experienceMaxYears": payload.experienceMaxYears or 0,
        "salaryRange": payload.salaryRange or {
            "min": 0,
            "max": 0,
            "currency": "INR",
            "period": "yearly",
            "isDisclosed": False,
        },
        "description": payload.description or "",
        "responsibilities": payload.responsibilities or [],
        "requirements": payload.requirements or [],
        "benefits": payload.benefits or [],
        "tags": payload.tags or [],
        "status": status,
        "isFeatured": bool(payload.isFeatured),
        "applicationsCount": 0,
        "viewsCount": 0,
        "postedAt": now_iso if is_published else None,
        "expiresAt": payload.expiresAt,
        "createdBy": _user.get("email", "admin"),
        "updatedBy": _user.get("email", "admin"),
        "createdAt": now_iso,
        "updatedAt": now_iso,
    }

    await db.job_openings.insert_one(doc)
    return serialize_job_opening(doc, True)


@api_router.get("/admin/recruitment/jobs/{job_id}")
async def get_admin_job(job_id: str, _user: dict = Depends(require_staff)):
    doc = None
    try:
        doc = await db.job_openings.find_one({"_id": ObjectId(job_id)})
    except Exception:
        pass
    if not doc:
        doc = await db.job_openings.find_one({"slug": job_id.lower().strip()})
    if not doc:
        raise HTTPException(status_code=404, detail="Job opening not found")

    return serialize_job_opening(doc, True)


@api_router.patch("/admin/recruitment/jobs/{job_id}")
async def update_admin_job(job_id: str, payload: JobOpeningUpdate, _user: dict = Depends(require_staff)):
    try:
        oid = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job opening ID")

    existing = await db.job_openings.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Job opening not found")

    updates = {"updatedAt": now_utc_iso(), "updatedBy": _user.get("email", "admin")}

    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.slug is not None and payload.slug.strip():
        clean_slug = payload.slug.lower().strip()
        slug_clash = await db.job_openings.find_one({"slug": clean_slug, "_id": {"$ne": oid}})
        if not slug_clash:
            updates["slug"] = clean_slug
    if payload.department is not None:
        updates["department"] = payload.department.strip()
    if payload.location is not None:
        updates["location"] = payload.location.strip()
    if payload.employmentType is not None:
        updates["employmentType"] = payload.employmentType
    if payload.workplaceType is not None:
        updates["workplaceType"] = payload.workplaceType
    if payload.experienceLevel is not None:
        updates["experienceLevel"] = payload.experienceLevel
    if payload.experienceMinYears is not None:
        updates["experienceMinYears"] = payload.experienceMinYears
    if payload.experienceMaxYears is not None:
        updates["experienceMaxYears"] = payload.experienceMaxYears
    if payload.salaryRange is not None:
        updates["salaryRange"] = payload.salaryRange
    if payload.description is not None:
        updates["description"] = payload.description
    if payload.responsibilities is not None:
        updates["responsibilities"] = payload.responsibilities
    if payload.requirements is not None:
        updates["requirements"] = payload.requirements
    if payload.benefits is not None:
        updates["benefits"] = payload.benefits
    if payload.tags is not None:
        updates["tags"] = payload.tags
    if payload.status is not None:
        new_status = payload.status.lower()
        updates["status"] = new_status
        if new_status == "published" and not existing.get("postedAt"):
            updates["postedAt"] = now_utc_iso()
    if payload.isFeatured is not None:
        updates["isFeatured"] = bool(payload.isFeatured)
    if payload.expiresAt is not None:
        updates["expiresAt"] = payload.expiresAt

    await db.job_openings.update_one({"_id": oid}, {"$set": updates})
    updated = await db.job_openings.find_one({"_id": oid})
    return serialize_job_opening(updated, True)


@api_router.delete("/admin/recruitment/jobs/{job_id}")
async def delete_admin_job(job_id: str, _user: dict = Depends(require_admin)):
    try:
        oid = ObjectId(job_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job opening ID")

    job = await db.job_openings.find_one({"_id": oid})
    if not job:
        raise HTTPException(status_code=404, detail="Job opening not found")

    app_count = await db.job_applications.count_documents({"jobId": oid})
    if app_count > 0:
        await db.job_openings.update_one(
            {"_id": oid},
            {"$set": {"status": "archived", "updatedAt": now_utc_iso(), "updatedBy": _user.get("email", "admin")}}
        )
        return {
            "ok": True,
            "archived": True,
            "message": f"Job has {app_count} applications on file. Status has been changed to 'archived' to preserve candidate records.",
        }

    await db.job_openings.delete_one({"_id": oid})
    return {"ok": True, "message": "Job opening deleted successfully"}


@api_router.get("/admin/recruitment/applications")
async def list_admin_applications(
    jobId: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    _user: dict = Depends(require_staff),
):
    query = {}
    if jobId and jobId != "All":
        try:
            query["jobId"] = ObjectId(jobId)
        except Exception:
            query["jobSlug"] = jobId
    if status and status != "All":
        query["status"] = {"$regex": f"^{re.escape(status.strip())}$", "$options": "i"}
    if search and search.strip():
        s = search.strip()
        query["$or"] = [
            {"name": {"$regex": s, "$options": "i"}},
            {"email": {"$regex": s, "$options": "i"}},
            {"phone": {"$regex": s, "$options": "i"}},
            {"referenceNumber": {"$regex": s, "$options": "i"}},
            {"currentCompany": {"$regex": s, "$options": "i"}},
            {"jobTitle": {"$regex": s, "$options": "i"}},
        ]

    page_size = min(max(limit, 1), 100)
    page_num = max(page, 1)
    skip_num = (page_num - 1) * page_size

    total = await db.job_applications.count_documents(query)
    cursor = db.job_applications.find(query).sort("createdAt", -1).skip(skip_num).limit(page_size)
    docs = await cursor.to_list(page_size)

    return {
        "applications": [serialize_job_application(d) for d in docs],
        "total": total,
        "page": page_num,
        "totalPages": (total + page_size - 1) // page_size if total > 0 else 1,
    }


@api_router.get("/admin/recruitment/applications/{app_id}")
async def get_admin_application(app_id: str, _user: dict = Depends(require_staff)):
    doc = None
    try:
        doc = await db.job_applications.find_one({"_id": ObjectId(app_id)})
    except Exception:
        pass
    if not doc:
        doc = await db.job_applications.find_one({"referenceNumber": app_id.strip()})
    if not doc:
        raise HTTPException(status_code=404, detail="Job application not found")

    return serialize_job_application(doc)


@api_router.patch("/admin/recruitment/applications/{app_id}/status")
async def update_application_status(
    app_id: str,
    payload: JobApplicationStatusUpdate,
    _user: dict = Depends(require_staff),
):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job application ID")

    app_doc = await db.job_applications.find_one({"_id": oid})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Job application not found")

    valid_statuses = [
        "New",
        "Under Review",
        "Shortlisted",
        "Interview Scheduled",
        "Selected",
        "Rejected",
        "Withdrawn",
    ]
    status_lower = payload.status.lower()
    matched = next((s for s in valid_statuses if s.lower() == status_lower), None)
    if not matched:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    now_iso = now_utc_iso()
    history_entry = {
        "fromStatus": app_doc.get("status"),
        "toStatus": matched,
        "changedBy": _user.get("email", "Recruiter"),
        "changedAt": now_iso,
        "reason": (payload.reason or "").strip() or f"Status updated to {matched}",
    }

    await db.job_applications.update_one(
        {"_id": oid},
        {
            "$set": {"status": matched, "updatedAt": now_iso},
            "$push": {"statusHistory": history_entry},
        }
    )

    return {
        "ok": True,
        "status": matched,
        "message": f"Candidate status updated to {matched}",
    }


@api_router.post("/admin/recruitment/applications/{app_id}/notes")
async def add_application_note(
    app_id: str,
    payload: JobApplicationNoteIn,
    _user: dict = Depends(require_staff),
):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid job application ID")

    app_doc = await db.job_applications.find_one({"_id": oid})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Job application not found")

    note_text = payload.note.strip()
    if not note_text:
        raise HTTPException(status_code=400, detail="Note content cannot be empty.")

    now_iso = now_utc_iso()
    note_item = {
        "id": str(ObjectId()),
        "note": note_text,
        "author": _user.get("name") or _user.get("email") or "Recruiter",
        "createdAt": now_iso,
    }

    await db.job_applications.update_one(
        {"_id": oid},
        {
            "$push": {"notes": note_item},
            "$set": {"updatedAt": now_iso},
        }
    )

    updated = await db.job_applications.find_one({"_id": oid})
    return {"ok": True, "notes": updated.get("notes", [])}


@api_router.get("/admin/recruitment/applications/{app_id}/resume")
async def stream_application_resume(app_id: str, _user: dict = Depends(require_staff)):
    try:
        oid = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid application ID")

    app_doc = await db.job_applications.find_one({"_id": oid})
    if not app_doc:
        raise HTTPException(status_code=404, detail="Job application not found")

    file_id = app_doc.get("resumeFileId")
    if not file_id:
        resume_url = app_doc.get("resumeUrl", "")
        if resume_url and resume_url.startswith("http"):
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url=resume_url)
        raise HTTPException(status_code=404, detail="No resume file stored for this candidate")

    fs = AsyncIOMotorGridFSBucket(db, bucket_name="career_resumes")
    try:
        grid_out = await fs.open_download_stream(ObjectId(file_id))
    except Exception:
        raise HTTPException(status_code=404, detail="Resume file not found in storage")

    content = await grid_out.read()
    content_type = getattr(grid_out, "content_type", None) or (grid_out.metadata.get("contentType") if grid_out.metadata else None) or "application/pdf"
    filename = app_doc.get("resumeFilename") or grid_out.filename or "candidate-resume.pdf"
    encoded_filename = urllib.parse.quote(filename)

    return Response(
        content=content,
        media_type=content_type,
        headers={
            "Content-Disposition": f'inline; filename="{encoded_filename}"',
            "Content-Length": str(len(content)),
        }
    )


# ---------------------- Blogs ----------------------
def slugify(text: str) -> str:
    """URL-safe slug: lowercase, non-alphanumerics → hyphens, trimmed."""
    if not text:
        return ""
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:120] or "blog"


async def ensure_unique_slug(base: str, exclude_id: Optional[str] = None) -> str:
    """Append -2, -3 … until the slug is unique in db.blogs."""
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
    """Lightweight projection used for listing pages — omits the (large) body."""
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


@api_router.get("/blogs")
async def list_blogs(limit: int = 50):
    """Public — list published blogs, newest publish_date first (falls back to created_at)."""
    docs = await db.blogs.find({"status": "published"}).sort(
        [("publish_date", -1), ("created_at", -1)]
    ).to_list(limit)
    return [serialize_blog_summary(d) for d in docs]


@api_router.get("/blogs/{slug}")
async def get_blog_by_slug(slug: str):
    doc = await db.blogs.find_one({"slug": slug, "status": "published"})
    if not doc:
        raise HTTPException(status_code=404, detail="Blog not found")
    return serialize_blog(doc)


@api_router.get("/admin/blogs")
async def admin_list_blogs(_user: dict = Depends(require_staff)):
    docs = await db.blogs.find().sort("created_at", -1).to_list(500)
    return [serialize_blog_summary(d) for d in docs]


@api_router.get("/admin/blogs/{blog_id}")
async def admin_get_blog(blog_id: str, _user: dict = Depends(require_staff)):
    try:
        doc = await db.blogs.find_one({"_id": ObjectId(blog_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    if not doc:
        raise HTTPException(status_code=404, detail="Blog not found")
    return serialize_blog(doc)


@api_router.post("/admin/blogs", status_code=201)
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


@api_router.put("/admin/blogs/{blog_id}")
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


@api_router.patch("/admin/blogs/{blog_id}/status")
async def set_blog_status(blog_id: str, body: dict, _user: dict = Depends(require_staff)):
    status = body.get("status")
    if status not in {"draft", "published"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    update = {"status": status, "updated_at": now_utc_iso()}
    if status == "published":
        # Stamp a publish_date if not already set
        existing = await db.blogs.find_one({"_id": ObjectId(blog_id)}, {"publish_date": 1})
        if existing is not None and not existing.get("publish_date"):
            update["publish_date"] = update["updated_at"][:10]
    res = await db.blogs.update_one({"_id": ObjectId(blog_id)}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"ok": True, "status": status}


@api_router.delete("/admin/blogs/{blog_id}")
async def delete_blog(blog_id: str, _user: dict = Depends(require_admin)):
    res = await db.blogs.delete_one({"_id": ObjectId(blog_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Blog not found")
    return {"ok": True}


# ---------------------- File Upload ----------------------
MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "webp": "image/webp", "gif": "image/gif",
}


@api_router.post("/admin/upload")
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
    await db.files.insert_one({
        "storage_path": stored_path,
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "uploaded_by": user["id"],
        "is_deleted": False,
        "created_at": now_utc_iso(),
    })
    return {"path": stored_path}


# Image Caching & High-Speed Thumbnail Proxy
IMAGE_CACHE_DIR = ROOT_DIR / ".image_cache"
IMAGE_CACHE_DIR.mkdir(parents=True, exist_ok=True)

LUXE_FALLBACK_IMAGES = [
    "luxury_villa.webp",
    "property_tower.webp",
    "property_villa_garden.webp",
    "property_heritage_estate.webp",
    "locations_newtown.webp",
    "locations_rajarhat.webp",
    "biswa_bangla_gate.webp",
    "locations_kolkata.webp",
]

def get_server_fallback_image(seed: str) -> Path:
    h = sum(ord(c) for c in (seed or "")) % len(LUXE_FALLBACK_IMAGES)
    filename = LUXE_FALLBACK_IMAGES[h]
    p1 = ROOT_DIR.parent / "frontend" / "public" / "images" / "luxe" / filename
    if p1.exists():
        return p1
    p2 = ROOT_DIR.parent / "frontend" / "build" / "images" / "luxe" / filename
    if p2.exists():
        return p2
    return p1


@api_router.get("/images/thumbnail")
async def get_image_thumbnail(id: str = Query(...), w: int = Query(600)):
    if not id or not re.match(r"^[a-zA-Z0-9_-]+$", id):
        raise HTTPException(status_code=400, detail="Invalid image ID")

    width = max(100, min(w, 1600))
    cache_file = IMAGE_CACHE_DIR / f"{id}_w{width}.bin"
    meta_file = IMAGE_CACHE_DIR / f"{id}_w{width}.json"

    if cache_file.exists():
        media_type = "image/jpeg"
        try:
            if meta_file.exists():
                meta = json.loads(meta_file.read_text(encoding="utf-8"))
                media_type = meta.get("contentType", media_type)
        except Exception:
            pass
        return FileResponse(
            str(cache_file),
            media_type=media_type,
            headers={"Cache-Control": "public, max-age=2592000, immutable", "X-Cache": "HIT"},
        )

    urls_to_try = [
        f"https://lh3.googleusercontent.com/d/{id}=w{width}",
        f"https://drive.google.com/thumbnail?id={id}&sz=w{width}",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    }

    for target_url in urls_to_try:
        try:
            resp = requests.get(target_url, headers=headers, timeout=3.5, allow_redirects=True)
            if resp.status_code == 200:
                ct = resp.headers.get("Content-Type", "image/jpeg")
                if len(resp.content) > 500 and "text/html" not in ct:
                    try:
                        cache_file.write_bytes(resp.content)
                        meta_file.write_text(json.dumps({"contentType": ct, "isFallback": False}), encoding="utf-8")
                    except Exception:
                        pass
                    return Response(
                        content=resp.content,
                        media_type=ct,
                        headers={"Cache-Control": "public, max-age=2592000, immutable", "X-Cache": "MISS"},
                    )
        except Exception:
            continue

    # Graceful fallback to deterministic local luxury image
    fb_path = get_server_fallback_image(id)
    if fb_path.exists():
        try:
            cache_file.write_bytes(fb_path.read_bytes())
            meta_file.write_text(json.dumps({"contentType": "image/webp", "isFallback": True}), encoding="utf-8")
        except Exception:
            pass
        return FileResponse(
            str(fb_path),
            media_type="image/webp",
            headers={"Cache-Control": "public, max-age=86400", "X-Fallback": "true"},
        )

    return Response(status_code=404)


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    """Publicly serve property images or fallback smoothly for legacy paths."""
    try:
        record = await db.files.find_one({"storage_path": path, "is_deleted": False})
        if record:
            data, content_type = get_object(path)
            return StreamingResponse(
                io.BytesIO(data),
                media_type=record.get("content_type", content_type),
                headers={
                    "Cache-Control": "public, max-age=2592000, stale-while-revalidate=604800",
                },
            )
    except Exception:
        pass

    fb_path = get_server_fallback_image(path)
    if fb_path.exists():
        return FileResponse(
            str(fb_path),
            media_type="image/webp",
            headers={"Cache-Control": "public, max-age=2592000, immutable", "X-Fallback": "true"},
        )
    raise HTTPException(status_code=404, detail="File not found")


# ---------------------- Stats ----------------------
@api_router.get("/admin/stats")
async def stats(_user: dict = Depends(require_staff)):
    prop_total = await db.property_leads.count_documents({})
    prop_new = await db.property_leads.count_documents({"status": {"$regex": "^new$", "$options": "i"}})
    prop_contacted = await db.property_leads.count_documents({"status": {"$regex": "^contacted$", "$options": "i"}})
    prop_site_visit = await db.property_leads.count_documents({"status": {"$regex": "^site visit$", "$options": "i"}})
    prop_converted = await db.property_leads.count_documents({"status": {"$regex": "^converted$", "$options": "i"}})

    career_total = await db.career_applications.count_documents({})
    career_new = await db.career_applications.count_documents({"status": {"$regex": "^new$", "$options": "i"}})
    career_reviewing = await db.career_applications.count_documents({"status": {"$regex": "^reviewing$", "$options": "i"}})
    career_shortlisted = await db.career_applications.count_documents({"status": {"$regex": "^shortlisted$", "$options": "i"}})
    career_interview = await db.career_applications.count_documents({"status": {"$regex": "^interview$", "$options": "i"}})
    career_selected = await db.career_applications.count_documents({"status": {"$regex": "^selected$", "$options": "i"}})

    recruitment_total_jobs = await db.job_openings.count_documents({})
    recruitment_published_jobs = await db.job_openings.count_documents({"status": "published"})
    recruitment_total_apps = await db.job_applications.count_documents({})
    recruitment_new_apps = await db.job_applications.count_documents({"status": {"$regex": "^new$", "$options": "i"}})

    return {
        "properties_total": await db.properties.count_documents({}),
        "properties_published": await db.properties.count_documents({"status": "published"}),
        "property_leads": {
            "total": prop_total,
            "new": prop_new,
            "contacted": prop_contacted,
            "site_visit": prop_site_visit,
            "converted": prop_converted,
        },
        "career_applications": {
            "total": career_total,
            "new": career_new,
            "reviewing": career_reviewing,
            "shortlisted": career_shortlisted,
            "interview": career_interview,
            "selected": career_selected,
        },
        "recruitment": {
            "total_jobs": recruitment_total_jobs,
            "published_jobs": recruitment_published_jobs,
            "total_applications": recruitment_total_apps,
            "new_applications": recruitment_new_apps,
        },
        "leads_total": prop_total,
        "leads_new": prop_new,
        "users_total": await db.users.count_documents({}),
    }


# ---------------------- Root ----------------------
@api_router.get("/")
async def root():
    return {"service": "Astitva Real Estate API", "ok": True}


# ---------------------- Market Intelligence (Google News RSS) ----------------------
@api_router.get("/news/trending")
async def news_trending():
    articles = await fetch_topic(db, "trending")
    return {"articles": articles[:12]}


@api_router.get("/news/all")
async def news_all():
    """Unified classified feed across all topics — for Market Intelligence filterable view."""
    articles = await fetch_all_classified(db)
    last_updated = await latest_fetched_at(db)
    return {"articles": articles, "last_updated": last_updated, "count": len(articles)}


@api_router.get("/news/group/{group}")
async def news_group(group: str):
    if group not in GROUPS:
        raise HTTPException(status_code=400, detail="Invalid group")
    articles = await fetch_group(db, group)
    return {"group": group, "articles": articles}


@api_router.get("/news/topics")
async def news_topics():
    return {"topics": list(TOPICS.keys()), "groups": GROUPS}


@api_router.get("/news/debug")
async def news_debug():
    """Public diagnostic endpoint — pipeline state for Market Intelligence.
    Returns per-topic article counts + last fetched_at + total served by /news/all.
    """
    from datetime import datetime as _dt, timezone as _tz
    now = _dt.now(_tz.utc)
    pipeline = []
    for topic in TOPICS.keys():
        cache = await db.news_cache.find_one({"topic": topic})
        if cache:
            arr = cache.get("articles", [])
            fetched_at = cache.get("fetched_at")
            try:
                age_min = int((now - _dt.fromisoformat(fetched_at)).total_seconds() / 60) if fetched_at else None
            except Exception:
                age_min = None
            pipeline.append({
                "topic": topic,
                "count": len(arr),
                "fetched_at": fetched_at,
                "age_minutes": age_min,
            })
        else:
            pipeline.append({"topic": topic, "count": 0, "fetched_at": None, "age_minutes": None})
    total_articles = await fetch_all_classified(db)
    return {
        "ok": True,
        "timestamp": now.isoformat(),
        "cache_ttl_hours": CACHE_TTL_HOURS,
        "rolling_archive_limit": ROLLING_ARCHIVE_LIMIT,
        "all_feed_total": len(total_articles),
        "topics": pipeline,
    }


@api_router.post("/admin/news/refresh")
async def news_refresh(_user: dict = Depends(require_staff)):
    """Force refresh trending + groups (admin)."""
    await fetch_topic(db, "trending", force=True)
    for g in GROUPS:
        await fetch_group(db, g)
    return {"ok": True, "refreshed_at": now_utc_iso()}


app.include_router(api_router)


# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------
frontend_url = os.environ.get("FRONTEND_URL", "")
allowed = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
if frontend_url and frontend_url not in allowed:
    allowed.append(frontend_url)
# Always allow local dev
for o in ["http://localhost:3000", "http://localhost:5173"]:
    if o not in allowed:
        allowed.append(o)

# Wildcard with credentials is rejected by browsers. If "*" is in the configured list,
# echo the request Origin back via regex (this satisfies credentialed requests from any origin).
if "*" in allowed:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# GZip every response ≥ 500 bytes (JSON payloads, sitemap.xml, blog bodies, …)
# — typical 3-5× bandwidth reduction on API traffic. Runs after CORS so headers
# are set correctly before compression.
app.add_middleware(GZipMiddleware, minimum_size=500, compresslevel=6)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@astitva.com").lower()
    password = os.environ.get("ADMIN_PASSWORD", "Astitva@2026")
    name = os.environ.get("ADMIN_NAME", "Astitva Admin")
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "email": email,
            "password_hash": hash_password(password),
            "name": name,
            "role": "admin",
            "created_at": now_utc_iso(),
        })
        logger.info(f"Seeded admin user: {email}")
    else:
        if not verify_password(password, existing["password_hash"]):
            await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})
            logger.info(f"Updated admin password: {email}")


@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.properties.create_index([("status", 1), ("created_at", -1)])
        await db.properties.create_index("is_featured")
        await db.leads.create_index("created_at")
        await db.login_attempts.create_index("identifier")
        # Dedicated Resale collection indexes
        await db.resale_properties.create_index([("status", 1), ("featured", 1), ("createdAt", -1)])
        await db.resale_properties.create_index("location")
        await db.resale_properties.create_index("city")
        await db.resale_properties.create_index("propertyType")
        await db.resale_properties.create_index("price")
        await db.resale_properties.create_index("createdAt")
        await db.resale_leads.create_index("resalePropertyId")
        await db.resale_leads.create_index("phone")
        await db.resale_leads.create_index("email")
        await db.resale_leads.create_index([("status", 1), ("createdAt", -1)])
        await db.resale_leads.create_index("createdAt")
        # Dedicated Recruitment System indexes (job_openings & job_applications)
        await db.job_openings.create_index("slug", unique=True)
        await db.job_openings.create_index([("status", 1), ("postedAt", -1), ("createdAt", -1)])
        await db.job_openings.create_index("department")
        await db.job_openings.create_index("location")
        await db.job_applications.create_index("referenceNumber", unique=True)
        await db.job_applications.create_index([("jobId", 1), ("createdAt", -1)])
        await db.job_applications.create_index("email")
        await db.job_applications.create_index("phone")
        await db.job_applications.create_index([("status", 1), ("createdAt", -1)])
        await db.job_applications.create_index("createdAt")
        await seed_admin()
        init_storage()
        logger.info("Astitva backend started with recruitment & resale indexes")
    except Exception as e:  # noqa: BLE001
        logger.error(f"Startup error: {e}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Starting Astitva Backend server on port {port}")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
