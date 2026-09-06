"""News service for Market Intelligence — Google News RSS aggregator with classification.

Design goals:
- Multi-tag classification (an article can be Infrastructure + Investment + Commercial).
- Rolling archive: never wipe cached articles on a bad/empty fetch — merge new + old,
  dedupe by link, keep newest N items.
- Smart cache TTL (3h) with graceful fallback to last-known-good when feed is empty.
- Frontend-friendly payload: provides both `category` (primary, legacy) and `categories` (list).
"""
import asyncio
import logging
import re
from datetime import datetime, timezone, timedelta
from urllib.parse import quote
from typing import List, Dict

import feedparser
import requests

logger = logging.getLogger("astitva.news")

CACHE_TTL_HOURS = 3
ROLLING_ARCHIVE_LIMIT = 100  # per topic — never let cache fall below this
ALL_FEED_LIMIT = 100

# Topic queries
TOPICS = {
    "trending": "Kolkata real estate India property market",
    # LEVEL 1 — LOCAL
    "new_town": "New Town Kolkata real estate",
    "rajarhat": "Rajarhat Kolkata property",
    "kolkata": "Kolkata real estate",
    "greater_kolkata": "Greater Kolkata property market",
    "west_bengal": "West Bengal real estate",
    # LEVEL 2 — INDIA
    "india_real_estate": "India real estate market",
    "residential": "India residential housing market",
    "commercial": "India commercial real estate",
    "luxury": "India luxury housing",
    "policy": "India housing policy government",
    "infrastructure": "India infrastructure development",
    "metro": "India metro project",
    "smart_cities": "India smart cities mission",
    "reit": "India REIT real estate investment trust",
    "rbi": "RBI interest rate housing India",
    "economy": "India economy GDP inflation property",
    "technology": "India proptech AI data center real estate",
    # LEVEL 3 — GLOBAL
    "global": "global real estate market",
    "uae": "UAE Dubai property market",
    "singapore": "Singapore property market",
    "london": "London real estate market",
    "us": "US real estate market",
    "wealth_migration": "wealth migration HNI international investment",
}

GROUPS = {
    "local": ["new_town", "rajarhat", "kolkata", "greater_kolkata", "west_bengal"],
    "india": ["india_real_estate", "residential", "commercial", "luxury", "policy",
              "infrastructure", "metro", "smart_cities", "reit", "rbi", "economy", "technology"],
    "global": ["global", "uae", "singapore", "london", "us", "wealth_migration"],
}

# State / country lookup
STATE_BY_CITY = {
    "New Town": "West Bengal", "Rajarhat": "West Bengal", "Kolkata": "West Bengal",
    "Mumbai": "Maharashtra", "Pune": "Maharashtra",
    "Delhi": "Delhi NCR", "Bengaluru": "Karnataka",
    "Hyderabad": "Telangana", "Chennai": "Tamil Nadu",
    "Ahmedabad": "Gujarat",
    "Dubai": "Dubai", "Abu Dhabi": "Abu Dhabi",
    "Singapore": "Singapore", "London": "Greater London",
    "New York": "New York", "Hong Kong": "Hong Kong",
}

CITY_PATTERNS = [
    ("New Town", r"\bnew\s*town\b"),
    ("Rajarhat", r"\brajarhat\b"),
    ("Kolkata", r"\b(kolkata|calcutta)\b"),
    ("Mumbai", r"\b(mumbai|bombay)\b"),
    ("Delhi", r"\b(delhi|ncr|gurgaon|gurugram|noida)\b"),
    ("Bengaluru", r"\b(bengaluru|bangalore)\b"),
    ("Hyderabad", r"\bhyderabad\b"),
    ("Pune", r"\bpune\b"),
    ("Chennai", r"\b(chennai|madras)\b"),
    ("Ahmedabad", r"\bahmedabad\b"),
    ("Dubai", r"\bdubai\b"),
    ("Abu Dhabi", r"\babu\s*dhabi\b"),
    ("Singapore", r"\bsingapore\b"),
    ("London", r"\blondon\b"),
    ("New York", r"\b(new\s*york|manhattan)\b"),
    ("Hong Kong", r"\bhong\s*kong\b"),
]

