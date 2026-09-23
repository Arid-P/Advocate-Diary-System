from fastapi.testclient import TestClient
from advocatediarysystem.main import app

client = TestClient(app)


def test_api_health():
    """Verify that /api/health responds with healthy status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "message" in data


def test_root_serves_frontend():
    """Verify that root / serves index.html."""
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers.get("content-type", "")
    assert "Advocate Diary System" in response.text
    assert "Legal Practice Dashboard" in response.text


def test_static_assets_served():
    """Verify that CSS and JS static assets are served properly."""
    css_var = client.get("/css/variables.css")
    assert css_var.status_code == 200
    assert "--caramel-base" in css_var.text

    css_style = client.get("/css/style.css")
    assert css_style.status_code == 200
    assert ".dashboard-kpi-grid" in css_style.text

    for js in ["api.js", "state.js", "ui.js", "app.js"]:
        res = client.get(f"/js/{js}")
        assert res.status_code == 200


def test_cors_headers_present():
    """Verify that CORS middleware adds access-control-allow-origin header."""
    response = client.get("/api/health", headers={"Origin": "http://localhost:3000"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
