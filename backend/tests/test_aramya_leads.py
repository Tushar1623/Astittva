"""Tests for Aramya Greens lead submission via existing /api/leads endpoint."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
# Fallback: read from frontend .env if not set in process env
if not BASE_URL:
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                    break
    except Exception:
        pass

ADMIN_EMAIL = os.environ.get("ADMIN_TEST_EMAIL", "admin@astitva.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_TEST_PASSWORD", "Astitva@2026")


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_token(session):
    r = session.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    data = r.json()
    token = data.get("token") or data.get("access_token")
    assert token, f"No token in response: {data}"
    return token


def test_aramya_lead_full_payload(session):
    """Aramya form payload creates lead with form/project/source metadata."""
    payload = {
        "prefix": "Mr",
        "first_name": "TEST_Aramya",
        "last_name": "Buyer",
        "phone_code": "+91",
        "phone": "9998887711",
        "email": "leads+9998887711@astittva.in",
        "message": "Site visit — Block A, 3 cottah",
        "project": "Aramya Greens",
        "source": "aramya-greens",
        "form": "Site Visit Enquiry",
    }
    r = session.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code in (200, 201), f"Unexpected status: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("ok") is True
    assert data.get("id")
    assert "crm" in data
    # Save id for cross-test
    pytest.aramya_lead_id = data["id"]
    pytest.aramya_phone = payload["phone"]


def test_homepage_lead_without_form_field_regression(session):
    """Regression: normal homepage lead (no form field) still works."""
    payload = {
        "first_name": "TEST_Homepage",
        "last_name": "User",
        "phone": "9000000001",
        "email": "test_homepage@example.com",
        "source": "homepage",
        "message": "Interested in property",
    }
    r = session.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code in (200, 201), f"Unexpected: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("ok") is True
    assert data.get("id")


def test_site_visit_source_regression(session):
    """Regression: source='site-visit' still resolves to 'Site Visit Request' when no form."""
    payload = {
        "first_name": "TEST_SiteVisit",
        "last_name": "Legacy",
        "phone": "9000000002",
        "email": "test_sv@example.com",
        "source": "site-visit",
        "project": "Legacy Project",
        "message": "Legacy site-visit",
    }
    r = session.post(f"{BASE_URL}/api/leads", json=payload)
    assert r.status_code in (200, 201), f"Unexpected: {r.status_code} {r.text}"
    # Verify _resolve_lead_type by importing directly
    from backend.crm_service import _resolve_lead_type
    assert _resolve_lead_type("site-visit", "Legacy Project", None) == "Site Visit Request"
    assert _resolve_lead_type("aramya-greens", "Aramya Greens", "Site Visit Enquiry") == "Site Visit Enquiry"


def test_aramya_lead_visible_in_admin_api(session, admin_token):
    """Verify Aramya lead surfaces in /api/admin/leads (source+phone only, since
    projection doesn't currently expose first_name/last_name/project/form)."""
    time.sleep(3)
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = session.get(f"{BASE_URL}/api/admin/leads", headers=headers)
    assert r.status_code == 200, f"Admin leads failed: {r.status_code} {r.text}"
    body = r.json()
    leads = body if isinstance(body, list) else body.get("leads") or []
    assert leads
    aramya = [l for l in leads if l.get("source") == "aramya-greens" and l.get("phone") == "9998887711"]
    assert aramya, "Aramya lead not visible in admin listing"
    lead = aramya[0]
    assert lead.get("crm_status") in ("sent", "pending"), f"unexpected crm_status={lead.get('crm_status')}"


def test_aramya_lead_persisted_in_mongo():
    """Verify all metadata (project/form/first_name/last_name) persisted in Mongo."""
    from dotenv import load_dotenv
    load_dotenv("/app/backend/.env")
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient

    async def _fetch():
        c = AsyncIOMotorClient(os.environ["MONGO_URL"])
        db = c[os.environ["DB_NAME"]]
        return await db.leads.find_one(
            {"phone": "9998887711", "source": "aramya-greens"},
            sort=[("created_at", -1)],
        )

    doc = asyncio.get_event_loop().run_until_complete(_fetch()) if False else asyncio.run(_fetch())
    assert doc, "Aramya lead not persisted in Mongo"
    assert doc.get("project") == "Aramya Greens"
    assert doc.get("form") == "Site Visit Enquiry"
    assert doc.get("first_name") == "TEST_Aramya"
    assert doc.get("last_name") == "Buyer"
    assert doc.get("crm_status") == "sent"
    assert doc.get("crm_http_status") == 200