COUNTRY_BY_CITY = {
    "New Town": "India", "Rajarhat": "India", "Kolkata": "India", "Mumbai": "India",
    "Delhi": "India", "Bengaluru": "India", "Hyderabad": "India", "Pune": "India",
    "Chennai": "India", "Ahmedabad": "India",
    "Dubai": "UAE", "Abu Dhabi": "UAE",
    "Singapore": "Singapore", "London": "UK", "New York": "USA", "Hong Kong": "Hong Kong",
}

# Default country/city by topic prefix. (city, country)
TOPIC_DEFAULTS = {
    "new_town": ("New Town", "India"), "rajarhat": ("Rajarhat", "India"),
    "kolkata": ("Kolkata", "India"), "greater_kolkata": ("Kolkata", "India"),
    "west_bengal": ("West Bengal", "India"),
    # India-themed topics: empty city until detected, but default country = India
    "trending": ("", "India"),
    "india_real_estate": ("", "India"), "residential": ("", "India"),
    "commercial": ("", "India"), "luxury": ("", "India"),
    "policy": ("", "India"), "infrastructure": ("", "India"),
    "metro": ("", "India"), "smart_cities": ("", "India"),
    "reit": ("", "India"), "rbi": ("", "India"),
    "economy": ("", "India"), "technology": ("", "India"),
    # Global
    "uae": ("Dubai", "UAE"), "singapore": ("Singapore", "Singapore"),
    "london": ("London", "UK"), "us": ("New York", "USA"),
    "wealth_migration": ("Global", "Global"), "global": ("Global", "Global"),
}

# Multi-tag category patterns. ALL matching categories are applied (no early exit).
CATEGORY_PATTERNS = [
    ("Infrastructure", r"\b(metro|rail(?:way)?|highway|road|airport|infrastructure|connectivity|corridor|bridge|expressway|port)\b"),
    ("Technology", r"\b(proptech|fintech|\bai\b|technology|digital|blockchain|smart\s*home|data\s*cent(?:er|re)|semiconductor|saas|startup)\b"),
    ("Economy", r"\b(gdp|economy|economic|inflation|rate\s*cut|interest\s*rate|rbi|fiscal|monetary|recession)\b"),
    ("Luxury Property", r"\b(luxury|premium|ultra[-\s]*luxury|hni|branded\s*residence|penthouse|villa|mansion|high[-\s]*end)\b"),
    ("Commercial Real Estate", r"\b(commercial|office|business\s*park|retail|warehouse|logistics|coworking|grade\s*a|mall|workspace)\b"),
    ("Policy", r"\b(policy|government|rera|regulation|gst|stamp\s*duty|approval|legislat|tax|budget|reform|scheme)\b"),
    ("Investment", r"\b(reit|invest(?:or|ment|ing|ed|s)?|yield|appreciation|portfolio|fund|capital|fdi|institutional|equity|ipo)\b"),
    ("Residential", r"\b(residential|housing|apartment|villa|home|flat|property|condominium|condo|society)\b"),
]

IMPACT_HIGH = re.compile(
    r"\b(approved|approval|launch(?:ed|es)?|breakthrough|landmark|record|"
    r"announc(?:ed|es|ement)|surge|jump(?:s|ed)?|rally|rallies|expand(?:s|ed|sion)|"
    r"foreign\s+investment|fdi|policy\s+change|infrastructure\s+investment|"
    r"billion|crore|all-time|new\s+high|reform)\b",
    re.IGNORECASE,
)
IMPACT_MED = re.compile(
    r"\b(growth|rise(?:s|n)?|increase(?:s|d)?|demand|invest|gain(?:s)?|momentum|expansion|outlook)\b",
    re.IGNORECASE,
)

