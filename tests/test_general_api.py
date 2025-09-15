import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_home(client):
    response = client.get('/')
    assert response.status_code == 200
    data = response.get_json()
    assert 'message' in data
    assert 'Mental Wellness Backend' in data['message']

def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_api_info(client):
    response = client.get('/api/info')
    assert response.status_code == 200
    data = response.get_json()
    assert 'version' in data
    assert 'endpoints' in data

def test_debug_routes(client):
    response = client.get('/debug/routes')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert 'endpoint' in data[0]
    assert 'methods' in data[0]
    assert 'rule' in data[0]
