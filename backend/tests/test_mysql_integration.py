import os
import uuid

import pytest

pytestmark = pytest.mark.skipif(
    not os.environ.get("MYSQL_DB"),
    reason="MYSQL_DB not set for integration test run",
)


def test_register_login_and_dashboard(client):
    suffix = uuid.uuid4().hex[:10]
    payload = {
        "username": f"pytest_{suffix}",
        "email": f"pytest_{suffix}@example.com",
        "password": "pytest-pass-8",
    }
    reg = client.post("/api/auth/register", json=payload)
    assert reg.status_code == 201, reg.get_json()
    token = reg.get_json()["token"]

    login = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert login.status_code == 200

    auth = {"Authorization": f"Bearer {token}"}
    me = client.get("/api/me", headers=auth)
    assert me.status_code == 200
    assert me.get_json()["user"]["username"] == payload["username"]

    dash = client.get("/api/dashboard", headers=auth)
    assert dash.status_code == 200
    body = dash.get_json()
    assert body["quizzes"]
    assert body["leaderboard"]