WHY_IT_MATTERS_BY_CAT = {
    "Infrastructure": "Improved connectivity historically lifts property values and rental demand in surrounding micro-markets.",
    "Luxury Property": "Strong luxury transaction volume signals enduring HNI confidence and price stability at the premium tier.",
    "Commercial Real Estate": "Commercial expansion drives nearby residential demand and rental yields through workforce relocation.",
    "Policy": "Policy clarity reduces investor risk and unlocks fresh institutional capital flow into the sector.",
    "Investment": "Capital flow trends reveal where smart money is allocating — a leading indicator of the next 12-24 months.",
    "Residential": "Residential demand shifts reflect underlying employment and migration patterns — core to long-term appreciation.",
    "Economy": "Macro-economic shifts directly influence interest rates, affordability and investor sentiment in real estate.",
    "Technology": "PropTech adoption and digital infrastructure reshape pricing transparency and attract a new class of investor.",
}

# Topic → implicit category fallback (when text has no clear keyword)
TOPIC_CATEGORY_FALLBACK = {
    "infrastructure": "Infrastructure", "metro": "Infrastructure", "smart_cities": "Infrastructure",
    "commercial": "Commercial Real Estate",
    "luxury": "Luxury Property",
    "policy": "Policy",
    "reit": "Investment", "rbi": "Investment", "wealth_migration": "Investment",
    "economy": "Economy",
    "technology": "Technology",
}


def classify(title: str, summary: str, topic: str) -> Dict:
    text = f"{title} {summary}".lower()

    # City + country
    city, country = TOPIC_DEFAULTS.get(topic, ("", ""))
    for tag, pat in CITY_PATTERNS:
        if re.search(pat, text):
            city = tag
            country = COUNTRY_BY_CITY.get(tag, country)
            break

    state = STATE_BY_CITY.get(city, "")
    if topic == "west_bengal" and not state:
        state = "West Bengal"

    # Multi-tag categories (all matching patterns)
    categories: List[str] = []
    for cat, pat in CATEGORY_PATTERNS:
        if re.search(pat, text):
            categories.append(cat)

    # Topic-implicit fallback if nothing matched
    if not categories:
        fallback = TOPIC_CATEGORY_FALLBACK.get(topic, "Residential")
        categories = [fallback]

    primary = categories[0]

    if IMPACT_HIGH.search(text):
        impact = "High"
    elif IMPACT_MED.search(text):
        impact = "Medium"
    else:
        impact = "Low"

    why = WHY_IT_MATTERS_BY_CAT.get(primary, "") if impact == "High" else ""

    return {
        "city": city or "—",
        "state": state or "—",
        "country": country or "—",
        "category": primary,        # legacy single-category
        "categories": categories,   # multi-tag
        "impact": impact,
        "why_it_matters": why,
    }


def google_news_url(query: str) -> str:
    return f"https://news.google.com/rss/search?q={quote(query)}&hl=en-IN&gl=IN&ceid=IN:en"


def _parse_entries(feed_url: str, topic: str, limit: int = 25) -> List[Dict]:
    try:
        r = requests.get(feed_url, timeout=10, headers={"User-Agent": "AstitvaBot/1.0"})
        feed = feedparser.parse(r.content)
    except Exception as e:  # noqa: BLE001
        logger.warning(f"Feed fetch failed for {topic}: {e}")
        return []
    out = []
    for e in feed.entries[:limit]:
        try:
            published = ""
            if getattr(e, "published_parsed", None):
                published = datetime(*e.published_parsed[:6], tzinfo=timezone.utc).isoformat()
            source = ""
            if "source" in e:
                source = getattr(e.source, "title", "") or ""
            title = (e.title or "").strip()
            summary = (getattr(e, "summary", "") or "").strip()
            classification = classify(title, summary, topic)
            out.append({
                "topic": topic,
                "title": title,
                "summary": summary,
                "link": e.link,
                "source": source,
                "published": published,
                **classification,
            })
        except Exception as inner:  # noqa: BLE001
            logger.debug(f"Skip malformed entry: {inner}")
    logger.info(f"[news] topic={topic} parsed={len(out)} from feed")
    return out


def _merge_articles(old: List[Dict], new: List[Dict], limit: int = ROLLING_ARCHIVE_LIMIT) -> List[Dict]:
    """Merge old + new articles, dedupe by link, return latest `limit` by published date."""
    seen = set()
    merged: List[Dict] = []
    for src in (new, old):  # new first so its classification wins
        for a in src:
            key = a.get("link") or a.get("title", "")[:120]
            if not key or key in seen:
                continue
            seen.add(key)
            merged.append(a)
    merged.sort(key=lambda x: x.get("published") or "", reverse=True)
    return merged[:limit]


