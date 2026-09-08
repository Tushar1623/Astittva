"""Astitva Real Estate - Authentication & User Management Routes
"""
from datetime import datetime, timezone, timedelta
from typing import List
import jwt
from bson import ObjectId
from fastapi import APIRouter, Request, Response, Depends, HTTPException

from config import db, JWT_SECRET, JWT_ALGORITHM, ACCESS_EXPIRES_MIN, VALID_ROLES
from models import LoginIn, RegisterUserIn, UserOut, now_utc_iso
from auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    set_auth_cookies,
    get_current_user,
    require_admin,
)

router = APIRouter(tags=["auth"])


# ---------------------- Auth Routes ----------------------
@router.post("/auth/login")
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
            {
                "$inc": {"count": 1},
                "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()},
            },
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


@router.post("/auth/logout")
async def logout(response: Response, _user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
    }


@router.post("/auth/refresh")
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
        response.set_cookie(
            "access_token",
            access,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=ACCESS_EXPIRES_MIN * 60,
            path="/",
        )
        return {"access_token": access}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------------------- User Management (admin only) ----------------------
@router.get("/users", response_model=List[UserOut])
async def list_users(_admin: dict = Depends(require_admin)):
    users = await db.users.find().sort("created_at", -1).to_list(500)
    return [
        UserOut(
            id=str(u["_id"]),
            email=u["email"],
            name=u["name"],
            role=u["role"],
            created_at=u.get("created_at"),
        )
        for u in users
    ]


@router.post("/users", response_model=UserOut, status_code=201)
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
    return UserOut(
        id=str(res.inserted_id),
        email=email,
        name=payload.name,
        role=payload.role,
        created_at=doc["created_at"],
    )


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete self")
    res = await db.users.delete_one({"_id": ObjectId(user_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}
