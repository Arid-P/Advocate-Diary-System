from fastapi.testclient import TestClient


def test_create_client(client: TestClient):
    payload = {
        "name": "Jane Doe",
        "phone": "9876543210",
        "email": "jane@example.com",
        "address": "456 Legal Ave",
    }
    response = client.post("/clients/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Jane Doe"
    assert data["email"] == "jane@example.com"
    assert "id" in data
    assert "created_at" in data


def test_get_client(client: TestClient):
    # First create a client
    payload = {"name": "Bob", "address": "123 Bob St"}
    post_resp = client.post("/clients/", json=payload)
    client_id = post_resp.json()["id"]

    # Then fetch it
    response = client.get(f"/clients/{client_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Bob"


def test_get_client_not_found(client: TestClient):
    response = client.get("/clients/999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_clients(client: TestClient):
    # Create two clients
    client.post("/clients/", json={"name": "Alice", "address": "Address A"})
    client.post("/clients/", json={"name": "Bob", "address": "Address B"})

    response = client.get("/clients/?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2


def test_update_client(client: TestClient):
    # Create client
    post_resp = client.post(
        "/clients/", json={"name": "Charlie", "address": "Address C"}
    )
    client_id = post_resp.json()["id"]

    # Update it
    update_payload = {"name": "Charles"}
    response = client.patch(f"/clients/{client_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["name"] == "Charles"


def test_update_client_not_found(client: TestClient):
    response = client.patch("/clients/999", json={"name": "Ghost"})
    assert response.status_code == 404


def test_delete_client(client: TestClient):
    # Create client
    post_resp = client.post(
        "/clients/", json={"name": "Delete Me", "address": "Trash Can"}
    )
    client_id = post_resp.json()["id"]

    # Delete it
    response = client.delete(f"/clients/{client_id}")
    assert response.status_code == 204

    # Verify it's gone
    get_resp = client.get(f"/clients/{client_id}")
    assert get_resp.status_code == 404


def test_delete_client_not_found(client: TestClient):
    response = client.delete("/clients/999")
    assert response.status_code == 404


def test_portal_lookup_by_id(client: TestClient):
    post_resp = client.post(
        "/clients/", json={"name": "Portal User", "phone": "1122334455", "address": "Portal St"}
    )
    client_id = post_resp.json()["id"]

    response = client.get(f"/clients/portal/lookup?identifier={client_id}")
    assert response.status_code == 200
    assert response.json()["id"] == client_id
    assert response.json()["name"] == "Portal User"


def test_portal_lookup_by_phone(client: TestClient):
    client.post(
        "/clients/", json={"name": "Phone User", "phone": "+919999888877", "address": "Phone St"}
    )

    response = client.get("/clients/portal/lookup?identifier=+919999888877")
    assert response.status_code == 200
    assert response.json()["name"] == "Phone User"
    assert response.json()["phone"] == "+919999888877"


def test_portal_lookup_not_found(client: TestClient):
    response = client.get("/clients/portal/lookup?identifier=nonexistent_9999")
    assert response.status_code == 404
    assert "no client found" in response.json()["detail"].lower()
