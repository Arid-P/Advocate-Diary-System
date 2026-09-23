import pytest
from fastapi.testclient import TestClient

from advocatediarysystem.utils.security import hash_password, verify_password


def test_password_security():
    pwd = "SecretPassword123"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert "$" in hashed
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_advocate_signup(client: TestClient):
    payload = {
        "name": "Adv. Rajesh Sharma",
        "enrollment_number": "MAH/1042/2019",
        "email": "rajesh.sharma@example.com",
        "phone": "+919876543210",
        "chamber_address": "Chamber 402, High Court Annex, Mumbai",
        "password": "SecurePassword123",
    }
    response = client.post("/auth/advocate/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Adv. Rajesh Sharma"
    assert data["enrollment_number"] == "MAH/1042/2019"
    assert data["email"] == "rajesh.sharma@example.com"
    assert "id" in data
    assert "password" not in data
    assert "hashed_password" not in data


def test_advocate_signup_duplicate_enrollment(client: TestClient):
    payload1 = {
        "name": "Advocate One",
        "enrollment_number": "DEL/999/2020",
        "email": "one@example.com",
        "phone": "9876543210",
        "chamber_address": "Delhi Chambers",
        "password": "password123",
    }
    client.post("/auth/advocate/signup", json=payload1)

    payload2 = {
        "name": "Advocate Two",
        "enrollment_number": "DEL/999/2020",
        "email": "two@example.com",
        "phone": "9876543211",
        "chamber_address": "Delhi Chambers 2",
        "password": "password123",
    }
    response = client.post("/auth/advocate/signup", json=payload2)
    assert response.status_code == 409
    assert "already registered" in response.json()["detail"].lower()


def test_advocate_login_success(client: TestClient):
    payload = {
        "name": "Adv. Sunita Rao",
        "enrollment_number": "KAR/456/2015",
        "email": "sunita.rao@example.com",
        "phone": "9812345678",
        "chamber_address": "Bengaluru City Civil Court",
        "password": "CorrectPassword123",
    }
    client.post("/auth/advocate/signup", json=payload)

    # Login by enrollment number
    login_resp = client.post(
        "/auth/advocate/login",
        json={"identifier": "KAR/456/2015", "password": "CorrectPassword123"},
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["advocate"]["name"] == "Adv. Sunita Rao"

    # Login by email
    login_resp_email = client.post(
        "/auth/advocate/login",
        json={"identifier": "sunita.rao@example.com", "password": "CorrectPassword123"},
    )
    assert login_resp_email.status_code == 200


def test_advocate_login_invalid_password(client: TestClient):
    payload = {
        "name": "Adv. Priya Sen",
        "enrollment_number": "WB/789/2017",
        "email": "priya.sen@example.com",
        "phone": "9800000000",
        "chamber_address": "Calcutta High Court",
        "password": "CorrectPassword",
    }
    client.post("/auth/advocate/signup", json=payload)

    login_resp = client.post(
        "/auth/advocate/login",
        json={"identifier": "WB/789/2017", "password": "WrongPassword"},
    )
    assert login_resp.status_code == 401
    assert "invalid credentials" in login_resp.json()["detail"].lower()


def test_client_signup_auth(client: TestClient):
    payload = {
        "name": "Manish Verma",
        "phone": "+919876500000",
        "email": "manish@example.com",
        "address": "Apartment 12, Sunrise Residency, Pune",
    }
    response = client.post("/auth/client/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Manish Verma"
    assert data["id"] is not None
