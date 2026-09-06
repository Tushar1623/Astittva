"""Backend tests for Blogs module."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-executor-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_TEST_EMAIL", "admin@astitva.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_TEST_PASSWORD", "Astitva@2026")


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed {r.status_code} {r.text}"
    tok = r.json().get("access_token") or r.json().get("token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# Track created blog ids for cleanup
CREATED_IDS = []


@pytest.fixture(scope="module", autouse=True)
def cleanup(admin_headers):
    yield
    for bid in CREATED_IDS:
        try:
            requests.delete(f"{API}/admin/blogs/{bid}", headers=admin_headers)
        except Exception:
            pass


# ---------------------- Public endpoints ----------------------

def test_public_list_blogs():
    r = requests.get(f"{API}/blogs")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    # every returned blog must be published
    for b in data:
        assert b.get("status") == "published"
        assert "slug" in b and "title" in b


def test_public_get_seeded_blog():
    r = requests.get(f"{API}/blogs/kolkata-real-estate-2026-outlook")
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["slug"] == "kolkata-real-estate-2026-outlook"
    assert "body" in d and d["body"]


def test_public_get_nonexistent():
    r = requests.get(f"{API}/blogs/does-not-exist")
    assert r.status_code == 404


# ---------------------- Admin CRUD ----------------------

def test_admin_create_blog(admin_headers):
    payload = {
        "title": "Testing E2E Blog Zeta",
        "body": "<p>Hello world.</p>",
        "short_description": "Test post",
        "status": "draft",
    }
    r = requests.post(f"{API}/admin/blogs", json=payload, headers=admin_headers)
    assert r.status_code == 201, r.text
    d = r.json()
    assert d["slug"] == "testing-e2e-blog-zeta"
    assert d["status"] == "draft"
    assert d["title"] == payload["title"]
    CREATED_IDS.append(d["id"])
    pytest.zeta_id = d["id"]


def test_admin_list_includes_drafts(admin_headers):
    r = requests.get(f"{API}/admin/blogs", headers=admin_headers)
    assert r.status_code == 200
    ids = [b["id"] for b in r.json()]
    assert pytest.zeta_id in ids


def test_admin_get_detail(admin_headers):
    r = requests.get(f"{API}/admin/blogs/{pytest.zeta_id}", headers=admin_headers)
    assert r.status_code == 200
    d = r.json()
    assert d["id"] == pytest.zeta_id
    assert "body" in d


def test_admin_update_blog(admin_headers):
    payload = {
        "title": "Testing E2E Blog Zeta Updated",
        "body": "<p>Updated.</p>",
        "short_description": "Updated",
        "status": "draft",
    }
    r = requests.put(f"{API}/admin/blogs/{pytest.zeta_id}", json=payload, headers=admin_headers)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["title"] == payload["title"]
    assert d["slug"] == "testing-e2e-blog-zeta-updated"


def test_admin_publish_blog(admin_headers):
    r = requests.patch(f"{API}/admin/blogs/{pytest.zeta_id}/status", json={"status": "published"}, headers=admin_headers)
    assert r.status_code == 200, r.text
    # verify via GET
    r2 = requests.get(f"{API}/admin/blogs/{pytest.zeta_id}", headers=admin_headers)
    d = r2.json()
    assert d["status"] == "published"
    assert d.get("publish_date")


def test_public_sees_published(admin_headers):
    # Use current updated slug
    r2 = requests.get(f"{API}/admin/blogs/{pytest.zeta_id}", headers=admin_headers)
    slug = r2.json()["slug"]
    r = requests.get(f"{API}/blogs/{slug}")
    assert r.status_code == 200


def test_admin_delete_blog(admin_headers):
    r = requests.delete(f"{API}/admin/blogs/{pytest.zeta_id}", headers=admin_headers)
    assert r.status_code in (200, 204)
    # confirm gone
    r2 = requests.get(f"{API}/admin/blogs/{pytest.zeta_id}", headers=admin_headers)
    assert r2.status_code == 404
    CREATED_IDS.remove(pytest.zeta_id)


# ---------------------- Slug uniqueness ----------------------

def test_slug_uniqueness(admin_headers):
    payload = {"title": "Test Duplicate", "body": "<p>a</p>", "short_description": "d", "status": "draft"}
    r1 = requests.post(f"{API}/admin/blogs", json=payload, headers=admin_headers)
    assert r1.status_code == 201
    id1 = r1.json()["id"]
    CREATED_IDS.append(id1)
    slug1 = r1.json()["slug"]

    r2 = requests.post(f"{API}/admin/blogs", json=payload, headers=admin_headers)
    assert r2.status_code == 201, r2.text
    id2 = r2.json()["id"]
    CREATED_IDS.append(id2)
    slug2 = r2.json()["slug"]

    assert slug1 == "test-duplicate"
    assert slug2 == "test-duplicate-2"


# ---------------------- Sitemap ----------------------

def test_sitemap_includes_blogs():
    r = requests.get(f"{API}/sitemap.xml")
    assert r.status_code == 200
    body = r.text
    assert "<loc>https://astittva.in/blogs</loc>" in body
    assert "<loc>https://astittva.in/blogs/kolkata-real-estate-2026-outlook</loc>" in body