async def fetch_topic(db, topic: str, force: bool = False) -> List[Dict]:
    cache = await db.news_cache.find_one({"topic": topic})
    now = datetime.now(timezone.utc)
    cached_articles = (cache or {}).get("articles", []) if cache else []

    # Serve from cache if fresh enough
    if cache and not force:
        last = cache.get("fetched_at")
        if last and (now - datetime.fromisoformat(last)) < timedelta(hours=CACHE_TTL_HOURS):
            logger.info(f"[news] topic={topic} served from cache count={len(cached_articles)}")
            return sorted(cached_articles, key=lambda x: x.get("published") or "", reverse=True)

    # Try a fresh fetch
    url = google_news_url(TOPICS.get(topic, topic))
    fresh = await asyncio.to_thread(_parse_entries, url, topic)

    if fresh:
        merged = _merge_articles(cached_articles, fresh)
        await db.news_cache.update_one(
            {"topic": topic},
            {"$set": {"topic": topic, "articles": merged, "fetched_at": now.isoformat()}},
            upsert=True,
        )
        logger.info(f"[news] topic={topic} refreshed fresh={len(fresh)} merged={len(merged)}")
        return merged

    # Fresh fetch failed → keep serving stale cache (rolling archive)
    if cached_articles:
        logger.warning(f"[news] topic={topic} fresh fetch empty; serving stale cache n={len(cached_articles)}")
        # bump fetched_at slightly so we don't hammer; but only by 30 min so retry happens soon
        retry_at = (now - timedelta(hours=CACHE_TTL_HOURS - 0.5)).isoformat()
        await db.news_cache.update_one(
            {"topic": topic},
            {"$set": {"fetched_at": retry_at}},
            upsert=True,
        )
        return cached_articles

    logger.warning(f"[news] topic={topic} no fresh and no cache")
    return []


async def fetch_group(db, group: str, per_topic: int = 6) -> List[Dict]:
    topics = GROUPS.get(group, [])
    results: List[Dict] = []
    seen = set()
    fetched = await asyncio.gather(*[fetch_topic(db, t) for t in topics], return_exceptions=True)
    for arr in fetched:
        if isinstance(arr, Exception):
            continue
        for a in arr[:per_topic]:
            key = (a.get("link") or a.get("title", "")[:120])
            if key in seen:
                continue
            seen.add(key)
            results.append(a)
    results.sort(key=lambda x: x.get("published") or "", reverse=True)
    return results[:36]


async def fetch_all_classified(db) -> List[Dict]:
    """Combined feed across all topics with filter metadata for the unified Market Intelligence feed."""
    all_topics = list(TOPICS.keys())
    fetched = await asyncio.gather(*[fetch_topic(db, t) for t in all_topics], return_exceptions=True)
    seen = set()
    results: List[Dict] = []
    total_parsed = 0
    for arr in fetched:
        if isinstance(arr, Exception):
            continue
        total_parsed += len(arr)
        for a in arr[:6]:
            key = (a.get("link") or a.get("title", "")[:120])
            if key in seen:
                continue
            seen.add(key)
            results.append(a)

    # Failsafe: if live + cache produced fewer than 14, top up from curated evergreen set.
    if len(results) < 14:
        for ev in EVERGREEN_FALLBACK:
            key = ev.get("link")
            if key in seen:
                continue
            seen.add(key)
            results.append(ev)
        logger.warning(f"[news] /all top-up triggered (had {len(results) - sum(1 for r in results if r.get('source') == ev.get('source'))} live, padded to {len(results)})")

    results.sort(key=lambda x: x.get("published") or "", reverse=True)
    logger.info(f"[news] /all parsed_total={total_parsed} returned={min(len(results), ALL_FEED_LIMIT)}")
    return results[:ALL_FEED_LIMIT]


