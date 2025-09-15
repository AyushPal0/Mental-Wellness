import pytest
import json
from backend.app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client

def test_create_post(client):
    response = client.post('/api/community/posts', json={
        "user_id": "test_user_1",
        "content": "This is a test post",
        "media_url": "http://example.com/image.png"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'post' in data
    assert data['post']['content'] == "This is a test post"

def test_get_posts(client):
    response = client.get('/api/community/posts')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    assert isinstance(data['posts'], list)

def test_get_single_post(client):
    # Create a post first
    create_resp = client.post('/api/community/posts', json={
        "user_id": "test_user_2",
        "content": "Single post test"
    })
    post_id = create_resp.get_json()['post']['_id']

    response = client.get(f'/api/community/posts/{post_id}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    assert data['post']['_id'] == post_id

def test_like_post(client):
    # Create a post first
    create_resp = client.post('/api/community/posts', json={
        "user_id": "test_user_3",
        "content": "Like post test"
    })
    post_id = create_resp.get_json()['post']['_id']

    response = client.post(f'/api/community/posts/{post_id}/like')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'likes' in data['post']

def test_comment_post(client):
    # Create a post first
    create_resp = client.post('/api/community/posts', json={
        "user_id": "test_user_4",
        "content": "Comment post test"
    })
    post_id = create_resp.get_json()['post']['_id']

    response = client.post(f'/api/community/posts/{post_id}/comment', json={
        "user_id": "commenter_1",
        "text": "Nice post!"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    assert 'comments' in data['post']
    assert any(comment['text'] == "Nice post!" for comment in data['post']['comments'])
