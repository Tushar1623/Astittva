"""Backend tests for Market Intelligence news endpoints.

Covers:
- /api/news/all  — >=50 articles, required fields, multi-tag classification
- /api/news/trending — up to 12 articles
- Country distribution — India dominant, Global/UAE/Singapore/UK present
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://47ae8a7d-f2ae-4ce6-be39-0229474c96e0.preview.emergentagent.com").rstrip("/")

REQUIRED_FIELDS = ["title", "link", "city", "state", "country", "category", "categories", "impact", "published"]


@pytest.fixture(scope="module")
def all_articles():
    r = requests.get(f"{BASE_URL}/api/news/all", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    return data.get("articles", [])


def test_news_all_returns_min_50(all_articles):
    assert len(all_articles) >= 50, f"Expected >=50 articles, got {len(all_articles)}"


def test_news_all_required_fields(all_articles):
    for a in all_articles[:10]:
        for f in REQUIRED_FIELDS:
            assert f in a, f"Missing field {f} in article: {a.get('title','?')[:60]}"
        assert isinstance(a["categories"], list)


def test_multi_tag_classification(all_articles):
    multi = sum(1 for a in all_articles if len(a.get("categories", [])) > 1)
    assert multi >= 1, f"Expected at least 1 multi-tag article, got {multi}"


def test_country_distribution(all_articles):
    counts = {}
    for a in all_articles:
        counts[a.get("country", "—")] = counts.get(a.get("country", "—"), 0) + 1
    assert counts.get("India", 0) > 50, f"India should have >50; got {counts.get('India',0)}"
    foreign = ["UAE", "Singapore", "UK", "USA", "Global"]
    present = [c for c in foreign if counts.get(c, 0) > 0]
    assert len(present) >= 3, f"Expected at least 3 of {foreign}; got {present}"


def test_news_trending_up_to_12():
    r = requests.get(f"{BASE_URL}/api/news/trending", timeout=30)
    assert r.status_code == 200
    articles = r.json().get("articles", [])
    assert 0 < len(articles) <= 12
    for f in REQUIRED_FIELDS:
        assert f in articles[0]
