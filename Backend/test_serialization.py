from services.community_service import serialize_objectid
from bson.objectid import ObjectId

# Test the serialization function
test_obj = {
    '_id': ObjectId('507f1f77bcf86cd799439011'),
    'user_id': ObjectId('507f1f77bcf86cd799439012'),
    'user': {
        '_id': ObjectId('507f1f77bcf86cd799439013'),
        'username': 'testuser'
    },
    'likes': [ObjectId('507f1f77bcf86cd799439014'), ObjectId('507f1f77bcf86cd799439015')],
    'comments': [
        {
            '_id': ObjectId('507f1f77bcf86cd799439016'),
            'user_id': ObjectId('507f1f77bcf86cd799439017'),
            'text': 'test comment'
        }
    ]
}

print('Original object:')
print(f'_id type: {type(test_obj["_id"])}')
print(f'user._id type: {type(test_obj["user"]["_id"])}')

serialized = serialize_objectid(test_obj)
print('\nSerialized object:')
print(f'_id type: {type(serialized["_id"])}')
print(f'user._id type: {type(serialized["user"]["_id"])}')
print(f'likes[0] type: {type(serialized["likes"][0])}')
print(f'comments[0]._id type: {type(serialized["comments"][0]["_id"])}')

# Test JSON serialization
import json
try:
    json_str = json.dumps(serialized)
    print('\nJSON serialization successful!')
    print(f'JSON length: {len(json_str)} characters')
except Exception as e:
    print(f'\nJSON serialization failed: {e}')
