from fastapi.testclient import TestClient
from advocatediarysystem.models.case import CaseStatus

def test_create_case(client: TestClient):
    # Setup client first
    client_resp = client.post("/clients/", json={"name": "Client A", "address": "Address A"})
    client_id = client_resp.json()["id"]

    payload = {
        "case_number": "CASE-001",
        "title": "State vs Client A",
        "court": "High Court",
        "opposite_party": "State",
        "client_id": client_id
    }
    response = client.post("/cases/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["case_number"] == "CASE-001"
    assert data["status"] == "open"

def test_get_case_by_id(client: TestClient):
    # Setup
    client_resp = client.post("/clients/", json={"name": "Client A", "address": "Address A"})
    client_id = client_resp.json()["id"]
    case_resp = client.post("/cases/", json={
        "case_number": "CASE-002",
        "title": "Title 2",
        "court": "Supreme Court",
        "opposite_party": "Opp",
        "client_id": client_id
    })
    case_id = case_resp.json()["id"]

    response = client.get(f"/cases/case/{case_id}")
    assert response.status_code == 200
    assert response.json()["case_number"] == "CASE-002"

def test_get_case_not_found(client: TestClient):
    response = client.get("/cases/case/999")
    assert response.status_code == 404

def test_get_cases_by_client(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client B", "address": "Address B"})
    client_id = client_resp.json()["id"]

    client.post("/cases/", json={"case_number": "C-1", "title": "T1", "court": "C1", "opposite_party": "O1", "client_id": client_id})
    client.post("/cases/", json={"case_number": "C-2", "title": "T2", "court": "C2", "opposite_party": "O2", "client_id": client_id})

    response = client.get(f"/cases/client/{client_id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_get_all_cases(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client C", "address": "Address C"})
    client_id = client_resp.json()["id"]
    client.post("/cases/", json={"case_number": "C-3", "title": "T3", "court": "C3", "opposite_party": "O3", "client_id": client_id})

    response = client.get("/cases/")
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_update_case(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client D", "address": "Address D"})
    client_id = client_resp.json()["id"]
    case_resp = client.post("/cases/", json={
        "case_number": "CASE-OLD",
        "title": "Title OLD",
        "court": "Court",
        "opposite_party": "Opp",
        "client_id": client_id
    })
    case_id = case_resp.json()["id"]

    response = client.patch(f"/cases/case/{case_id}", json={"status": "closed"})
    assert response.status_code == 200
    assert response.json()["status"] == "closed"

def test_delete_case(client: TestClient):
    client_resp = client.post("/clients/", json={"name": "Client E", "address": "Address E"})
    client_id = client_resp.json()["id"]
    case_resp = client.post("/cases/", json={"case_number": "C-DEL", "title": "T-DEL", "court": "C", "opposite_party": "O", "client_id": client_id})
    case_id = case_resp.json()["id"]

    response = client.delete(f"/cases/{case_id}")
    assert response.status_code == 204

    get_resp = client.get(f"/cases/case/{case_id}")
    assert get_resp.status_code == 404
