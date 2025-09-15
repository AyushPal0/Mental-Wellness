import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_handle_risk_event_valid(client):
    response = client.post('/api/safety/risk-event', json={
        "user_id": "test_user_123",
        "risk_level": "medium",
        "message": "User reported feeling anxious"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'data' in data

def test_handle_risk_event_missing_user_id(client):
    response = client.post('/api/safety/risk-event', json={
        "risk_level": "high",
        "message": "Emergency situation"
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['status'] == 'error'
    assert 'Missing required fields' in data['message']

def test_handle_risk_event_missing_risk_level(client):
    response = client.post('/api/safety/risk-event', json={
        "user_id": "test_user_123",
        "message": "Feeling down"
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['status'] == 'error'
    assert 'Missing required fields' in data['message']

def test_handle_risk_event_missing_message(client):
    response = client.post('/api/safety/risk-event', json={
        "user_id": "test_user_123",
        "risk_level": "low"
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data['status'] == 'error'
    assert 'Missing required fields' in data['message']

def test_handle_risk_event_empty_request(client):
    response = client.post('/api/safety/risk-event', json={})
    assert response.status_code == 400
    data = response.get_json()
    assert data['status'] == 'error'
    assert 'Missing required fields' in data['message']
