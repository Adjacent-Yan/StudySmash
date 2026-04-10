"""
Integration tests against a real Postgres database (e.g. Supabase).

Export DATABASE_URL before running:
  export DATABASE_URL="postgresql://..."
  pytest tests/test_supabase_integration.py -v

Schema + seed: see backend/supabase/README.md
"""

import os
import uuid

import pytest

pytestmark = pytest.mark.skipif(
    not os.environ.get("DATABASE_URL"),
    reason="DATABASE_URL not set (Supabase Postgres URI required)",
)


def test_quizzes_list_not_empty(client):
    res = client.get("/api/quizzes")
    assert res.status_code == 200
    data = res.get_json()
    assert "quizzes" in data
    assert len(data["quizzes"]) >= 1
    first = data["quizzes"][0]
    assert {"id", "category", "title", "time", "rating", "image", "color"} <= first.keys()


def test_register_login_me_and_dashboard(client):
    suffix = uuid.uuid4().hex[:12]
    username = f"pytest_{suffix}"
    email = f"pytest_{suffix}@example.com"
    password = "pytest-pass-8"

    reg = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    assert reg.status_code == 201, reg.get_json()
    token = reg.get_json()["token"]
    auth = {"Authorization": f"Bearer {token}"}

    bad_login = client.post(
        "/api/auth/login",
        json={"email": email, "password": "wrong-password"},
    )
    assert bad_login.status_code == 401

    good = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert good.status_code == 200

    me = client.get("/api/me", headers=auth)
    assert me.status_code == 200
    assert me.get_json()["user"]["username"] == username
    assert "rank" in me.get_json()["user"]

    dash = client.get("/api/dashboard", headers=auth)
    assert dash.status_code == 200
    body = dash.get_json()
    assert body["user"] is not None
    assert body["user"]["username"] == username
    assert len(body["quizzes"]) >= 1
    assert len(body["leaderboard"]) >= 1
    assert any(entry.get("is_user") for entry in body["leaderboard"])


def test_register_duplicate_email_conflict(client):
    suffix = uuid.uuid4().hex[:12]
    email = f"dup_{suffix}@example.com"
    payload = {
        "username": f"user_a_{suffix}",
        "email": email,
        "password": "longenough1",
    }
    r1 = client.post("/api/auth/register", json=payload)
    assert r1.status_code == 201
    r2 = client.post(
        "/api/auth/register",
        json={**payload, "username": f"user_b_{suffix}"},
    )
    assert r2.status_code == 409
    assert "taken" in (r2.get_json() or {}).get("error", "").lower()
