"""Astitva Real Estate - SEO & Dynamic Sitemap Routes
"""
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Response
from config import db, SITE_URL

logger = logging.getLogger("astitva.sitemap")
router = APIRouter(tags=["seo"])

STATIC_SITEMAP_URLS = [
    ("/", "weekly", "1.0"),
    ("/properties", "daily", "0.9"),
    ("/market-intelligence", "daily", "0.8"),
    ("/about", "monthly", "0.6"),
    ("/contact", "monthly", "0.6"),
]


@router.get("/sitemap.xml")
async def sitemap_xml():
    """Dynamic sitemap.xml - includes every published property + static pages."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, changefreq, priority in STATIC_SITEMAP_URLS:
        parts.append(
            f"  <url><loc>{SITE_URL}{path}</loc><lastmod>{today}</lastmod>"
            f"<changefreq>{changefreq}</changefreq><priority>{priority}</priority></url>"
        )
    try:
        cursor = db.properties.find(
            {"status": "published"},
            {"_id": 1, "updated_at": 1, "created_at": 1},
        )
        async for p in cursor:
            pid = str(p["_id"])
            lastmod = p.get("updated_at") or p.get("created_at") or today
            if isinstance(lastmod, str) and "T" in lastmod:
                lastmod = lastmod.split("T", 1)[0]
            parts.append(
                f"  <url><loc>{SITE_URL}/properties/{pid}</loc>"
                f"<lastmod>{lastmod}</lastmod><changefreq>weekly</changefreq>"
                f"<priority>0.8</priority></url>"
            )

        blog_cursor = db.blogs.find(
            {"status": "published"},
            {"slug": 1, "updated_at": 1, "publish_date": 1, "created_at": 1},
        )
        parts.append(
            f"  <url><loc>{SITE_URL}/blogs</loc><lastmod>{today}</lastmod>"
            f"<changefreq>weekly</changefreq><priority>0.7</priority></url>"
        )
        async for b in blog_cursor:
            slug = b.get("slug")
            if not slug:
                continue
            lastmod = b.get("updated_at") or b.get("publish_date") or b.get("created_at") or today
            if isinstance(lastmod, str) and "T" in lastmod:
                lastmod = lastmod.split("T", 1)[0]
            parts.append(
                f"  <url><loc>{SITE_URL}/blogs/{slug}</loc>"
                f"<lastmod>{lastmod}</lastmod><changefreq>monthly</changefreq>"
                f"<priority>0.7</priority></url>"
            )
    except Exception as e:
        logger.exception("sitemap generation failed: %s", e)
    parts.append("</urlset>")
    xml = "\n".join(parts)
    return Response(content=xml, media_type="application/xml")
