"""
Performance optimization pass tests (iteration 11):
- GZip compression on JSON endpoints
- WebP variants exist with size caps
- Cache-Control on /api/files/*
- Blog TTFB sanity
"""
import os
import time
import requests
import pytest

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")


# --- GZIP MIDDLEWARE ------------------------------------------------------

class TestGzip:
    """GZipMiddleware active with min_size=500."""

    @pytest.mark.parametrize("endpoint", [
        "/api/blogs",
        "/api/properties",
        "/api/news/all",
    ])
    def test_gzip_content_encoding(self, endpoint):
        r = requests.get(f"{BASE_URL}{endpoint}",
                         headers={"Accept-Encoding": "gzip"},
                         timeout=10)
        assert r.status_code == 200, f"{endpoint} -> {r.status_code}"
        # requests auto-decodes; peek at raw response history header
        enc = r.headers.get("content-encoding", "").lower()
        # Some endpoints may return small payloads (<500B) that skip gzip.
        # If content length is comfortably above 500, gzip must be present.
        raw_len = len(r.content)
        if raw_len >= 500:
            assert "gzip" in enc, f"{endpoint} size={raw_len} but encoding={enc!r}"


# --- WEBP OPTIMISED IMAGES -----------------------------------------------

class TestWebp:
    """WebP variants exist with size caps."""

    def test_desktop_webp_hero(self):
        r = requests.get(f"{BASE_URL}/images/luxe/biswa_bangla_gate.webp",
                         timeout=10)
        assert r.status_code == 200
        assert "image/webp" in r.headers.get("content-type", "")
        assert len(r.content) < 200_000, f"Desktop WebP too large: {len(r.content)}B"

    def test_mobile_webp_hero(self):
        r = requests.get(f"{BASE_URL}/images/luxe/biswa_bangla_gate-mobile.webp",
                         timeout=10)
        assert r.status_code == 200
        assert "image/webp" in r.headers.get("content-type", "")
        assert len(r.content) < 60_000, f"Mobile WebP too large: {len(r.content)}B"

    def test_all_hero_webp_pairs_exist(self):
        heroes = [
            "biswa_bangla_gate", "howrah_bridge", "victoria_memorial",
            "new_town_skyline", "luxury_villa",
        ]
        for name in heroes:
            for suffix in (".webp", "-mobile.webp"):
                url = f"{BASE_URL}/images/luxe/{name}{suffix}"
                r = requests.head(url, timeout=10, allow_redirects=True)
                # Fall back to GET if HEAD is not supported by static server
                if r.status_code >= 400:
                    r = requests.get(url, timeout=10)
                assert r.status_code == 200, f"Missing {url}: {r.status_code}"


# --- CACHE-CONTROL /api/files/* -------------------------------------------

class TestCacheControl:
    """Long-lived Cache-Control on uploaded files."""

    def _find_uploaded_image_path(self):
        """Return a relative /api/files/<path> if any property has an uploaded image."""
        r = requests.get(f"{BASE_URL}/api/properties", timeout=10)
        if r.status_code != 200:
            return None
        for prop in r.json() or []:
            for key in ("images", "gallery", "photos"):
                for img in prop.get(key, []) or []:
                    if isinstance(img, str) and "/api/files/" in img:
                        return img
                    if isinstance(img, dict):
                        url = img.get("url") or img.get("src") or ""
                        if "/api/files/" in url:
                            return url
        return None

    def test_cache_control_header_on_uploaded_file(self):
        img = self._find_uploaded_image_path()
        if not img:
            pytest.skip("No uploaded /api/files/* image found on any property (N/A)")
        full = img if img.startswith("http") else f"{BASE_URL}{img}"
        r = requests.get(full, timeout=10)
        assert r.status_code == 200, f"GET {full} -> {r.status_code}"
        cc = r.headers.get("cache-control", "").lower()
        assert "public" in cc
        assert "max-age=2592000" in cc
        assert "stale-while-revalidate=604800" in cc


# --- TTFB SANITY ----------------------------------------------------------

class TestTtfb:
    def test_blogs_endpoint_under_1500ms(self):
        start = time.perf_counter()
        r = requests.get(f"{BASE_URL}/api/blogs", timeout=10)
        elapsed_ms = (time.perf_counter() - start) * 1000
        assert r.status_code == 200
        assert elapsed_ms < 1500, f"/api/blogs took {elapsed_ms:.0f}ms"