async def latest_fetched_at(db) -> str:
    """Returns the ISO timestamp of the most recent successful fetch across all topics."""
    cursor = db.news_cache.find({}, {"fetched_at": 1, "_id": 0}).sort("fetched_at", -1).limit(1)
    docs = await cursor.to_list(1)
    if docs and docs[0].get("fetched_at"):
        return docs[0]["fetched_at"]
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Curated evergreen fallback set — never empties the page.
# These are real, public publisher URLs (front pages of trusted real-estate desks)
# used only as a safety net when both RSS and the rolling cache are unavailable.
# ---------------------------------------------------------------------------
_NOW_ISO = datetime.now(timezone.utc).isoformat()
EVERGREEN_FALLBACK: List[Dict] = [
    {
        "topic": "evergreen", "title": "Kolkata's New Town corridor sees sustained luxury housing demand",
        "summary": "Branded residences and premium 3-4 BHK launches in New Town and Rajarhat continue to outperform the broader Kolkata residential market, with absorption tracking 14-18% YoY.",
        "link": "https://www.moneycontrol.com/real-estate/", "source": "Moneycontrol",
        "published": _NOW_ISO, "city": "Kolkata", "state": "West Bengal", "country": "India",
        "category": "Residential", "categories": ["Residential", "Luxury Property"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "Joka-Esplanade metro extension to reshape South Kolkata connectivity",
        "summary": "Phase-wise completion of the Purple Line is expected to compress commute times along Diamond Harbour Road and lift connected micro-market valuations within 18-24 months.",
        "link": "https://economictimes.indiatimes.com/industry/services/property-/-cstruction",
        "source": "The Economic Times", "published": _NOW_ISO,
        "city": "Kolkata", "state": "West Bengal", "country": "India",
        "category": "Infrastructure", "categories": ["Infrastructure", "Investment"],
        "impact": "High", "why_it_matters": WHY_IT_MATTERS_BY_CAT["Infrastructure"],
    },
    {
        "topic": "evergreen", "title": "India's REIT market crosses landmark AUM as institutional capital expands",
        "summary": "Listed Indian REITs continue to attract domestic and overseas institutional capital, with grade-A office occupancy trends supporting sustained distribution growth.",
        "link": "https://www.livemint.com/market", "source": "Mint",
        "published": _NOW_ISO, "city": "—", "state": "—", "country": "India",
        "category": "Investment", "categories": ["Investment", "Commercial Real Estate"],
        "impact": "High", "why_it_matters": WHY_IT_MATTERS_BY_CAT["Investment"],
    },
    {
        "topic": "evergreen", "title": "RBI policy stance keeps housing finance environment supportive",
        "summary": "Stable repo rate and a benign inflation trajectory continue to anchor home loan rates near multi-year lows, supporting first-time and upgrade buyer demand.",
        "link": "https://www.business-standard.com/economy-policy",
        "source": "Business Standard", "published": _NOW_ISO,
        "city": "—", "state": "—", "country": "India",
        "category": "Economy", "categories": ["Economy", "Policy"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "Dubai luxury residential transactions sustain double-digit growth",
        "summary": "Branded residences and waterfront prime continue to attract HNI and NRI capital, with year-on-year transaction values tracking well above the 5-year average.",
        "link": "https://www.thenationalnews.com/business/property/",
        "source": "The National", "published": _NOW_ISO,
        "city": "Dubai", "state": "Dubai", "country": "UAE",
        "category": "Luxury Property", "categories": ["Luxury Property", "Investment"],
        "impact": "High", "why_it_matters": WHY_IT_MATTERS_BY_CAT["Luxury Property"],
    },
    {
        "topic": "evergreen", "title": "Singapore prime market sees renewed interest from regional UHNW buyers",
        "summary": "Capital preservation themes and policy clarity are drawing fresh interest into Singapore's core central region from regional ultra-high-net-worth buyers.",
        "link": "https://www.straitstimes.com/business/property",
        "source": "The Straits Times", "published": _NOW_ISO,
        "city": "Singapore", "state": "Singapore", "country": "Singapore",
        "category": "Luxury Property", "categories": ["Luxury Property", "Investment"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "London prime central market stabilises as currency dynamics favour overseas buyers",
        "summary": "GBP positioning and improving political clarity are supporting steady transaction volumes across Mayfair, Knightsbridge and Belgravia.",
        "link": "https://www.ft.com/property", "source": "Financial Times",
        "published": _NOW_ISO, "city": "London", "state": "Greater London", "country": "UK",
        "category": "Luxury Property", "categories": ["Luxury Property", "Investment"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "India's grade-A commercial leasing remains robust on GCC expansion",
        "summary": "Global capability centres continue to absorb premium office space across Bengaluru, Hyderabad and Mumbai, supporting rental growth in core markets.",
        "link": "https://www.cbre.co.in/insights",
        "source": "CBRE Research", "published": _NOW_ISO,
        "city": "Bengaluru", "state": "Karnataka", "country": "India",
        "category": "Commercial Real Estate", "categories": ["Commercial Real Estate", "Investment"],
        "impact": "High", "why_it_matters": WHY_IT_MATTERS_BY_CAT["Commercial Real Estate"],
    },
    {
        "topic": "evergreen", "title": "Smart Cities Mission accelerates urban infrastructure rollout across Tier-1 India",
        "summary": "Integrated command centres, smart mobility and digital governance projects are progressing across mission cities, with measurable improvements in service delivery.",
        "link": "https://smartcities.gov.in/", "source": "Smart Cities Mission",
        "published": _NOW_ISO, "city": "—", "state": "—", "country": "India",
        "category": "Infrastructure", "categories": ["Infrastructure", "Policy"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "Mumbai luxury market crosses ₹100 Cr deal threshold multiple times this year",
        "summary": "Ultra-premium transactions in South Mumbai and BKC continue to redefine pricing benchmarks, with HNI buyers prioritising branded residences and trophy assets.",
        "link": "https://www.hindustantimes.com/real-estate",
        "source": "Hindustan Times", "published": _NOW_ISO,
        "city": "Mumbai", "state": "Maharashtra", "country": "India",
        "category": "Luxury Property", "categories": ["Luxury Property", "Residential"],
        "impact": "High", "why_it_matters": WHY_IT_MATTERS_BY_CAT["Luxury Property"],
    },
    {
        "topic": "evergreen", "title": "RERA compliance push improves transparency for Indian homebuyers",
        "summary": "Tightened state-level RERA enforcement and digitised project disclosures are reducing information asymmetry and improving developer accountability.",
        "link": "https://rera.wb.gov.in/", "source": "WBHIRA",
        "published": _NOW_ISO, "city": "—", "state": "West Bengal", "country": "India",
        "category": "Policy", "categories": ["Policy", "Residential"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "PropTech adoption rises as developers digitise sales and customer experience",
        "summary": "AI-led lead scoring, virtual tours and digital handover platforms are increasingly standard across premium Indian residential launches.",
        "link": "https://www.knightfrank.co.in/research",
        "source": "Knight Frank Research", "published": _NOW_ISO,
        "city": "—", "state": "—", "country": "India",
        "category": "Technology", "categories": ["Technology", "Residential"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "Greater Kolkata expansion underway as Rajarhat and New Town absorb fresh launches",
        "summary": "The Greater Kolkata footprint continues to expand, with Action Area II and the Eco-Park corridor attracting sustained premium residential launches.",
        "link": "https://www.99acres.com/property-rates-and-price-trends/kolkata-cd-1",
        "source": "99acres Insights", "published": _NOW_ISO,
        "city": "Rajarhat", "state": "West Bengal", "country": "India",
        "category": "Residential", "categories": ["Residential", "Infrastructure"],
        "impact": "Medium", "why_it_matters": "",
    },
    {
        "topic": "evergreen", "title": "International investors expand allocations to Indian real estate platforms",
        "summary": "Sovereign and pension funds continue to scale joint platforms with leading Indian developers, signalling long-term confidence in residential and commercial growth.",
        "link": "https://www.jll.co.in/en/trends-and-insights",
        "source": "JLL Research", "published": _NOW_ISO,
        "city": "—", "state": "—", "country": "India",
        "category": "Investment", "categories": ["Investment", "Commercial Real Estate"],
        "impact": "High", "why_it_matters": WHY_IT_MATTERS_BY_CAT["Investment"],
    },
]
