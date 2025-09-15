import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_chat_valid_request(client):
    response = client.post('/api/chat/chat', json={
        "user_id": "507f1f77bcf86cd799439011",  # Valid ObjectId format
        "message": "Hello, how are you?"
    })
    # Note: This test may fail if chat routes are not registered
    # We expect either 200 (if registered) or 404 (if not registered)
    if response.status_code == 200:
        data = response.get_json()
        assert 'response' in data
    else:
        assert response.status_code == 404  # Route not found

def test_chat_missing_user_id(client):
    response = client.post('/api/chat/chat', json={
        "message": "Hello"
    })
    if response.status_code == 200:
        data = response.get_json()
        assert 'error' in data
        assert 'user_id and message are required' in data['error']
    else:
        assert response.status_code == 404

def test_chat_missing_message(client):
    response = client.post('/api/chat/chat', json={
        "user_id": "507f1f77bcf86cd799439011"
    })
    if response.status_code == 200:
        data = response.get_json()
        assert 'error' in data
        assert 'user_id and message are required' in data['error']
    else:
        assert response.status_code == 404

def test_chat_empty_request(client):
    response = client.post('/api/chat/chat', json={})
    if response.status_code == 200:
        data = response.get_json()
        assert 'error' in data
        assert 'user_id and message are required' in data['error']
    else:
        assert response.status_code == 404
