from fastapi.testclient import TestClient
from datetime import datetime, timezone

def test_create_hearing(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client A", "address": "Address A"})
    client_id = client_resp.json()["id"]

    case_resp = client.post("/cases/", json={
        "case_number": "C1", "title": "T1", "court": "C1", "opposite_party": "O1", "client_id": client_id
    })
    case_id = case_resp.json()["id"]

    payload = {
        "hearing_date": "2026-10-15T00:00:00Z",
        "stage": "Evidence",
        "summary": "Witness examination",
        "case_id": case_id
    }
    response = client.post("/hearings/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["stage"] == "Evidence"
    assert "id" in data

def test_get_hearing_by_id(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client A", "address": "Address A"})
    client_id = client_resp.json()["id"]
    case_resp = client.post("/cases/", json={"case_number": "C1", "title": "T1", "court": "C", "opposite_party": "O", "client_id": client_id})
    case_id = case_resp.json()["id"]

    hearing_resp = client.post("/hearings/", json={"hearing_date": "2026-10-15T00:00:00Z", "stage": "Arguments", "case_id": case_id})
    hearing_id = hearing_resp.json()["id"]

    response = client.get(f"/hearings/hearing/{hearing_id}")
    assert response.status_code == 200
    assert response.json()["stage"] == "Arguments"

def test_get_hearings_by_case(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client A", "address": "Address A"})
    client_id = client_resp.json()["id"]
    case_resp = client.post("/cases/", json={"case_number": "C1", "title": "T1", "court": "C", "opposite_party": "O", "client_id": client_id})
    case_id = case_resp.json()["id"]

    client.post("/hearings/", json={"hearing_date": "2026-10-15T00:00:00Z", "stage": "First", "case_id": case_id})
    client.post("/hearings/", json={"hearing_date": "2026-11-15T00:00:00Z", "stage": "Second", "case_id": case_id})

    response = client.get(f"/hearings/case/{case_id}")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_update_hearing(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client A", "address": "Address A"})
    client_id = client_resp.json()["id"]
    case_resp = client.post("/cases/", json={"case_number": "C1", "title": "T1", "court": "C", "opposite_party": "O", "client_id": client_id})
    case_id = case_resp.json()["id"]

    hearing_resp = client.post("/hearings/", json={"hearing_date": "2026-10-15T00:00:00Z", "stage": "Initial", "case_id": case_id})
    hearing_id = hearing_resp.json()["id"]

    response = client.patch(f"/hearings/hearing/{hearing_id}", json={"stage": "Final"})
    assert response.status_code == 200
    assert response.json()["stage"] == "Final"

def test_delete_hearing(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client A", "address": "Address A"})
    client_id = client_resp.json()["id"]
    case_resp = client.post("/cases/", json={"case_number": "C1", "title": "T1", "court": "C", "opposite_party": "O", "client_id": client_id})
    case_id = case_resp.json()["id"]

    hearing_resp = client.post("/hearings/", json={"hearing_date": "2026-10-15T00:00:00Z", "stage": "Initial", "case_id": case_id})
    hearing_id = hearing_resp.json()["id"]

    response = client.delete(f"/hearings/{hearing_id}")
    assert response.status_code == 204

    get_resp = client.get(f"/hearings/hearing/{hearing_id}")
    assert get_resp.status_code == 404
