from models.post import Post

# In-memory "database" for now
posts_db = {}

def create_post(user_id, content, media_url=None):
    post = Post(user_id, content, media_url)
    posts_db[post.id] = post
    return post

def get_all_posts():
    return [post.to_dict() for post in posts_db.values()]

def get_post(post_id):
    post = posts_db.get(post_id)
    return post.to_dict() if post else None

def like_post(post_id):
    post = posts_db.get(post_id)
    if post:
        post.likes += 1
        return post.to_dict()
    return None

def add_comment(post_id, comment_text, commenter_id):
    post = posts_db.get(post_id)
    if post:
        post.comments.append({"user_id": commenter_id, "text": comment_text})
        return post.to_dict()
    return None
