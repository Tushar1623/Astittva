"""Astitva Real Estate - Backend API Tests (pytest)
Covers: auth, properties (public+admin), leads, users CRUD (admin-only),
upload + file serve, role-based access control.
"""
import os
import io
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-executor-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@astitva.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Astitva@2026")


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    return data["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def sales_user(session, admin_headers):
    """Create a sales user once for RBAC tests."""
    email = "TEST_sales_user@astitva.com"
    pwd = "Sales@2026"
    # Try create (may already exist)
    r = requests.post(f"{API}/users", json={
        "email": email, "password": pwd, "name": "TEST Sales User", "role": "sales"
    }, headers=admin_headers)
    if r.status_code == 409:
        pass  # already exists from a prior run
    else:
        assert r.status_code == 201, f"sales user create failed: {r.text}"
    # login
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pwd})
    assert r.status_code == 200, f"Sales login failed: {r.text}"
    return {
        "email": email,
        "token": r.json()["access_token"],
        "id": r.json()["user"]["id"],
    }


@pytest.fixture(scope="session")
def sales_headers(sales_user):
    return {"Authorization": f"Bearer {sales_user['token']}", "Content-Type": "application/json"}


# ---------------------------------------------------------------------------
# Health / public
# ---------------------------------------------------------------------------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 20

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-password-xyz"})
        assert r.status_code in (401, 429)

    def test_me_with_bearer(self, admin_headers):
        r = requests.get(f"{API}/auth/me", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"

    def test_me_without_token(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ---------------------------------------------------------------------------
# Properties (public)
# ---------------------------------------------------------------------------
class TestPropertiesPublic:
    def test_list_published(self, session):
        r = session.get(f"{API}/properties")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6, f"Expected >=6 seeded properties, got {len(data)}"
        for p in data:
            assert p["status"] == "published"
            assert "_id" not in p  # ensure mongo _id excluded
            assert "id" in p

    def test_get_detail(self, session):
        r = session.get(f"{API}/properties")
        props = r.json()
        pid = props[0]["id"]
        d = session.get(f"{API}/properties/{pid}")
        assert d.status_code == 200
        assert d.json()["id"] == pid

    def test_get_detail_invalid_id(self, session):
        r = session.get(f"{API}/properties/not-a-real-id")
        assert r.status_code in (400, 404)

    def test_filter_by_city(self, session):
        r = session.get(f"{API}/properties")
        all_props = r.json()
        city = all_props[0]["city"]
        r2 = session.get(f"{API}/properties", params={"city": city})
        assert r2.status_code == 200
        assert all(p["city"] == city for p in r2.json())

    def test_filter_by_type(self, session):
        r = session.get(f"{API}/properties", params={"property_type": "Residential"})
        assert r.status_code == 200
        for p in r.json():
            assert p["property_type"] == "Residential"

    def test_filter_featured(self, session):
        r = session.get(f"{API}/properties", params={"featured": "true"})
        assert r.status_code == 200
        for p in r.json():
            assert p["is_featured"] is True


# ---------------------------------------------------------------------------
# Leads
# ---------------------------------------------------------------------------
class TestLeads:
    @pytest.fixture(scope="class")
    def lead_id(self, session):
        r = session.post(f"{API}/leads", json={
            "name": "TEST Lead User",
            "email": "TEST_lead@example.com",
            "phone": "+91 9999000011",
            "interest": "Aura Skylines",
            "message": "Pls call",
            "source": "test"
        })
        assert r.status_code == 201, r.text
        data = r.json()
        assert data.get("ok") is True
        assert "id" in data
        return data["id"]

    def test_lead_appears_in_admin_list(self, lead_id, admin_headers):
        r = requests.get(f"{API}/admin/leads", headers=admin_headers)
        assert r.status_code == 200
        ids = [l["id"] for l in r.json()]
        assert lead_id in ids

    def test_lead_status_update(self, lead_id, admin_headers):
        r = requests.patch(f"{API}/admin/leads/{lead_id}", json={"status": "contacted"}, headers=admin_headers)
        assert r.status_code == 200
        # verify
        r2 = requests.get(f"{API}/admin/leads", headers=admin_headers)
        rec = next(l for l in r2.json() if l["id"] == lead_id)
        assert rec["status"] == "contacted"

    def test_lead_invalid_status(self, lead_id, admin_headers):
        r = requests.patch(f"{API}/admin/leads/{lead_id}", json={"status": "bogus"}, headers=admin_headers)
        assert r.status_code == 400

    def test_lead_delete_requires_admin(self, lead_id, sales_headers):
        r = requests.delete(f"{API}/admin/leads/{lead_id}", headers=sales_headers)
        assert r.status_code == 403

    def test_lead_delete_admin(self, lead_id, admin_headers):
        r = requests.delete(f"{API}/admin/leads/{lead_id}", headers=admin_headers)
        assert r.status_code == 200

    def test_admin_leads_requires_auth(self):
        r = requests.get(f"{API}/admin/leads")
        assert r.status_code == 401

    def test_lead_with_budget_field(self, session, admin_headers):
        """New: budget field must be saved on create and returned in admin list."""
        budget_value = "₹2-5 Cr"
        r = session.post(f"{API}/leads", json={
            "name": "TEST Budget Lead",
            "email": "TEST_budget_lead@example.com",
            "phone": "+91 9999000099",
            "interest": "Aura Skylines",
            "budget": budget_value,
            "message": "Looking for premium 3BHK",
            "source": "homepage"
        })
        assert r.status_code == 201, r.text
        lid = r.json()["id"]
        # Verify in admin list
        r2 = requests.get(f"{API}/admin/leads", headers=admin_headers)
        assert r2.status_code == 200
        rec = next((l for l in r2.json() if l["id"] == lid), None)
        assert rec is not None, "Lead not present in admin list"
        assert rec["budget"] == budget_value, f"Budget mismatch: got {rec.get('budget')!r}"
        assert rec["name"] == "TEST Budget Lead"
        assert rec["source"] == "homepage"
        # cleanup
        requests.delete(f"{API}/admin/leads/{lid}", headers=admin_headers)

    def test_lead_with_extended_fields(self, session, admin_headers):
        """v3: preferred_locality, investment_purpose, property_type, timeline persist + returned."""
        payload = {
            "name": "TEST Extended Lead",
            "email": "TEST_extended@example.com",
            "phone": "+91 9999000077",
            "interest": "Aura Skylines",
            "budget": "Rs 1-2 Cr",
            "message": "Test extended",
            "source": "homepage",
            "preferred_locality": "New Town",
            "investment_purpose": "Self Use",
            "property_type": "Apartment",
            "timeline": "3-6 months",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 201, r.text
        lid = r.json()["id"]
        r2 = requests.get(f"{API}/admin/leads", headers=admin_headers)
        rec = next((l for l in r2.json() if l["id"] == lid), None)
        assert rec is not None
        assert rec["preferred_locality"] == "New Town"
        assert rec["investment_purpose"] == "Self Use"
        assert rec["property_type"] == "Apartment"
        assert rec["timeline"] == "3-6 months"
        requests.delete(f"{API}/admin/leads/{lid}", headers=admin_headers)

    def test_lead_without_budget_defaults_empty(self, session, admin_headers):
        """Budget is optional - missing field should result in empty string."""
        r = session.post(f"{API}/leads", json={
            "name": "TEST NoBudget Lead",
            "email": "TEST_nobudget@example.com",
            "phone": "+91 9999000088",
            "interest": "",
            "message": "",
            "source": "homepage"
        })
        assert r.status_code == 201, r.text
        lid = r.json()["id"]
        r2 = requests.get(f"{API}/admin/leads", headers=admin_headers)
        rec = next((l for l in r2.json() if l["id"] == lid), None)
        assert rec is not None
        assert rec["budget"] == ""
        requests.delete(f"{API}/admin/leads/{lid}", headers=admin_headers)


# ---------------------------------------------------------------------------
# Users CRUD (admin only)
# ---------------------------------------------------------------------------
class TestUsersRBAC:
    def test_list_users_requires_admin(self, sales_headers):
        r = requests.get(f"{API}/users", headers=sales_headers)
        assert r.status_code == 403

    def test_list_users_admin(self, admin_headers):
        r = requests.get(f"{API}/users", headers=admin_headers)
        assert r.status_code == 200
        emails = [u["email"] for u in r.json()]
        assert ADMIN_EMAIL in emails

    def test_create_user_admin_full_lifecycle(self, admin_headers):
        email = f"TEST_user_{int(time.time())}@astitva.com"
        r = requests.post(f"{API}/users", json={
            "email": email, "password": "Test@1234", "name": "Test Marketing", "role": "marketing"
        }, headers=admin_headers)
        assert r.status_code == 201
        uid = r.json()["id"]

        # GET to verify persistence
        r2 = requests.get(f"{API}/users", headers=admin_headers)
        assert any(u["id"] == uid and u["email"] == email.lower() and u["role"] == "marketing" for u in r2.json())

        # Delete
        r3 = requests.delete(f"{API}/users/{uid}", headers=admin_headers)
        assert r3.status_code == 200

        # Verify gone
        r4 = requests.get(f"{API}/users", headers=admin_headers)
        assert not any(u["id"] == uid for u in r4.json())

    def test_sales_cannot_create_user(self, sales_headers):
        r = requests.post(f"{API}/users", json={
            "email": "TEST_blocked@x.com", "password": "Aa@1234", "name": "X", "role": "marketing"
        }, headers=sales_headers)
        assert r.status_code == 403

    def test_invalid_role(self, admin_headers):
        r = requests.post(f"{API}/users", json={
            "email": "TEST_invalidrole@x.com", "password": "Aa@1234", "name": "X", "role": "superuser"
        }, headers=admin_headers)
        assert r.status_code in (400, 422)


# ---------------------------------------------------------------------------
# Properties admin CRUD
# ---------------------------------------------------------------------------
class TestPropertiesAdmin:
    @pytest.fixture(scope="class")
    def created(self, admin_headers):
        payload = {
            "project_name": "TEST_Project_QA",
            "builder": "TEST Builder",
            "location": "Test Loc",
            "city": "Kolkata",
            "starting_price": 7500000,
            "price_label": "₹75 Lakh+",
            "property_type": "Apartment",
            "property_category": "Premium",
            "description": "Test description for QA",
            "images": [],
            "rera_number": "WBRERA/QA/1",
            "possession_date": "Dec 2027",
            "google_maps_url": "",
            "bedrooms": "3 BHK",
            "area_sqft": "1600 sqft",
            "amenities": ["Pool", "Gym"],
            "status": "draft",
            "is_featured": False,
        }
        r = requests.post(f"{API}/admin/properties", json=payload, headers=admin_headers)
        assert r.status_code == 201, r.text
        return r.json()

    def test_admin_list_includes_draft(self, created, admin_headers):
        r = requests.get(f"{API}/admin/properties", headers=admin_headers)
        assert r.status_code == 200
        ids = [p["id"] for p in r.json()]
        assert created["id"] in ids

    def test_admin_requires_auth(self):
        r = requests.get(f"{API}/admin/properties")
        assert r.status_code == 401

    def test_sales_can_list(self, sales_headers):
        r = requests.get(f"{API}/admin/properties", headers=sales_headers)
        assert r.status_code == 200

    def test_public_does_not_show_draft(self, created, session):
        r = session.get(f"{API}/properties")
        ids = [p["id"] for p in r.json()]
        assert created["id"] not in ids

    def test_publish_status(self, created, admin_headers, session):
        r = requests.patch(f"{API}/admin/properties/{created['id']}/status",
                           json={"status": "published"}, headers=admin_headers)
        assert r.status_code == 200
        # now visible publicly
        r2 = session.get(f"{API}/properties/{created['id']}")
        assert r2.status_code == 200
        assert r2.json()["status"] == "published"

    def test_update(self, created, admin_headers):
        payload = {
            "project_name": "TEST_Project_QA_Updated",
            "builder": "TEST Builder",
            "location": "Test Loc",
            "city": "Kolkata",
            "starting_price": 8000000,
            "price_label": "₹80 Lakh+",
            "property_type": "Apartment",
            "property_category": "Premium",
            "description": "Updated description",
            "images": [], "rera_number": "WBRERA/QA/1",
            "possession_date": "Dec 2027", "google_maps_url": "",
            "bedrooms": "3 BHK", "area_sqft": "1600 sqft",
            "amenities": ["Pool"], "status": "published", "is_featured": True,
        }
        r = requests.put(f"{API}/admin/properties/{created['id']}", json=payload, headers=admin_headers)
        assert r.status_code == 200
        # verify
        r2 = requests.get(f"{API}/admin/properties/{created['id']}", headers=admin_headers)
        assert r2.json()["project_name"] == "TEST_Project_QA_Updated"
        assert r2.json()["is_featured"] is True

    def test_sales_cannot_delete(self, created, sales_headers):
        r = requests.delete(f"{API}/admin/properties/{created['id']}", headers=sales_headers)
        assert r.status_code == 403

    def test_admin_delete(self, created, admin_headers):
        r = requests.delete(f"{API}/admin/properties/{created['id']}", headers=admin_headers)
        assert r.status_code == 200
        # verify
        r2 = requests.get(f"{API}/admin/properties/{created['id']}", headers=admin_headers)
        assert r2.status_code == 404


# ---------------------------------------------------------------------------
# File upload + serve
# ---------------------------------------------------------------------------
class TestUpload:
    def test_upload_and_serve(self, admin_token):
        # 1x1 PNG
        png_bytes = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
            b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\x00\x01"
            b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {"file": ("test.png", io.BytesIO(png_bytes), "image/png")}
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{API}/admin/upload", files=files, headers=headers, timeout=60)
        if r.status_code == 503:
            pytest.skip("Object storage unavailable in test env")
        assert r.status_code == 200, r.text
        path = r.json().get("path")
        assert path
        # serve
        r2 = requests.get(f"{API}/files/{path}", timeout=60)
        assert r2.status_code == 200
        assert r2.content[:8] == b"\x89PNG\r\n\x1a\n"

    def test_upload_requires_auth(self):
        r = requests.post(f"{API}/admin/upload", files={"file": ("t.png", b"x", "image/png")})
        assert r.status_code == 401



# ---------------------------------------------------------------------------
# News / Market Intelligence (v3)
# ---------------------------------------------------------------------------
class TestNews:
    """Google News RSS endpoints. First fetch may be slow (~10-30s), then cached."""

    def test_news_topics(self, session):
        r = session.get(f"{API}/news/topics", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "topics" in data and isinstance(data["topics"], list)
        assert "groups" in data and isinstance(data["groups"], dict)
        # core groups present
        for g in ("local", "india", "global"):
            assert g in data["groups"]

    def test_news_trending(self, session):
        r = session.get(f"{API}/news/trending", timeout=45)
        assert r.status_code == 200
        data = r.json()
        assert "articles" in data
        assert isinstance(data["articles"], list)
        # Empty array is acceptable (network throttling). When present validate shape.
        if data["articles"]:
            art = data["articles"][0]
            assert "title" in art and "link" in art

    @pytest.mark.parametrize("group", ["local", "india", "global"])
    def test_news_group_valid(self, session, group):
        r = session.get(f"{API}/news/group/{group}", timeout=60)
        assert r.status_code == 200
        data = r.json()
        assert data["group"] == group
        assert isinstance(data["articles"], list)

    def test_news_group_invalid(self, session):
        r = session.get(f"{API}/news/group/invalid", timeout=15)
        assert r.status_code == 400

    def test_news_refresh_requires_auth(self):
        r = requests.post(f"{API}/admin/news/refresh", timeout=15)
        assert r.status_code == 401

    def test_news_refresh_admin(self, admin_headers):
        r = requests.post(f"{API}/admin/news/refresh", headers=admin_headers, timeout=120)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert "refreshed_at" in data

    # --- v4: classified feed + classification fields ---
    CLASS_FIELDS = ("city", "country", "category", "impact", "why_it_matters")

    def test_news_all_returns_classified_articles(self, session):
        """v4: /api/news/all unified feed with 5 classification fields per article."""
        r = session.get(f"{API}/news/all", timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "articles" in data and isinstance(data["articles"], list)
        if not data["articles"]:
            pytest.skip("News feed empty (RSS throttled in test env)")
        for art in data["articles"][:5]:
            for f in self.CLASS_FIELDS:
                assert f in art, f"Missing classification field '{f}' in article: {art}"
            assert art["impact"] in {"High", "Medium", "Low"}

    def test_news_trending_includes_classification(self, session):
        """v4: trending must also expose classification fields."""
        r = session.get(f"{API}/news/trending", timeout=60)
        assert r.status_code == 200
        arts = r.json().get("articles", [])
        if not arts:
            pytest.skip("Trending empty (RSS throttle)")
        for art in arts[:3]:
            for f in self.CLASS_FIELDS:
                assert f in art


# ---------------------------------------------------------------------------
# v4: classify() heuristic unit tests (direct import)
# ---------------------------------------------------------------------------
class TestClassifyHeuristic:
    def _classify(self, *args, **kwargs):
        # Import inside test so backend path discovery works under pytest
        import sys
        sys.path.insert(0, "/app/backend")
        from news_service import classify
        return classify(*args, **kwargs)

    def test_category_infrastructure(self):
        c = self._classify("New Metro corridor in Kolkata", "Phase 2 metro launch boosts connectivity", "kolkata")
        assert c["category"] == "Infrastructure"

    def test_category_luxury(self):
        c = self._classify("Luxury penthouse sells in Mumbai", "Ultra-luxury HNI demand surge", "luxury")
        assert c["category"] == "Luxury Property"

    def test_category_commercial(self):
        c = self._classify("Grade A office leasing", "Commercial retail expansion in India", "commercial")
        assert c["category"] == "Commercial Real Estate"

    def test_impact_high_keywords(self):
        c = self._classify("Government approved record housing reform", "Billion dollar approval announced", "policy")
        assert c["impact"] == "High"

    def test_impact_medium_keywords(self):
        c = self._classify("Housing demand growth in Q2", "Rise in residential momentum", "residential")
        assert c["impact"] == "Medium"

    def test_impact_low_default(self):
        c = self._classify("Quiet quarter for housing", "No notable change", "residential")
        assert c["impact"] == "Low"

    def test_city_country_kolkata_india(self):
        c = self._classify("Real estate buzz in New Town Kolkata", "Rajarhat residential", "kolkata")
        assert c["city"] in {"New Town", "Rajarhat", "Kolkata"}
        assert c["country"] == "India"

    def test_city_country_dubai_uae(self):
        c = self._classify("Dubai luxury property boom", "Branded residence demand", "uae")
        assert c["city"] == "Dubai"
        assert c["country"] == "UAE"

    def test_city_country_singapore(self):
        c = self._classify("Singapore property market overview", "", "singapore")
        assert c["city"] == "Singapore"
        assert c["country"] == "Singapore"

    def test_city_country_london_uk(self):
        c = self._classify("London real estate trends", "Prime central demand", "london")
        assert c["city"] == "London"
        assert c["country"] == "UK"

    def test_why_it_matters_only_on_high_impact(self):
        high = self._classify("Approved infrastructure record", "Billion launch", "infrastructure")
        low = self._classify("Quiet market report", "", "infrastructure")
        assert high["impact"] == "High"
        assert high["why_it_matters"] != ""
        assert low["why_it_matters"] == ""


# ---------------------------------------------------------------------------
# v5: state classification + Technology/Economy categories
# ---------------------------------------------------------------------------
class TestClassifyV5:
    def _classify(self, *args, **kwargs):
        import sys
        sys.path.insert(0, "/app/backend")
        from news_service import classify
        return classify(*args, **kwargs)

    def test_state_west_bengal_for_kolkata(self):
        c = self._classify("Kolkata property surge", "", "kolkata")
        assert c["state"] == "West Bengal"

    def test_state_west_bengal_for_new_town(self):
        c = self._classify("New Town Kolkata launch", "", "new_town")
        assert c["state"] == "West Bengal"

    def test_state_west_bengal_for_rajarhat(self):
        c = self._classify("Rajarhat growth update", "", "rajarhat")
        assert c["state"] == "West Bengal"

    def test_state_maharashtra_for_mumbai(self):
        c = self._classify("Mumbai property surge", "", "india_real_estate")
        assert c["state"] == "Maharashtra"

    def test_state_maharashtra_for_pune(self):
        c = self._classify("Pune housing demand", "", "india_real_estate")
        assert c["state"] == "Maharashtra"

    def test_state_karnataka_for_bengaluru(self):
        c = self._classify("Bengaluru tech residential", "", "india_real_estate")
        assert c["state"] == "Karnataka"

    def test_state_greater_london_for_london(self):
        c = self._classify("London prime real estate", "", "london")
        assert c["state"] == "Greater London"

    def test_state_dubai_for_dubai(self):
        c = self._classify("Dubai luxury boom", "", "uae")
        assert c["state"] == "Dubai"

    def test_category_technology(self):
        c = self._classify("PropTech AI digital platform", "blockchain adoption", "india_real_estate")
        assert c["category"] == "Technology"

    def test_category_economy(self):
        c = self._classify("GDP growth and inflation outlook", "Economic growth report", "india_real_estate")
        assert c["category"] == "Economy"


class TestNewsStateField:
    def test_news_all_includes_state(self, session):
        r = session.get(f"{API}/news/all", timeout=120)
        assert r.status_code == 200
        arts = r.json().get("articles", [])
        if not arts:
            pytest.skip("Empty news feed (RSS throttle)")
        for art in arts[:5]:
            assert "state" in art, f"Missing state field in {art}"

    def test_news_trending_includes_state(self, session):
        r = session.get(f"{API}/news/trending", timeout=60)
        assert r.status_code == 200
        arts = r.json().get("articles", [])
        if not arts:
            pytest.skip("Empty trending feed")
        for art in arts[:3]:
            assert "state" in art
