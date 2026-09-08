"""Astitva Real Estate - Market Intelligence (Google News RSS) & Root Routes
"""
from datetime import datetime as _dt, timezone as _tz
from fastapi import APIRouter, Depends, HTTPException

from config import db
from models import now_utc_iso
from auth import require_staff
from news_service import (
    fetch_topic,
    fetch_group,
    fetch_all_classified,
    latest_fetched_at,
    TOPICS,
    GROUPS,
    CACHE_TTL_HOURS,
    ROLLING_ARCHIVE_LIMIT,
)

router = APIRouter(tags=["news"])


@router.get("/")
async def root():
    return {"service": "Astitva Real Estate API", "ok": True}


@router.get("/news/trending")
async def news_trending():
    articles = await fetch_topic(db, "trending")
    return {"articles": articles[:12]}


@router.get("/news/all")
async def news_all():
    """Unified classified feed across all topics - for Market Intelligence filterable view."""
    articles = await fetch_all_classified(db)
    last_updated = await latest_fetched_at(db)
    return {"articles": articles, "last_updated": last_updated, "count": len(articles)}


@router.get("/news/group/{group}")
async def news_group(group: str):
    if group not in GROUPS:
        raise HTTPException(status_code=400, detail="Invalid group")
    articles = await fetch_group(db, group)
    return {"group": group, "articles": articles}


@router.get("/news/topics")
async def news_topics():
    return {"topics": list(TOPICS.keys()), "groups": GROUPS}


@router.get("/news/debug")
async def news_debug():
    """Public diagnostic endpoint - pipeline state for Market Intelligence."""
    now = _dt.now(_tz.utc)
    pipeline = []
    for topic in TOPICS.keys():
        cache = await db.news_cache.find_one({"topic": topic})
        if cache:
            arr = cache.get("articles", [])
            fetched_at = cache.get("fetched_at")
            try:
                age_min = (
                    int((now - _dt.fromisoformat(fetched_at)).total_seconds() / 60)
                    if fetched_at
                    else None
                )
            except Exception:
                age_min = None
            pipeline.append(
                {
                    "topic": topic,
                    "count": len(arr),
                    "fetched_at": fetched_at,
                    "age_minutes": age_min,
                }
            )
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


@router.post("/admin/news/refresh")
async def news_refresh(_user: dict = Depends(require_staff)):
    """Force refresh trending + groups (admin)."""
    await fetch_topic(db, "trending", force=True)
    for g in GROUPS:
        await fetch_group(db, g)
    return {"ok": True, "refreshed_at": now_utc_iso()}
